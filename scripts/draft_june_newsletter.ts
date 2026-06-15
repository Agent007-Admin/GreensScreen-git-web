import { NewsletterAgent } from '../src/services/newsletterAgent.ts';
import { initializeApp } from 'firebase/app';
import { getFirestore, disableNetwork } from 'firebase/firestore';
import fs from 'fs';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

async function draftAndSend() {
  const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf-8'));
  const app = initializeApp(config);
  const db = getFirestore(app, config.firestoreDatabaseId);
  
  // Disable network connections to prevent hanging on blocked firestore websocket sockets
  try {
    await disableNetwork(db);
    console.log('Firestore network disabled successfully. Operating in rapid offline mode.');
  } catch (err: any) {
    console.warn('Failed to disable Firestore network:', err.message);
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const agent = new NewsletterAgent('', { mock: true } as any, transporter);
  
  const month = "June";
  const year = "2026";
  
  console.log(`Generating June ${year} newsletter...`);
  
  // Custom instructions to ensure specific NEW games are included with strict link safety
  const customInstructions = `
    STRICT NEW RELEASE & TIMING FOCUS (MAY 16, 2026 to JUNE 15, 2026 ONLY): 
    - ONLY include games that officially LAUNCHED (1.0 or Day One) between MAY 16, 2026 and JUNE 15, 2026.
    - ABSOLUTELY NO games, announcements, or hardware releases that occur on or after JUNE 16, 2026. Any future date is strictly forbidden.
    - OLDER GAMES ARE FORBIDDEN. Do NOT include games released in 2024 or 2025.
    - NO UPDATES. NO DLC. NO RUMORS.
    
    REQUIRED STORIES (Only if released in window):
    1. AAA BLOCKBUSTER: Choose a high-profile AAA release between May 16 and June 15, 2026. 
       - CRITICAL: Do NOT feature ultra-mainstream, ubiquitous franchises like 'Forza', 'James Bond / 007', 'Call of Duty', 'FIFA', etc. Choose another excellent, interesting core AAA game released in this window.
    2. Indie: Look for high-profile Indie releases from late May 2026 or early June 2026 (before June 15).
    3. Tech: High-level hardware announcements from NVIDIA, AMD, Intel or console manufacturers in late May / early June 2026 (before June 15).
    4. Entertainment: Gaming adaptations, movies, or TV series premiering during this block (before June 15).
    
    CRITICAL LINK INSTRUCTIONS:
    - You must NEVER link to a different game, an older version, a sequel, or another game in the same franchise.
    - If you are writing about a brand new game release and you cannot find its specific Steam Store page, set hasLink to false. Do NOT link to the previous game in the franchise.
    - For ALL sections Tech and Entertainment, hasLink MUST be false.
  `;

  // 1. Generate test newsletter and send to jgreen2196@gmail.com
  const success = await agent.sendTestNewsletter('jgreen2196@gmail.com', month, year, true, customInstructions);
  console.log(success ? 'NEWSLETTER_SENT_TO_TEST_EMAIL: jgreen2196@gmail.com' : 'NEWSLETTER_SEND_FAILED');
  console.log('DRAFT_HTML_SAVED: draft-newsletter-june-2026.html');
}

draftAndSend().catch(console.error);
