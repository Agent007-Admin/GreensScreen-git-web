import express from "express";
import { createServer as createViteServer } from "vite";
import axios from "axios";
import admin from "firebase-admin";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
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
  const projectId = firebaseConfig.projectId || process.env.VITE_FIREBASE_PROJECT_ID || "gen-lang-client-0408745223";
  console.log(`Initializing Firebase Admin for project: ${projectId}`);
  try {
    admin.initializeApp({
      projectId: projectId,
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
import { getFirestore as getClientFirestore, doc, setDoc } from "firebase/firestore";

// Initialize Client SDK (as a fallback/test)
const clientApp = initializeClientApp(firebaseConfig);
const clientDb = getClientFirestore(clientApp, firebaseConfig.firestoreDatabaseId);

// Initialize Gemini
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

// Nodemailer Transporter
// Note: In a real app, you'd use a service like SendGrid, Mailgun, or a dedicated SMTP server.
// For this demo, we'll assume SMTP env vars are provided.
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Newsletter Subscription
  app.post("/api/subscribe", async (req, res) => {
    const { email, name } = req.body;
    console.log(`Subscription request received for: ${email} (${name})`);

    if (!email || !email.includes("@")) {
      console.error("Invalid email provided:", email);
      return res.status(400).json({ error: "Invalid email address" });
    }

    try {
      if (!db) {
        throw new Error("Database connection not initialized. Please check server logs.");
      }

      console.log("Attempting to save subscriber to Firestore...");
      // 1. Save to Firestore
      const subscriberRef = db.collection("subscribers").doc();
      const data = {
        email: email.trim().toLowerCase(),
        name: name ? name.trim() : "Subscriber",
        subscribedAt: new Date().toISOString(),
      };
      console.log("Data to save:", JSON.stringify(data));
      
      await subscriberRef.set(data);
      console.log("Subscriber successfully saved to Firestore");

      // 2. Send Thank You Email
      // Only attempt if SMTP is configured
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        let welcomeMessage = `Welcome to the GreensScreensEnt newsletter, ${name || 'friend'}! We're excited to have you with us.`;
        
        // Try to generate a cool personalized message using Gemini
        if (process.env.GEMINI_API_KEY) {
          try {
            const prompt = `Write a short, high-energy, futuristic welcome message for a new subscriber named '${name || 'Subscriber'}' to 'GreensScreensEnt'. We are a community focused on the intersection of Tech, Gaming, and Entertainment. Mention that they'll receive monthly catalogs of the latest news in these domains. Keep it under 3 sentences. Use a tone that feels like a system initialization or a high-tech transmission.`;
            const response = await genAI.models.generateContent({
              model: "gemini-3-flash-preview",
              contents: prompt,
            });
            if (response.text) {
              welcomeMessage = response.text;
            }
          } catch (aiError) {
            console.error("Gemini welcome generation failed:", aiError);
          }
        }

        const mailOptions = {
          from: `"GreensScreensEnt" <${process.env.SMTP_USER}>`,
          to: email,
          subject: `Welcome to the Future, ${name || 'Subscriber'}!`,
          text: welcomeMessage,
          html: `
            <div style="font-family: 'Space Grotesk', sans-serif; max-width: 600px; margin: auto; border: 1px solid #2ecc71; padding: 30px; background-color: #0a0a0a; color: #ffffff; border-radius: 8px;">
              <h2 style="color: #2ecc71; text-transform: uppercase; letter-spacing: 2px;">System Initialized: Welcome ${name || ''}</h2>
              <p style="font-size: 16px; line-height: 1.6;">${welcomeMessage}</p>
              <p style="font-size: 14px; opacity: 0.8;">You'll be the first to hear about our new projects, gaming lounge updates, and community events.</p>
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #333;">
                <p style="color: #2ecc71; font-weight: bold;">GreensScreensEnt</p>
                <p style="font-size: 12px; color: #666;">Gaming | Technology | Entertainment</p>
              </div>
            </div>
          `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Sent thank you email to ${email}`);
      } else {
        console.warn("SMTP not configured. Skipping email send.");
      }

      res.status(200).json({ message: "Successfully subscribed!" });
    } catch (error: any) {
      console.error("Subscription error details:", error);
      res.status(500).json({ error: `Failed to subscribe: ${error.message || 'Unknown error'}` });
    }
  });

  // Test endpoint to verify SMTP configuration
  app.get("/api/test-email", async (req, res) => {
    const testEmail = req.query.email as string;
    if (!testEmail) {
      return res.status(400).send("Please provide an email query parameter: ?email=your@email.com");
    }

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return res.status(500).send("SMTP credentials are NOT configured in environment variables.");
    }

    try {
      const mailOptions = {
        from: `"GreensScreensEnt Test" <${process.env.SMTP_USER}>`,
        to: testEmail,
        subject: "SMTP Configuration Test",
        text: "If you are reading this, your SMTP configuration for GreensScreensEnt is working correctly!",
      };

      await transporter.sendMail(mailOptions);
      res.status(200).send(`Test email sent successfully to ${testEmail}`);
    } catch (error: any) {
      console.error("SMTP Test failed:", error);
      res.status(500).send(`SMTP Test failed: ${error.message}`);
    }
  });

  // Health check to verify Firestore connectivity
  app.get("/api/health", async (req, res) => {
    let adminStatus = "unknown";
    let adminError = null;
    let clientStatus = "unknown";
    let clientError = null;
    
    // Test Admin SDK
    try {
      console.log("Health check: Attempting Admin SDK write...");
      const healthRef = db.collection("health").doc("admin-check");
      await healthRef.set({ 
        lastCheck: new Date().toISOString(),
        status: "online"
      });
      adminStatus = "connected";
    } catch (error: any) {
      console.error("Admin SDK health check failed:", error);
      adminStatus = "error";
      adminError = error.message;
    }

    // Test Client SDK
    try {
      console.log("Health check: Attempting Client SDK write...");
      const healthRef = doc(clientDb, "health", "client-check");
      await setDoc(healthRef, {
        lastCheck: new Date().toISOString(),
        status: "online"
      });
      clientStatus = "connected";
    } catch (error: any) {
      console.error("Client SDK health check failed:", error);
      clientStatus = "error";
      clientError = error.message;
    }

    res.json({ 
      status: "ok", 
      admin: { status: adminStatus, error: adminError },
      client: { status: clientStatus, error: clientError },
      projectId: firebaseConfig.projectId,
      databaseId: databaseId || "(default)"
    });
  });

  // --- DISCORD OAUTH ROUTES ---

  // 1. Get Discord Auth URL
  app.get("/api/auth/discord/url", (req, res) => {
    const clientId = process.env.DISCORD_CLIENT_ID;
    const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    const redirectUri = process.env.DISCORD_REDIRECT_URI || `${baseUrl}/auth/discord/callback`;
    
    if (!clientId) {
      return res.status(500).json({ error: "Discord Client ID not configured" });
    }

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
      const requestRef = db.collection("discord_requests").doc();
      const requestData = {
        discordId: discordUser.id,
        username: discordUser.username,
        discriminator: discordUser.discriminator,
        avatar: discordUser.avatar,
        requestedAt: new Date().toISOString(),
        status: "pending",
      };
      await requestRef.set(requestData);

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
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
