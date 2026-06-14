import express from "express";
import { createServer as createViteServer } from "vite";
import axios from "axios";
import admin from "firebase-admin";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { NewsletterAgent } from "./src/services/newsletterAgent.ts";
import cron from "node-cron";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read Firebase config
let firebaseConfig: any = {};
try {
  const configPath = path.join(process.cwd(), "firebase-applet-config.json");
  console.log(`Checking for config at: ${configPath}`);
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    console.log("Firebase config loaded successfully:", {
      projectId: firebaseConfig.projectId,
      databaseId: firebaseConfig.firestoreDatabaseId
    });
  } else {
    console.warn("firebase-applet-config.json NOT found at", configPath);
  }
} catch (e) {
  console.warn("Could not read firebase-applet-config.json", e);
}

// Initialize Firebase Admin
if (!admin.apps.length) {
  try {
    console.log("Initializing Firebase Admin...");
    const adminConfig: any = {
      credential: admin.credential.applicationDefault()
    };
    
    if (firebaseConfig.projectId) {
      adminConfig.projectId = firebaseConfig.projectId;
      console.log(`Using project ID from config: ${firebaseConfig.projectId}`);
    }

    admin.initializeApp(adminConfig);
    console.log("Firebase Admin initialized successfully");
  } catch (initError) {
    console.error("Firebase Admin initialization failed:", initError);
  }
}

import { getFirestore } from "firebase-admin/firestore";

// Initialize Firestore with named database from config
let db: any;
const databaseId = firebaseConfig.firestoreDatabaseId;

try {
  if (databaseId) {
    console.log(`Initializing Firestore with named database: ${databaseId}`);
    db = getFirestore(admin.app(), databaseId);
  } else {
    console.log("Initializing Firestore with (default) database");
    db = getFirestore(admin.app());
  }
  if (!db) throw new Error("Firestore instance is null after initialization");
  console.log("Firestore initialized successfully");
} catch (error) {
  console.error("Failed to initialize Firestore:", error);
  // Fallback to default if named fails
  try {
    db = getFirestore(admin.app());
    console.log("Firestore fallback to (default) successful");
  } catch (fallbackError) {
    console.error("Firestore fallback failed:", fallbackError);
  }
}

import { initializeApp as initializeClientApp } from "firebase/app";
import { 
  getFirestore as getClientFirestore, 
  doc, 
  setDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  updateDoc
} from "firebase/firestore";

// Initialize Gemini
let genAI: any = null;
const rawGeminiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
const geminiKey = rawGeminiKey ? rawGeminiKey.trim().replace(/^["']|["']$/g, '') : null;

console.log(`DEBUG: GEMINI_API_KEY is ${process.env.GEMINI_API_KEY ? 'present' : 'absent'}`);
console.log(`DEBUG: API_KEY is ${process.env.API_KEY ? 'present' : 'absent'}`);

if (geminiKey && geminiKey.length > 0) {
  try {
    genAI = new GoogleGenAI({ apiKey: geminiKey });
    const maskedKey = geminiKey.substring(0, 4) + "..." + geminiKey.substring(geminiKey.length - 4);
    console.log(`Gemini AI initialized successfully (Key: ${maskedKey}, Length: ${geminiKey.length})`);
  } catch (e) {
    console.error("Failed to initialize Gemini AI:", e);
  }
} else {
  console.warn("CRITICAL: No valid Gemini API key found in environment variables (GEMINI_API_KEY or API_KEY).");
}

// Initialize Nodemailer
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || "3000");

  app.use(express.json());

  // Initialize Client SDK (Primary for this environment due to Admin SDK permission issues)
  let clientDb: any = null;
  try {
    const clientApp = initializeClientApp(firebaseConfig);
    clientDb = getClientFirestore(clientApp, firebaseConfig.firestoreDatabaseId);
    console.log("Client SDK initialized successfully");
  } catch (e) {
    console.error("Client SDK initialization failed:", e);
  }

  // Initialize Newsletter Agent with Client DB (more reliable in this environment)
  const baseUrl = process.env.APP_URL || `http://localhost:${PORT}`;
  const newsletterAgent = new NewsletterAgent(
    geminiKey?.trim() || "",
    clientDb, 
    transporter,
    baseUrl
  );

  // --- CRON JOBS ---
  // 1. Proactive processing of new subscribers (every 5 minutes)
  cron.schedule("*/5 * * * *", async () => {
    try {
      await newsletterAgent.processNewSubscribers();
    } catch (e) {
      console.error("Cron: Error processing new subscribers:", e);
    }
  });

  // 2. Monthly Newsletter (DISABLED - REQUIRES MANUAL PERMISSION)
  /*
  cron.schedule("0 10 15 * *", async () => {
    try {
      await newsletterAgent.sendMonthlyNewsletter();
    } catch (e) {
      console.error("Cron: Error sending monthly newsletter:", e);
    }
  }, {
    timezone: "America/Chicago"
  });
  */

  // 3. Startup Check (DISABLED - REQUIRES MANUAL PERMISSION)
  /*
  const runStartupCheck = async () => {
    console.log("NewsletterAgent: Running startup check...");
    try {
      const now = new Date();
      // Get current time in Chicago to check against 10 AM CT
      const chicagoString = now.toLocaleString("en-US", { timeZone: "America/Chicago" });
      const chicagoDate = new Date(chicagoString);
      
      const day = chicagoDate.getDate();
      const hour = chicagoDate.getHours();
      const month = chicagoDate.toLocaleDateString('en-US', { month: 'long', timeZone: 'America/Chicago' });
      const year = chicagoDate.getFullYear().toString();

      console.log(`NewsletterAgent: Startup check for ${month} ${year} (Day: ${day}, Hour: ${hour} CT)`);

      if (day === 15 && hour >= 10) {
        console.log("NewsletterAgent: It is the 15th and past 10 AM CT. Checking if newsletter was sent...");
        const sent = await newsletterAgent.isNewsletterSent(month, year);
        if (!sent) {
          console.log(`NewsletterAgent: 10 AM CT window passed on the 15th but newsletter not sent. Triggering automatic distribution...`);
          await newsletterAgent.sendMonthlyNewsletter(month, year);
        } else {
          console.log(`NewsletterAgent: ${month} ${year} newsletter already confirmed as sent.`);
        }
      } else {
        console.log("NewsletterAgent: Startup check condition not met (not the 15th or before 10 AM CT).");
      }
    } catch (e: any) {
      console.error("NewsletterAgent: Error during startup check:", e);
    }
  };

  runStartupCheck();
  */

  // --- DISCORD OAUTH ROUTES ---

  // 1. Get Discord Auth URL
  app.get("/api/auth/discord/url", (req, res) => {
    const clientId = process.env.DISCORD_CLIENT_ID;
    if (!clientId) {
      return res.status(500).json({ error: "Discord Client ID not configured" });
    }
    // Prioritize APP_URL from platform, fallback to request host
    const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    const redirectUri = process.env.DISCORD_REDIRECT_URI || `${baseUrl}/auth/discord/callback`;
    
    console.log(`Generating Discord Auth URL with redirect: ${redirectUri}`);

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: "code",
      scope: "identify", // We only need basic identity
    });

    const authUrl = `https://discord.com/api/oauth2/authorize?${params.toString()}`;
    res.json({ url: authUrl });
  });

  // 2. Discord Callback Handler
  app.get("/auth/discord/callback", async (req, res) => {
    const { code } = req.query;
    const clientId = process.env.DISCORD_CLIENT_ID;
    const clientSecret = process.env.DISCORD_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      console.error("Discord credentials missing in environment");
      return res.status(500).send("Discord integration not configured correctly.");
    }

    const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    const redirectUri = process.env.DISCORD_REDIRECT_URI || `${baseUrl}/auth/discord/callback`;
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!code) {
      return res.status(400).send("No code provided");
    }

    try {
      // A. Exchange code for access token
      const tokenResponse = await axios.post(
        "https://discord.com/api/oauth2/token",
        new URLSearchParams({
          client_id: clientId!,
          client_secret: clientSecret!,
          grant_type: "authorization_code",
          code: code.toString(),
          redirect_uri: redirectUri,
        }).toString(),
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      const { access_token } = tokenResponse.data;

      // B. Fetch user identity
      const userResponse = await axios.get("https://discord.com/api/users/@me", {
        headers: { Authorization: `Bearer ${access_token}` },
      });

      const discordUser = userResponse.data;

      // C. Save request to Firestore
      const requestData = {
        discordId: discordUser.id,
        username: discordUser.username,
        discriminator: discordUser.discriminator,
        avatar: discordUser.avatar,
        requestedAt: new Date().toISOString(),
        status: "pending",
      };
      
      if (clientDb) {
        const requestsRef = collection(clientDb, "discord_requests");
        await addDoc(requestsRef, requestData);
      } else {
        const requestRef = db.collection("discord_requests").doc();
        await requestRef.set(requestData);
      }

      // D. Send Webhook Notification to Discord Server
      if (webhookUrl) {
        try {
          await axios.post(webhookUrl, {
            embeds: [
              {
                title: "New Discord Join Request",
                description: `**User:** ${discordUser.username}#${discordUser.discriminator}\n**ID:** ${discordUser.id}`,
                color: 0x2ecc71,
                thumbnail: {
                  url: discordUser.avatar 
                    ? `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
                    : "https://cdn.discordapp.com/embed/avatars/0.png"
                },
                fields: [
                  { name: "Status", value: "Pending Approval", inline: true },
                  { name: "Time", value: new Date().toLocaleString(), inline: true }
                ],
                footer: { text: "GreensScreensEnt Join System" }
              }
            ]
          });
        } catch (webhookError) {
          console.error("Discord Webhook failed:", webhookError);
        }
      }

      // E. Return success page to close popup
      res.send(`
        <html>
          <body style="background: #0a0a0a; color: #2ecc71; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; text-align: center;">
            <div>
              <h2 style="text-transform: uppercase; letter-spacing: 2px;">Request Submitted</h2>
              <p style="color: #fff; opacity: 0.8;">Your join request has been sent to the admins.</p>
              <p style="font-size: 12px; color: #666;">This window will close automatically.</p>
              <script>
                if (window.opener) {
                  window.opener.postMessage({ type: 'DISCORD_AUTH_SUCCESS', user: ${JSON.stringify(discordUser.username)} }, '*');
                  setTimeout(() => window.close(), 2000);
                } else {
                  window.location.href = '/';
                }
              </script>
            </div>
          </body>
        </html>
      `);
    } catch (error: any) {
      console.error("Discord OAuth error:", error.response?.data || error.message);
      res.status(500).send("Authentication failed. Please try again.");
    }
  });

  // --- NEWSLETTER ROUTES ---

  app.post("/api/subscribe", async (req, res) => {
    const { email, name } = req.body;
    console.log(`Subscription request for: ${email}`);

    if (!email || !email.includes("@")) {
      return res.status(400).json({ error: "Invalid email address" });
    }

    try {
      const activeDb = clientDb || db;
      if (!activeDb) {
        console.error("Firestore database instance is not initialized.");
        return res.status(500).json({ error: "Database connection error. Please try again later." });
      }

      const subscriberData = {
        email: email.toLowerCase(),
        name: name || "Subscriber",
        subscribedAt: new Date().toISOString(),
        status: "pending_welcome"
      };
      
      console.log("Adding new subscriber to Firestore...");
      if (clientDb) {
        const subscribersRef = collection(clientDb, "subscribers");
        const q = query(subscribersRef, where("email", "==", email.toLowerCase()));
        const existing = await getDocs(q);
        if (!existing.empty) {
          const sub = existing.docs[0].data();
          if (sub.status === "inactive") {
            // Reactivate
            const subRef = doc(clientDb, "subscribers", existing.docs[0].id);
            await updateDoc(subRef, { 
              status: "pending_welcome",
              subscribedAt: new Date().toISOString() 
            });
            return res.json({ success: true, message: "Welcome back! Subscription reactivated." });
          }
          console.log("Subscriber already exists.");
          return res.status(400).json({ error: "This email is already subscribed." });
        }
        await addDoc(subscribersRef, subscriberData);
      } else {
        const subscribersRef = db.collection("subscribers");
        const existing = await subscribersRef.where("email", "==", email.toLowerCase()).get();
        if (!existing.empty) {
          const sub = existing.docs[0].data();
          if (sub.status === "inactive") {
            await existing.docs[0].ref.update({ 
              status: "pending_welcome",
              subscribedAt: new Date().toISOString() 
            });
            return res.json({ success: true, message: "Welcome back! Subscription reactivated." });
          }
          console.log("Subscriber already exists.");
          return res.status(400).json({ error: "This email is already subscribed." });
        }
        await subscribersRef.add(subscriberData);
      }
      
      console.log("Subscriber added successfully.");
      res.json({ success: true, message: "Subscription received. Welcome email incoming." });
    } catch (error: any) {
      console.error("Subscription error details:", error);
      res.status(500).json({ error: `Failed to subscribe: ${error.message || 'Unknown error'}` });
    }
  });

  app.post("/api/collaborate", async (req, res) => {
    const { name, email, category, message } = req.body;
    console.log(`Collaboration request received from ${name} (${email}) for category: ${category}`);

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return res.status(400).json({ error: "Name is required" });
    }
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ error: "Valid email address is required" });
    }
    if (!category || !["technology", "gaming", "entertainment"].includes(category)) {
      return res.status(400).json({ error: "Valid category is required" });
    }
    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({ error: "Message is required" });
    }

    try {
      const activeDb = db || clientDb;
      if (!activeDb) {
        console.error("Firestore database instance is not initialized.");
        return res.status(500).json({ error: "Database connection error. Please try again later." });
      }

      const requestData = {
        name: name.trim(),
        email: email.toLowerCase().trim(),
        category,
        message: message.trim(),
        submittedAt: new Date().toISOString(),
        status: "pending"
      };

      console.log("Saving collaboration request to Firestore using Admin SDK preference...");
      if (db) {
        const collabRef = db.collection("collaborations").doc();
        await collabRef.set(requestData);
      } else {
        const collabRef = collection(clientDb, "collaborations");
        await addDoc(collabRef, requestData);
      }
      console.log("Collaboration request saved to Firestore successfully.");

      // Send email alert to Agent007
      const agentMailOptions = {
        from: process.env.SMTP_USER || "noreply@greensscreensent.com",
        to: "agent007@greensscreensent.com",
        subject: `[COLLABORATION INQUIRY] New Request from ${name.trim()} (${category.toUpperCase()})`,
        text: `Hello Agent007,

You have received a new brand collaboration request!

DETAILS:
---------------------------------------------
Name: ${name.trim()}
Email: ${email.toLowerCase().trim()}
Category: ${category.toUpperCase()}
Submitted At: ${requestData.submittedAt}
---------------------------------------------

MESSAGE:
${message.trim()}

You can view active requests directly in the Firebase firestore database.

Best regards,
Greens Screens Ent Automated Notification System
`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #1a2e21; background-color: #050a07; color: #e8f5ee; border-radius: 8px;">
            <div style="text-align: center; border-bottom: 2px solid #00ff88; padding-bottom: 15px; margin-bottom: 20px;">
              <h1 style="color: #00ff88; font-size: 24px; margin: 0; text-transform: uppercase; letter-spacing: 2px;">New Collaboration Inquiry</h1>
              <p style="color: #6b9a7a; font-size: 12px; margin: 5px 0 0 0;">Greens Screens Entertainment Brand Intake</p>
            </div>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #00ff88; width: 30%;">Name:</td>
                <td style="padding: 8px 0; color: #e8f5ee;">${name.trim()}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #00ff88;">Email:</td>
                <td style="padding: 8px 0; color: #e8f5ee;"><a href="mailto:${email.toLowerCase().trim()}" style="color: #00ff88; text-decoration: none;">${email.toLowerCase().trim()}</a></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #00ff88;">Category:</td>
                <td style="padding: 8px 0; color: #e8f5ee;"><span style="background-color: rgba(0, 255, 136, 0.1); border: 1px solid #00ff88; padding: 4px 8px; border-radius: 4px; font-size: 11px; text-transform: uppercase; font-family: monospace; color: #00ff88;">${category.toUpperCase()}</span></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #00ff88;">Submitted:</td>
                <td style="padding: 8px 0; color: #6b9a7a; font-size: 13px;">${new Date().toLocaleString()}</td>
              </tr>
            </table>
            
            <div style="background-color: #0d1611; border: 1px solid rgba(0, 255, 136, 0.15); padding: 15px; border-radius: 6px; margin-bottom: 25px;">
              <h3 style="color: #00ff88; margin-top: 0; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Message / Inquiry:</h3>
              <p style="color: #e8f5ee; font-size: 14px; line-height: 1.6; white-space: pre-wrap; margin: 0;">${message.trim()}</p>
            </div>
            
            <div style="text-align: center; border-top: 1px solid #1a2e21; padding-top: 15px; font-size: 11px; color: #6b9a7a;">
              This is an automated request notification from the Greens Screens Ent Portal.<br/>
              To manage this submission, log in to your Firebase Console.
            </div>
          </div>
        `
      };

      // Send branded confirmation back to the Submitter/Client
      const clientMailOptions = {
        from: process.env.SMTP_USER || "noreply@greensscreensent.com",
        to: email.toLowerCase().trim(),
        subject: `● GREENS SCREENS | Connection Ingest Confirmed // ${category.toUpperCase()}`,
        html: `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="color-scheme" content="dark">
<title>Greens Screens Ent — Connection Intake Confirmed</title>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@400;500;600;700&family=Share+Tech+Mono&display=swap" rel="stylesheet" />
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #030704; font-family: 'Rajdhani', sans-serif; padding: 32px 20px; color: #e8f5ee; }
  .email-wrap {
    max-width: 600px; margin: 0 auto;
    background: #050a07; border: 1px solid rgba(0,255,136,0.15);
    border-radius: 8px; overflow: hidden;
  }
  .email-header {
    background: #030704; border-bottom: 1px solid rgba(0,255,136,0.12);
    padding: 32px 40px; position: relative; overflow: hidden;
    text-align: left;
  }
  .email-header-grid {
    position: absolute; inset: 0;
    background-image: linear-gradient(rgba(0,255,136,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,136,0.02) 1px, transparent 1px);
    background-size: 24px 24px;
    pointer-events: none;
  }
  .email-logo {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 28px;
    letter-spacing: 2px;
    display: inline-flex;
    align-items: center;
    text-decoration: none;
    line-height: 1;
    position: relative;
    z-index: 10;
  }
  .logo-dot { color: #00ff88; margin-right: 10px; font-size: 22px; line-height: 1; display: inline-block; }
  .logo-greens { color: #00ff88; }
  .logo-screens { color: #ffffff; margin-left: 5px; }
  .logo-divider { color: rgba(0, 255, 136, 0.25); margin: 0 10px; font-weight: 300; }
  .logo-ent { color: #00ff88; }
  .email-tagline { 
    font-family: 'Share Tech Mono', monospace; 
    font-size: 9px; 
    letter-spacing: 3px; 
    color: #4f7d5e; 
    margin-top: 8px;
    position: relative; 
    z-index: 1; 
  }
  .email-hero {
    background: #060d09; border-bottom: 1px solid rgba(0,255,136,0.12);
    padding: 44px 40px; text-align: center;
  }
  .email-eyebrow {
    font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 4px; color: #00ff88;
    margin-bottom: 14px; display: flex; align-items: center; justify-content: center; gap: 12px;
  }
  .email-eyebrow::before, .email-eyebrow::after { content: ''; width: 20px; height: 1px; background: #00ff88; opacity: 0.3; }
  .email-headline { font-family: 'Bebas Neue', sans-serif; font-size: 38px; letter-spacing: 2px; color: #00ff88; line-height: 1.1; margin-bottom: 12px; }
  .email-welcome-msg { font-size: 16px; font-weight: 500; color: #a4bea9; line-height: 1.6; max-width: 480px; margin: 0 auto; }
  .email-body { padding: 36px 40px; background: #050a07; }
  .email-section-label {
    font-family: 'Share Tech Mono', monospace; font-size: 10px; letter-spacing: 3px; color: #00ff88;
    margin-bottom: 20px; display: flex; align-items: center; gap: 10px; opacity: 0.9;
  }
  .email-section-label::after { content: ''; flex: 1; height: 1px; background: rgba(0,255,136,0.15); }
  .receipt-box {
    background: #080f0c; border: 1px solid rgba(0,255,136,0.2);
    padding: 24px; border-radius: 4px; margin-bottom: 24px;
  }
  .receipt-title {
    font-family: 'Bebas Neue', sans-serif; font-size: 20px; letter-spacing: 1px; color: #ffffff; margin-bottom: 12px;
  }
  .receipt-detail {
    font-size: 14px; color: #8fae96; line-height: 1.6; margin-bottom: 8px;
  }
  .receipt-detail strong { color: #00ff88; }
  .email-divider { height: 1px; background: rgba(0,255,136,0.1); margin: 24px 0; }
  .email-signoff { font-size: 15px; color: #9ab4a0; line-height: 1.6; font-weight: 500; }
  .email-signoff strong { color: #00ff88; font-family: 'Share Tech Mono', monospace; font-size: 11px; letter-spacing: 1px; display: block; margin-top: 16px; }
  .email-footer { background: #030704; border-top: 1px solid rgba(0,255,136,0.1); padding: 28px 40px; text-align: center; }
  .footer-logo-sm {
    font-family: 'Bebas Neue', sans-serif; font-size: 18px; letter-spacing: 1.5px; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px; line-height: 1;
  }
  .footer-fine { font-family: 'Share Tech Mono', monospace; font-size: 10px; color: #4f7d5e; letter-spacing: 1px; line-height: 1.5; }
  .signal-line { font-family: 'Share Tech Mono', monospace; font-size: 10px; color: #00ff88; opacity: 0.25; letter-spacing: 2px; margin-top: 12px; }
</style>
</head>
<body>
  <div class="email-wrap">
    <div class="email-header">
      <div class="email-header-grid"></div>
      <div class="email-logo">
        <span class="logo-dot">●</span><span class="logo-greens">GREENS</span><span class="logo-screens">SCREENS</span><span class="logo-divider">|</span><span class="logo-ent">ENT</span>
      </div>
      <div class="email-tagline">TECHNOLOGY · GAMING · ENTERTAINMENT</div>
    </div>
    <div class="email-hero">
      <div class="email-eyebrow">ALLY TRANSMISSION SECURED</div>
      <div class="email-headline">CONNECTION INGESTED // REVIEW ACTIVE</div>
      <p class="email-welcome-msg">
        Hello <strong>${name.trim()}</strong>,<br/>
        We have safely received your collaboration proposal. Your details have passed initial intake checks and are queued for live review by <strong>Agent007</strong>.
      </p>
    </div>
    <div class="email-body">
      <div class="email-section-label">SUBMISSION DETAILS</div>
      <div class="receipt-box">
        <div class="receipt-title">Intake Receipt Summary</div>
        <p class="receipt-detail"><strong>Category:</strong> ${category.toUpperCase()}</p>
        <p class="receipt-detail"><strong>Intake Email:</strong> ${email.toLowerCase().trim()}</p>
        <p class="receipt-detail"><strong>Status:</strong> Under Review</p>
        <p class="receipt-detail"><strong>Date Ingested:</strong> ${new Date().toLocaleString()}</p>
      </div>
      <p style="font-size: 14px; color: #8fae96; line-height: 1.6;">
        We review and assess all incoming pitches based on criteria such as design synergy, technical capabilities, and playtest windows. Once reviewed, we will connect back directly via this email address. Thank you for reaching out to team up.
      </p>
      <div class="email-divider"></div>
      <div class="email-signoff">
        We appreciate your interest in collaborating. Keep your signal clear.
        <strong>— THE GREENS SCREENS TEAM</strong>
      </div>
    </div>
    <div class="email-footer">
      <div class="footer-logo-sm">
        <span class="logo-dot">●</span><span class="logo-greens">GREENS</span><span class="logo-screens">SCREENS</span><span class="logo-divider">|</span><span class="logo-ent">ENT</span>
      </div>
      <div class="footer-fine">
        &copy; 2026 Greens Screens Ent · All rights reserved
      </div>
      <div class="signal-line">ALLY_CONNECTED_202</div>
    </div>
  </div>
</body>
</html>
`
      };

      transporter.sendMail(agentMailOptions, (error, info) => {
        if (error) {
          console.error("Nodemailer failed to send email alert to agent007:", error);
        } else {
          console.log("Nodemailer successfully sent email alert to agent007:", info.response);
        }
      });

      transporter.sendMail(clientMailOptions, (error, info) => {
        if (error) {
          console.error("Nodemailer failed to send connection confirmation to client:", error);
        } else {
          console.log("Nodemailer successfully sent connection confirmation to client:", info.response);
        }
      });

      res.json({ success: true, message: "Collaboration request submitted successfully. We will review files and connect back to you!" });
    } catch (error: any) {
      console.error("Collaboration submission error details:", error);
      res.status(500).json({ error: `Failed to submit collaboration request: ${error.message || 'Unknown error'}` });
    }
  });

  app.get("/api/unsubscribe", async (req, res) => {
    const { email } = req.query;
    if (!email || typeof email !== "string") {
      return res.status(400).send("Invalid unsubscribe request.");
    }

    const success = await newsletterAgent.unsubscribe(email);
    
    if (success) {
      res.send(`
        <html>
          <body style="background: #0a0a0a; color: #ff4444; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; text-align: center;">
            <div style="border: 1px solid #ff4444; padding: 40px; border-radius: 8px; background: #111;">
              <h2 style="text-transform: uppercase; letter-spacing: 2px;">Unsubscribed</h2>
              <p style="color: #fff; opacity: 0.8;">You have been successfully removed from our mailing list.</p>
              <p style="font-size: 12px; color: #666; margin-top: 20px;">We're sorry to see you go. You can always re-subscribe on our website.</p>
              <a href="/" style="display: inline-block; margin-top: 20px; color: #ff4444; text-decoration: none; border: 1px solid #ff4444; padding: 8px 16px; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Back to Site</a>
            </div>
          </body>
        </html>
      `);
    } else {
      res.status(404).send("Email not found in our subscription list.");
    }
  });

  // Public Welcome Email HTML Preview Route
  app.get("/api/welcome/preview", (req, res) => {
    try {
      const templatePath = path.join(process.cwd(), "templates", "welcome-email.html");
      if (!fs.existsSync(templatePath)) {
        return res.status(404).send("Welcome email template not found.");
      }
      let html = fs.readFileSync(templatePath, "utf-8");
      // Replace template placeholder with sample link
      html = html.replace(/\{\{UNSUBSCRIBE_LINK\}\}/g, "/api/unsubscribe?email=preview@greensscreensent.com");
      res.setHeader("Content-Type", "text/html");
      res.send(html);
    } catch (error: any) {
      console.error("Error reading welcome template preview:", error);
      res.status(500).send(`Server Error: ${error.message}`);
    }
  });

  app.post("/api/newsletter/preview", async (req, res) => {
    const { secret, month, year, forceRefresh } = req.body;
    
    if (secret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    try {
      const html = await newsletterAgent.previewMonthlyNewsletter(month, year, !!forceRefresh);
      res.setHeader('Content-Type', 'text/html');
      res.send(html);
    } catch (err: any) {
      console.error(`API: Error in preview newsletter route:`, err);
      res.status(500).send(`Error generating preview: ${err.message}`);
    }
  });

  app.post("/api/newsletter/test", async (req, res) => {
    const { email, secret, month, year, forceRefresh } = req.body;
    console.log(`API: POST /api/newsletter/test for ${email} (${month} ${year}) - forceRefresh: ${forceRefresh}`);
    
    if (secret !== process.env.ADMIN_SECRET) {
      console.warn(`API: Unauthorized test newsletter attempt for ${email}`);
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    try {
      const success = await newsletterAgent.sendTestNewsletter(email, month, year, !!forceRefresh);
      if (success) {
        console.log(`API: Test newsletter sent successfully to ${email}`);
        res.json({ success: true, message: `Test newsletter sent to ${email} for ${month || 'current'} ${year || ''}` });
      } else {
        console.error(`API: Failed to send test newsletter to ${email}`);
        res.status(500).json({ error: "Failed to send test newsletter. Check server logs for API key or generation issues." });
      }
    } catch (err) {
      console.error(`API: Error in test newsletter route:`, err);
      res.status(500).json({ error: "Internal server error during newsletter generation." });
    }
  });

  app.post("/api/newsletter/mark-test", async (req, res) => {
    const { email, secret } = req.body;
    
    if (secret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const success = await newsletterAgent.markAsTestUser(email);
    if (success) {
      res.json({ success: true, message: `${email} marked as test user` });
    } else {
      res.status(500).json({ error: "Failed to mark as test user" });
    }
  });

  app.post("/api/newsletter/release", async (req, res) => {
    const { secret, month, year, forceRefresh } = req.body;
    
    if (secret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const now = new Date();
    const targetMonth = month || now.toLocaleDateString('en-US', { month: 'long' });
    const targetYear = year || now.getFullYear().toString();

    console.log(`NewsletterAgent: Manual release of ${targetMonth} ${targetYear} newsletter triggered (forceRefresh: ${forceRefresh})...`);
    
    try {
      // This sends to ALL active subscribers
      await newsletterAgent.sendMonthlyNewsletter(targetMonth, targetYear, !!forceRefresh);
      res.json({ success: true, message: `${targetMonth} ${targetYear} newsletter release process started.` });
    } catch (error) {
      console.error(`NewsletterAgent: Manual release failed:`, error);
      res.status(500).json({ error: `Failed to release ${targetMonth} newsletter` });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*all", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
