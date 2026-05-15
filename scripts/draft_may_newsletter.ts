
import { NewsletterAgent } from '../src/services/newsletterAgent.ts';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';

async function draftAndSend() {
  const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf-8'));
  const app = initializeApp(config);
  const db = getFirestore(app, config.firestoreDatabaseId);

  // We might not have real SMTP credentials in the environment, 
  // but we can at least generate the HTML and "attempt" to send it 
  // or log it.
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: 587,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const agent = new NewsletterAgent('', db, transporter);
  
  const month = "May";
  const year = "2026";
  
  console.log(`Generating newsletter for ${month} ${year}...`);
  
  // Custom instructions to ensure specific NEW games are included with strict link safety
  const customInstructions = `
    STRICT NEW RELEASE & TIMING FOCUS: 
    - ONLY include games that officially LAUNCHED (1.0 or Day One) between APRIL 16, 2026 and MAY 15, 2026.
    - OLDER GAMES ARE FORBIDDEN. Do NOT include games released in 2024 or 2025.
    - NO UPDATES. NO DLC. NO RUMORS.
    
    REQUIRED STORIES (Only if released in window):
    1. Look for the latest AAA blockbuster released in early May 2026.
    2. Look for high-profile Indie releases from late April 2026 or early May 2026.
    
    CRITICAL LINK INSTRUCTIONS:
    - You must NEVER link to a different game, an older version, a sequel, or another game in the same franchise.
    - If you are writing about a brand new game release and you cannot find its specific Steam Store page, set hasLink to false. Do NOT link to the previous game in the franchise.
    - For ALL sections Tech and Entertainment, hasLink MUST be false.
  `;

  // We'll manually pass these instructions by prepending them to the hero intro or similar 
  // if we wanted to be hacky, but better to just use the agent's sendTestNewsletter with a manual override
  // or just run it and let the upgraded prompt handle the link safety.
  
  const success = await agent.sendTestNewsletter('jgreen2196@gmail.com', month, year, true, customInstructions);
  console.log(success ? 'NEWSLETTER_SENT_TO_TEST_EMAIL' : 'NEWSLETTER_SEND_FAILED');
  
  // 2. Save the generated HTML locally for inspection
  const content = await agent.getMonthlyContent(month, year, true, true, customInstructions);
  if (content) {
    const html = (agent as any).buildMonthlyHtml(content, month, year, true);
    fs.writeFileSync('draft-newsletter-may-2026.html', html);
    console.log('DRAFT_HTML_SAVED: draft-newsletter-may-2026.html');
  }
}

draftAndSend().catch(console.error);
