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
    console.log("Initializing Firebase Admin with default credentials...");
    admin.initializeApp({
      credential: admin.credential.applicationDefault()
    });
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
  getDocs
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

  // Initialize Newsletter Agent with Client DB
  const newsletterAgent = new NewsletterAgent(
    geminiKey?.trim() || "",
    clientDb,
    transporter
  );

  // --- CRON JOBS ---
  // 1. Proactive processing of new subscribers (every minute)
  cron.schedule("* * * * *", async () => {
    try {
      await newsletterAgent.processNewSubscribers();
    } catch (e) {
      console.error("Cron: Error processing new subscribers:", e);
    }
  });

  // 2. Monthly Newsletter (15th of every month at 10:00 AM)
  cron.schedule("0 10 15 * *", async () => {
    try {
      await newsletterAgent.sendMonthlyNewsletter();
    } catch (e) {
      console.error("Cron: Error sending monthly newsletter:", e);
    }
  });

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
          console.log("Subscriber already exists.");
          return res.status(400).json({ error: "This email is already subscribed." });
        }
        await addDoc(subscribersRef, subscriberData);
      } else {
        const subscribersRef = db.collection("subscribers");
        const existing = await subscribersRef.where("email", "==", email.toLowerCase()).get();
        if (!existing.empty) {
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
