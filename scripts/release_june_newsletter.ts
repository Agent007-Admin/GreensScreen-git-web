import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { NewsletterAgent } from '../src/services/newsletterAgent.ts';
import fs from 'fs';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

async function main() {
  const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf-8'));
  const app = initializeApp(config);
  const db = getFirestore(app, config.firestoreDatabaseId);

  const month = "June";
  const year = "2026";

  console.log(`Preparing to release the ${month} ${year} newsletter...`);

  // Clear the rate limit cache file so that the release send succeeds for everyone
  const cachePath = path.join(process.cwd(), "last_sent_emails.json");
  try {
    if (fs.existsSync(cachePath)) {
      fs.unlinkSync(cachePath);
      console.log('SUCCESS: Cleared email sending rate limits registry to ensure all subscribers get the release.');
    }
  } catch (err: any) {
    console.warn('Could not clear rate limit cache:', err.message);
  }

  // Set up Nodemailer transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  const agent = new NewsletterAgent('', db, transporter, process.env.APP_URL || 'http://localhost:3000');
  
  console.log(`Starting real distribution of June 2026 newsletter to ALL active subscribers...`);
  
  // Send the real newsletter (forceRefresh = false, isTestOnly = false)
  await agent.sendMonthlyNewsletter(month, year, false, false);
  
  console.log('SUCCESS: Release process finished successfully!');
  process.exit(0);
}

main().catch(err => {
  console.error('FATAL Error running release:', err);
  process.exit(1);
});
