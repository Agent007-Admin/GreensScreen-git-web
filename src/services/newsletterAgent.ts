import { GoogleGenAI, Type } from "@google/genai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { 
  collection, 
  query, 
  where, 
  limit, 
  getDocs, 
  doc, 
  updateDoc, 
  addDoc,
  runTransaction,
  Firestore
} from "firebase/firestore";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class NewsletterAgent {
  private ai: GoogleGenAI;
  private db: Firestore;
  private transporter: any;
  private baseUrl: string;

  constructor(apiKey: string, db: Firestore, transporter: any, baseUrl: string = "") {
    this.ai = new GoogleGenAI({ apiKey });
    this.db = db;
    this.transporter = transporter;
    this.baseUrl = baseUrl;
  }

  /**
   * Proactively process new subscribers who haven't received a welcome email.
   * Uses a transaction to ensure atomicity and prevent duplicate welcome emails.
   */
  async processNewSubscribers() {
    try {
      const subscribersRef = collection(this.db, "subscribers");
      const q = query(subscribersRef, where("status", "==", "pending_welcome"), limit(10));
      const snapshot = await getDocs(q);

      if (snapshot.empty) return;

      console.log(`NewsletterAgent: Processing ${snapshot.size} new subscribers...`);

      for (const docSnap of snapshot.docs) {
        const subscriberId = docSnap.id;
        const subscriberData = docSnap.data();

        // Use a transaction to mark as "processing" or just update status immediately
        // Actually, simpler: update status to 'active' FIRST, then send email.
        // If email fails, we might miss them, but better than spamming.
        // Even better: use a transaction to check status and update it.
        
        await runTransaction(this.db, async (transaction) => {
          const subRef = doc(this.db, "subscribers", subscriberId);
          const subDoc = await transaction.get(subRef);
          
          if (!subDoc.exists()) return;
          if (subDoc.data()?.status !== "pending_welcome") return;

          // Update status immediately to prevent other cron runs from picking it up
          transaction.update(subRef, { 
            status: "active",
            welcomeEmailSentAt: new Date().toISOString()
          });
          
          // We can't easily await an async email send inside a transaction without blocking it,
          // but we can trigger it after the transaction succeeds.
        });

        // Send email AFTER transaction succeeds
        await this.sendWelcomeEmail(subscriberId, subscriberData);
      }
    } catch (error) {
      console.error("NewsletterAgent: Error processing new subscribers:", error);
    }
  }

  private async sendWelcomeEmail(id: string, subscriber: any) {
    if (!this.transporter || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.warn("NewsletterAgent: SMTP credentials (SMTP_USER/SMTP_PASS) are not configured. Skipping welcome email.");
      return;
    }

    try {
      const templatePath = path.join(process.cwd(), "templates", "welcome-email.html");
      let htmlContent = "";
      
      if (fs.existsSync(templatePath)) {
        htmlContent = fs.readFileSync(templatePath, "utf-8");
      } else {
        htmlContent = `<h1>Welcome to Greens Screens Ent!</h1><p>Hi ${subscriber.name || "Player One"}, thanks for joining the frequency.</p><p><a href="{{UNSUBSCRIBE_LINK}}">Unsubscribe</a></p>`;
      }

      // Simple personalization
      htmlContent = htmlContent.replace(/PLAYER ONE/g, (subscriber.name || "PLAYER ONE").toUpperCase());
      
      // Add unsubscribe link
      const unsubLink = `${this.baseUrl}/api/unsubscribe?email=${encodeURIComponent(subscriber.email)}`;
      htmlContent = htmlContent.replace(/{{UNSUBSCRIBE_LINK}}/g, unsubLink);

      await this.transporter.sendMail({
        from: `"Greens Screens Ent" <${process.env.SMTP_USER}>`,
        to: subscriber.email,
        subject: "PLAYER ONE — WELCOME TO GREENS SCREENS ENT",
        html: htmlContent,
      });

      console.log(`NewsletterAgent: Welcome email sent to ${subscriber.email}`);
    } catch (error) {
      console.error(`NewsletterAgent: Failed to send welcome email to ${subscriber.email}:`, error);
    }
  }

  /**
   * Generate and send the monthly newsletter.
   */
  async sendMonthlyNewsletter(targetMonth?: string, targetYear?: string) {
    console.log(`NewsletterAgent: Starting ${targetMonth || 'current'} monthly newsletter generation...`);
    
    const now = new Date();
    const month = targetMonth || now.toLocaleDateString('en-US', { month: 'long' });
    const year = targetYear || now.getFullYear().toString();
    
    // 1. Generate content using Gemini
    const content = await this.generateMonthlyContent(month, year);
    if (!content) {
      console.error("NewsletterAgent: Monthly content generation failed.");
      return;
    }

    // 2. Build HTML from template
    const htmlTemplate = this.buildMonthlyHtml(content, month, year);

    // 3. Get all active subscribers
    const subscribersRef = collection(this.db, "subscribers");
    const q = query(subscribersRef, where("status", "==", "active"));
    const snapshot = await getDocs(q);
    const subscribers = snapshot.docs.map((docSnap: any) => ({
      id: docSnap.id,
      ...docSnap.data()
    }));

    if (subscribers.length === 0) {
      console.log("NewsletterAgent: No active subscribers to send to.");
      return;
    }

    // 4. Send emails
    if (this.transporter) {
      const subject = `THE FREQUENCY | ${month.toUpperCase()} ${year}`;
      for (const sub of subscribers) {
        try {
          // Personalize unsubscribe link for each subscriber
          const unsubLink = `${this.baseUrl}/api/unsubscribe?email=${encodeURIComponent(sub.email)}`;
          const personalizedHtml = htmlTemplate.replace(/{{UNSUBSCRIBE_LINK}}/g, unsubLink);

          await this.transporter.sendMail({
            from: `"Greens Screens Ent" <${process.env.SMTP_USER}>`,
            to: sub.email,
            subject: subject,
            html: personalizedHtml,
          });
        } catch (e) {
          console.error(`NewsletterAgent: Failed to send monthly to ${sub.email}:`, e);
        }
      }

      // Log the newsletter
      const newslettersRef = collection(this.db, "newsletters");
      await addDoc(newslettersRef, {
        subject,
        content: JSON.stringify(content),
        sentAt: new Date().toISOString(),
        recipientCount: subscribers.length,
        status: "sent"
      });

      console.log(`NewsletterAgent: Monthly newsletter sent to ${subscribers.length} subscribers.`);
    }
  }

  /**
   * Unsubscribe a user by email.
   */
  async unsubscribe(email: string) {
    try {
      const subscribersRef = collection(this.db, "subscribers");
      const q = query(subscribersRef, where("email", "==", email.toLowerCase()));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        console.warn(`NewsletterAgent: Unsubscribe failed - email ${email} not found.`);
        return false;
      }

      for (const docSnap of snapshot.docs) {
        const subRef = doc(this.db, "subscribers", docSnap.id);
        await updateDoc(subRef, {
          status: "inactive",
          unsubscribedAt: new Date().toISOString()
        });
      }

      console.log(`NewsletterAgent: Successfully unsubscribed ${email}`);
      return true;
    } catch (error) {
      console.error(`NewsletterAgent: Error unsubscribing ${email}:`, error);
      return false;
    }
  }

  private async generateMonthlyContent(month: string, year: string) {
    const prompt = `
      Generate a high-energy, technical monthly newsletter for "Greens Screens Ent" for ${month} ${year}.
      The theme is "SIGNAL_ALWAYS_GREEN".
      
      Reference the following structure and tone:
      - February 2026 used a Pink/Dark theme.
      - March 2026 used a Blue/Dark theme.
      
      I need the following sections in JSON format:
      1. heroIntro: A brief overview (approx 50 words) of the current state of gaming and tech.
      2. windowStart: The start date of coverage (e.g., "FEB 16").
      3. windowEnd: The end date of coverage (e.g., "MAR 15").
      4. signoffText: A closing message (approx 30 words).
      5. accentColor: A hex color code (e.g., "#ff2d78" for pink or "#00cfff" for blue).
      6. sections: An array of objects, each with:
         - type: "releases" | "indie" | "industry" | "screen"
         - name: Section title (e.g., "BIG RELEASES")
         - desc: Section subtitle (e.g., "MAJOR TITLES · THIS WINDOW")
         - icon: A hex code for an icon entity (e.g., "&#9654;" for play or "&#9670;" for diamond)
         - stories: Array of objects:
           - title: Story title
           - blurb: 2-3 sentence description
           - meta: Date/Platform info (e.g., "FEB 12 · PS5")
           - tag: "HOT" | "NEW" | "REMAKE" | "INDIE" | "SCREEN" | "INDUSTRY" | "ALERT"
           - link: A placeholder link (e.g., "https://gameinformer.com/2026")

      Focus on real or highly plausible gaming news for ${month} ${year}. Use a futuristic, cyber-industrial tone.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              heroIntro: { type: Type.STRING },
              windowStart: { type: Type.STRING },
              windowEnd: { type: Type.STRING },
              signoffText: { type: Type.STRING },
              accentColor: { type: Type.STRING },
              sections: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING },
                    name: { type: Type.STRING },
                    desc: { type: Type.STRING },
                    icon: { type: Type.STRING },
                    stories: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          title: { type: Type.STRING },
                          blurb: { type: Type.STRING },
                          meta: { type: Type.STRING },
                          tag: { type: Type.STRING },
                          link: { type: Type.STRING }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });

      return JSON.parse(response.text);
    } catch (error) {
      console.error("NewsletterAgent: Gemini generation failed:", error);
      return null;
    }
  }

  private buildMonthlyHtml(data: any, month: string, year: string) {
    const templatePath = path.join(process.cwd(), "templates", "monthly-newsletter.html");
    if (!fs.existsSync(templatePath)) return "Template not found";

    let html = fs.readFileSync(templatePath, "utf-8");

    // Helper to convert hex to rgba
    const hexToRgba = (hex: string, alpha: number) => {
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      return `rgba(${r},${g},${b},${alpha})`;
    };

    const accent = data.accentColor || "#00ff88";
    
    // Replace theme variables
    html = html.replace(/{{ACCENT_COLOR}}/g, accent);
    html = html.replace(/{{ACCENT_COLOR_DIM}}/g, hexToRgba(accent, 0.1));
    html = html.replace(/{{ACCENT_COLOR_BORDER}}/g, hexToRgba(accent, 0.22));
    html = html.replace(/{{BG_DARK}}/g, "#050a0d");
    html = html.replace(/{{BG_SURFACE}}/g, "#080f14");
    html = html.replace(/{{BG_CARD}}/g, "#0c1820");
    html = html.replace(/{{TEXT_COLOR}}/g, "#ddeef8");
    html = html.replace(/{{MUTED_COLOR}}/g, "#5a8aa8");
    
    // Replace content variables
    html = html.replace(/{{MONTH}}/g, month.toUpperCase());
    html = html.replace(/{{YEAR}}/g, year);
    html = html.replace(/{{HERO_INTRO}}/g, data.heroIntro);
    html = html.replace(/{{WINDOW_START}}/g, data.windowStart);
    html = html.replace(/{{WINDOW_END}}/g, data.windowEnd);
    html = html.replace(/{{SIGNOFF_TEXT}}/g, data.signoffText);

    // Build sections
    let sectionsHtml = "";
    data.sections.forEach((sec: any, idx: number) => {
      let storiesHtml = "";
      sec.stories.forEach((story: any, sIdx: number) => {
        const tagClass = `tag-${sec.type === 'releases' ? 'new' : sec.type}`;
        storiesHtml += `
          <div class="story">
            <span class="story-num">${(sIdx + 1).toString().padStart(2, '0')}</span>
            <div class="story-content">
              <div class="story-meta">
                <span class="story-tag ${tagClass}">${story.tag}</span> 
                ${story.meta}
              </div>
              <div class="story-title">${story.title}</div>
              <p class="story-blurb">${story.blurb}</p>
              <a href="${story.link}" target="_blank" class="story-link">READ MORE <span class="arr">→</span></a>
            </div>
          </div>
        `;
      });

      sectionsHtml += `
        <div class="sec sec-${sec.type}">
          <div class="sec-header">
            <div class="sec-icon">${sec.icon}</div>
            <div class="sec-title-wrap">
              <div class="sec-name">${sec.name}</div>
              <div class="sec-desc">${sec.desc}</div>
            </div>
          </div>
          ${storiesHtml}
        </div>
      `;
    });

    html = html.replace(/{{SECTIONS}}/g, sectionsHtml);

    return html;
  }
}
