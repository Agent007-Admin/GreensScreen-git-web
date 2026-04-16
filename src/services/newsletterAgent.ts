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
  getDoc,
  setDoc,
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

  constructor(apiKey: string, db: any, transporter: any, baseUrl: string = "") {
    this.db = db;
    this.transporter = transporter;
    this.baseUrl = baseUrl;
    
    // Initialize AI with provided key or fallback to environment
    // Prioritize API_KEY as it's the most reliable in this environment
    const key = process.env.API_KEY || process.env.GEMINI_API_KEY || apiKey || "";
    this.ai = new GoogleGenAI({ apiKey: key.trim() });
    
    if (key) {
      const masked = key.trim().substring(0, 4) + "..." + key.trim().substring(key.trim().length - 4);
      console.log(`NewsletterAgent: Initialized with key ${masked}`);
    } else {
      console.warn("NewsletterAgent: No API key found during initialization!");
    }
  }

  /**
   * Re-initialize the AI instance with the latest key from environment if needed.
   */
  private refreshAI() {
    const key = process.env.API_KEY || process.env.GEMINI_API_KEY || "";
    if (key) {
      this.ai = new GoogleGenAI({ apiKey: key.trim() });
    }
  }

  /**
   * Log a system event to Firestore for debugging.
   */
  private async logEvent(level: "info" | "warn" | "error", message: string, details?: any) {
    const timestamp = new Date().toISOString();
    console.log(`[${level.toUpperCase()}] NewsletterAgent: ${message}`, details || "");
    
    try {
      const logsRef = collection(this.db, "system_logs");
      await addDoc(logsRef, {
        timestamp,
        level,
        message,
        details: details ? JSON.stringify(details) : null,
        source: "NewsletterAgent"
      });
    } catch (e) {
      console.error("NewsletterAgent: Failed to write to system_logs:", e);
    }
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
  async sendMonthlyNewsletter(targetMonth?: string, targetYear?: string, forceRefresh: boolean = false, isTestOnly: boolean = false) {
    const now = new Date();
    const month = targetMonth || now.toLocaleDateString('en-US', { month: 'long' });
    const year = targetYear || now.getFullYear().toString();

    await this.logEvent("info", `Starting monthly newsletter distribution for ${month} ${year} (forceRefresh: ${forceRefresh}, isTestOnly: ${isTestOnly})`);
    
    // 1. Get or generate content
    let content;
    try {
      content = await this.getMonthlyContent(month, year, forceRefresh, isTestOnly);
    } catch (e: any) {
      await this.logEvent("error", `Content generation failed for ${month} ${year}`, { error: e.message });
      return;
    }

    if (!content) {
      await this.logEvent("error", `Monthly content generation returned null for ${month} ${year}`);
      return;
    }

    // 2. Build HTML from template
    let htmlTemplate;
    try {
      htmlTemplate = this.buildMonthlyHtml(content, month, year, isTestOnly);
    } catch (e: any) {
      await this.logEvent("error", `HTML build failed for ${month} ${year}`, { error: e.message });
      return;
    }

    // 3. Get subscribers
    let subscribers = [];
    try {
      const subscribersRef = collection(this.db, "subscribers");
      let q;
      if (isTestOnly) {
        q = query(subscribersRef, where("status", "==", "active"), where("isTestUser", "==", true));
      } else {
        q = query(subscribersRef, where("status", "==", "active"));
      }
      const snapshot = await getDocs(q);
      subscribers = snapshot.docs.map((docSnap: any) => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
    } catch (e: any) {
      await this.logEvent("error", `Failed to fetch subscribers for ${month} ${year}`, { error: e.message });
      return;
    }

    if (subscribers.length === 0) {
      await this.logEvent("info", `No ${isTestOnly ? 'test ' : ''}subscribers found for ${month} ${year}`);
      return;
    }

    // 4. Send emails
    if (this.transporter) {
      const subject = `THE FREQUENCY | ${month.toUpperCase()} ${year}`;
      let successCount = 0;
      let failCount = 0;

      for (const sub of subscribers) {
        try {
          const unsubLink = `${this.baseUrl}/api/unsubscribe?email=${encodeURIComponent(sub.email)}`;
          const personalizedHtml = htmlTemplate.replace(/{{UNSUBSCRIBE_LINK}}/g, unsubLink);

          await this.transporter.sendMail({
            from: `"Greens Screens Ent" <${process.env.SMTP_USER}>`,
            to: sub.email,
            subject: isTestOnly ? `[TEST] ${subject}` : subject,
            html: personalizedHtml,
          });
          successCount++;
        } catch (e: any) {
          failCount++;
          console.error(`NewsletterAgent: Failed to send monthly to ${sub.email}:`, e);
        }
      }

      // Log the newsletter record (only if not a test)
      if (!isTestOnly) {
        try {
          const newsletterId = `${month.toLowerCase()}-${year}`;
          const newsletterRef = doc(this.db, "newsletters", newsletterId);
          await setDoc(newsletterRef, {
            subject,
            content: JSON.stringify(content),
            sentAt: new Date().toISOString(),
            recipientCount: subscribers.length,
            successCount,
            failCount,
            status: "sent",
            month,
            year
          });
          await this.logEvent("info", `Monthly newsletter distribution complete for ${month} ${year}`, { successCount, failCount });
        } catch (e: any) {
          await this.logEvent("error", `Failed to log newsletter record for ${month} ${year}`, { error: e.message });
        }
      } else {
        await this.logEvent("info", `Test newsletter distribution complete for ${month} ${year}`, { successCount, failCount });
      }
    } else {
      await this.logEvent("warn", `Transporter not configured. Skipping email send for ${month} ${year}`);
    }
  }

  /**
   * Check if a newsletter has already been sent for a given month and year.
   */
  async isNewsletterSent(month: string, year: string) {
    try {
      const newslettersRef = collection(this.db, "newsletters");
      const q = query(
        newslettersRef, 
        where("month", "==", month),
        where("year", "==", year),
        where("status", "==", "sent")
      );
      const snapshot = await getDocs(q);
      return !snapshot.empty;
    } catch (error) {
      console.error(`NewsletterAgent: Error checking if newsletter sent for ${month} ${year}:`, error);
      return false;
    }
  }

  /**
   * Send a test newsletter to a specific email.
   */
  async sendTestNewsletter(email: string, targetMonth?: string, targetYear?: string, forceRefresh: boolean = false) {
    console.log(`NewsletterAgent: Sending test newsletter to ${email}...`);
    
    const now = new Date();
    const month = targetMonth || now.toLocaleDateString('en-US', { month: 'long' });
    const year = targetYear || now.getFullYear().toString();
    
    // 1. Get or generate content
    const content = await this.getMonthlyContent(month, year, forceRefresh, true);
    if (!content) {
      console.error("NewsletterAgent: Monthly content generation failed.");
      return false;
    }

    // 2. Build HTML from template
    const htmlTemplate = this.buildMonthlyHtml(content, month, year, true);

    // 3. Send email
    if (this.transporter) {
      const subject = `[TEST] THE FREQUENCY | ${month.toUpperCase()} ${year}`;
      try {
        const unsubLink = `${this.baseUrl}/api/unsubscribe?email=${encodeURIComponent(email)}`;
        const personalizedHtml = htmlTemplate.replace(/{{UNSUBSCRIBE_LINK}}/g, unsubLink);

        await this.transporter.sendMail({
          from: `"Greens Screens Ent" <${process.env.SMTP_USER}>`,
          to: email,
          subject: subject,
          html: personalizedHtml,
        });
        console.log(`NewsletterAgent: Test newsletter sent to ${email}`);
        return true;
      } catch (e) {
        console.error(`NewsletterAgent: Failed to send test to ${email}:`, e);
        return false;
      }
    }
    return false;
  }

  /**
   * Mark a subscriber as a test user.
   */
  async markAsTestUser(email: string) {
    try {
      const subscribersRef = collection(this.db, "subscribers");
      const q = query(subscribersRef, where("email", "==", email.toLowerCase()));
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        console.warn(`NewsletterAgent: Mark as test failed - email ${email} not found.`);
        return false;
      }

      for (const docSnap of snapshot.docs) {
        const subRef = doc(this.db, "subscribers", docSnap.id);
        await updateDoc(subRef, {
          isTestUser: true
        });
      }

      console.log(`NewsletterAgent: Successfully marked ${email} as test user`);
      return true;
    } catch (error) {
      console.error(`NewsletterAgent: Error marking ${email} as test user:`, error);
      return false;
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

  /**
   * Get or generate monthly content. Checks Firestore for a draft first.
   */
  async getMonthlyContent(month: string, year: string, forceRefresh: boolean = false, isTest: boolean = false) {
    const draftId = isTest ? `${month.toLowerCase()}-${year}-test` : `${month.toLowerCase()}-${year}`;
    const draftRef = doc(this.db, "newsletter_drafts", draftId);

    if (!forceRefresh) {
      try {
        const draftSnap = await getDoc(draftRef);
        if (draftSnap.exists()) {
          console.log(`NewsletterAgent: Using existing ${isTest ? 'test ' : ''}draft for ${month} ${year}`);
          return draftSnap.data().content;
        }
      } catch (e) {
        console.error("NewsletterAgent: Error fetching draft:", e);
      }
    }

    // Generate new content
    const content = await this.generateMonthlyContent(month, year, isTest);
    if (content) {
      try {
        await setDoc(draftRef, {
          month,
          year,
          content,
          updatedAt: new Date().toISOString()
        });
        console.log(`NewsletterAgent: Saved new draft for ${month} ${year}`);
      } catch (e) {
        console.error("NewsletterAgent: Error saving draft:", e);
      }
    }
    return content;
  }

  private async withRetry<T>(fn: () => Promise<T>, retries: number = 3, delay: number = 2000): Promise<T> {
    try {
      return await fn();
    } catch (error: any) {
      // Check if it's a 503 or 429 error
      const isRetryable = error?.status === 503 || error?.status === 429 || error?.message?.includes("503") || error?.message?.includes("429");
      
      if (retries > 0 && isRetryable) {
        console.warn(`NewsletterAgent: AI call failed (${error?.status || 'unknown'}). Retrying in ${delay}ms... (${retries} retries left)`);
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.withRetry(fn, retries - 1, delay * 2);
      }
      throw error;
    }
  }

  async generateMonthlyContent(month: string, year: string, isTest: boolean = false) {
    this.refreshAI(); // Ensure we use the latest key
    await this.logEvent("info", `Requesting Gemini generation for ${month} ${year}...`);
    
    const prompt = `
      Generate a high-energy, technical monthly newsletter for "Greens Screens Ent" for ${month} ${year}.
      The theme is "SIGNAL_ALWAYS_GREEN".
      
      CRITICAL INSTRUCTIONS:
      1. Use the googleSearch tool to find REAL, CURRENT gaming and tech news from ${month} ${year}.
      2. Every link MUST be a valid, working URL to a reputable news site (e.g., IGN, Kotaku, Polygon, The Verge).
      3. LINK RELIABILITY: Always prefer a valid "Read More" link with a true landing page. ONLY if a valid link cannot be found after searching, set "hasLink" to false and provide a "fullSummary" (approx 100 words) for "Digest Mode".
      4. BLURB vs FULL SUMMARY (CRITICAL): 
         - "blurb": A ultra-concise, 1-sentence "hook" (max 15 words) that grabs attention.
         - "fullSummary": A 3-4 sentence deep-dive "Research Digest" (approx 80-100 words). It MUST contain specific research data, technical details, and unique insights not found in the blurb.
         - PROHIBITION: The "fullSummary" MUST NOT contain the text of the "blurb". They must be unique, complementary narratives.
      5. DO NOT use placeholder links or links that lead to 404 errors.
      6. Limit the output to 4 sections, with exactly 2 stories per section to ensure the newsletter fits within a single email view.
      7. Tone: Futuristic, cyber-industrial, high-energy.
      8. STRICT: DO NOT include any internal monologue, thought process, or commentary inside the JSON values. 
      9. STRICT: windowStart and windowEnd MUST be short strings (e.g., "APR 01", "APR 30"). DO NOT include years or timestamps in these fields.
      10. STRICT: Output ONLY the raw JSON object. NO PREAMBLE. NO POSTAMBLE.
      11. NO IMAGES: Do not provide any image URLs.
      12. One section MUST be of type "indie", highlighting high-anticipation games from smaller teams/developers that people may not be aware of but that are showing good promise.
      
      13. LINK RELIABILITY: You MUST use the googleSearch tool to find a direct, valid URL for each story. If the story is about a video game that has already been released, PRIORITIZE the official Steam Store page as the source link. If you find a valid article or store link, set "hasLink" to true. If you absolutely cannot find a direct link after searching, set "hasLink": false and use a reputable homepage as the "link" fallback.
      
      I need the following sections in JSON format:
      1. heroIntro: A brief overview (approx 50 words) of the current state of gaming and tech.
      2. windowStart: The start date of coverage (e.g., "APR 01").
      3. windowEnd: The end date of coverage (e.g., "APR 30").
      4. signoffText: A closing message (approx 30 words).
      5. accentColor: A hex color code (e.g., "#ff2d78" for pink or "#00cfff" for blue).
      6. sections: An array of objects, each with:
         - type: "releases" | "indie" | "industry" | "screen"
         - name: Section title (e.g., "BIG RELEASES")
         - desc: Section subtitle (e.g., "MAJOR TITLES · THIS WINDOW")
         - icon: A hex code for an icon entity (e.g., "&#9654;" for play or "&#9670;" for diamond)
         - stories: Array of objects:
           - title: Story title
           - blurb: A ultra-concise, 1-sentence "hook" (max 15 words).
           - meta: Date/Platform info (e.g., "APR 12 · PS5")
           - tag: "HOT" | "NEW" | "REMAKE" | "INDIE" | "SCREEN" | "INDUSTRY" | "ALERT"
           - link: A REAL, VERIFIED URL to the news story.
           - hasLink: boolean (true if a direct article link was found)
           - fullSummary: string (ONLY if hasLink is false, provide 3-4 deep-dive sentences with unique data points)
    `;

    try {
      const response = await this.withRetry(async () => {
        console.log("NewsletterAgent: Calling Gemini API with googleSearch...");
        return await this.ai.models.generateContent({
          model: "gemini-flash-latest",
          contents: prompt,
          config: {
            tools: [{ googleSearch: {} }],
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              required: ["heroIntro", "windowStart", "windowEnd", "signoffText", "accentColor", "sections"],
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
                    required: ["type", "name", "desc", "icon", "stories"],
                    properties: {
                      type: { type: Type.STRING },
                      name: { type: Type.STRING },
                      desc: { type: Type.STRING },
                      icon: { type: Type.STRING },
                      stories: {
                        type: Type.ARRAY,
                        items: {
                          type: Type.OBJECT,
                          required: ["title", "blurb", "meta", "tag", "link", "hasLink", "fullSummary"],
                          properties: {
                            title: { type: Type.STRING },
                            blurb: { type: Type.STRING },
                            meta: { type: Type.STRING },
                            tag: { type: Type.STRING },
                            link: { type: Type.STRING },
                            hasLink: { type: Type.BOOLEAN },
                            fullSummary: { type: Type.STRING }
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
      });

      await this.logEvent("info", "Gemini generation complete. Parsing response...");
      const text = response.text;
      if (!text) throw new Error("Empty response from Gemini");
      
      try {
        const parsed = JSON.parse(text);
        
        // Validation: Ensure we have actual content
        if (!parsed.sections || !Array.isArray(parsed.sections) || parsed.sections.length === 0) {
          throw new Error("Generated content is missing sections or sections are empty.");
        }
        
        const totalStories = parsed.sections.reduce((acc: number, sec: any) => acc + (sec.stories?.length || 0), 0);
        if (totalStories === 0) {
          throw new Error("Generated content has sections but NO stories. Tool usage likely failed.");
        }

        if (!parsed.windowStart || parsed.windowStart === "undefined") {
          throw new Error("Generated content is missing windowStart.");
        }

        // Validation: Ensure blurb and fullSummary are distinct
        parsed.sections.forEach((sec: any) => {
          sec.stories.forEach((story: any) => {
            if (story.hasLink === false && story.fullSummary) {
              // If they are too similar (e.g. one is a substring of another or very short)
              const b = story.blurb.toLowerCase().trim();
              const s = story.fullSummary.toLowerCase().trim();
              if (s.includes(b) && s.length < b.length + 20) {
                throw new Error(`Duplication detected in story: ${story.title}. Blurb and Summary are too similar.`);
              }
            }
            if (story.hasLink === false && !story.fullSummary) {
              throw new Error(`Missing fullSummary for digest-mode story: ${story.title}`);
            }
          });
        });

        return parsed;
      } catch (parseError) {
        console.error("NewsletterAgent: JSON Parse Error. Raw text length:", text.length);
        console.error("NewsletterAgent: Raw text snippet:", text.substring(0, 500) + "...");
        throw parseError;
      }
    } catch (error: any) {
      await this.logEvent("error", `Gemini generation failed: ${error.message}`, { 
        stack: error.stack,
        month,
        year
      });
      console.error("NewsletterAgent: Gemini generation failed:", error);
      return null;
    }
  }

  private buildMonthlyHtml(data: any, month: string, year: string, isTest: boolean = false) {
    const templateName = isTest ? "test-newsletter.html" : "monthly-newsletter.html";
    let templatePath = path.join(process.cwd(), "templates", templateName);
    
    if (!fs.existsSync(templatePath)) {
      templatePath = path.join(process.cwd(), "templates", "monthly-newsletter.html");
    }
    
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
    if (data && data.sections && Array.isArray(data.sections)) {
      data.sections.forEach((sec: any, idx: number) => {
        let storiesHtml = "";
        if (sec.stories && Array.isArray(sec.stories)) {
          sec.stories.forEach((story: any, sIdx: number) => {
            const tagClass = `tag-${sec.type === 'releases' ? 'new' : sec.type}`;
            
            const summaryHtml = `
              <div class="story-summary-box">
                <div class="summary-label">RESEARCH_DIGEST</div>
                <p class="story-full-summary">${story.fullSummary}</p>
              </div>
            `;
            
            const linkHtml = `
              <a href="${story.link}" target="_blank" class="story-link">SOURCE ACCESS <span class="arr">→</span></a>
            `;

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
                  ${summaryHtml}
                  ${linkHtml}
                </div>
              </div>
            `;
          });
        }

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
    } else {
      console.warn("NewsletterAgent: No valid sections found in data for HTML build.");
      sectionsHtml = "<div style='padding: 20px; color: #666; font-family: monospace;'>[NO SECTIONS GENERATED]</div>";
    }

    html = html.replace(/{{SECTIONS}}/g, sectionsHtml);

    return html;
  }
}
