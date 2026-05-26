import { NewsletterAgent } from '../src/services/newsletterAgent.ts';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import fs from 'fs';
import nodemailer from 'nodemailer';

async function sendNewsletter() {
  const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf-8'));
  const app = initializeApp(config);
  const db = getFirestore(app, config.firestoreDatabaseId);

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
  
  console.log(`Sending newsletter for ${month} ${year} to ALL SUBSCRIBERS...`);
  await agent.sendMonthlyNewsletter(month, year, false, false);
  console.log('DONE.');
}

sendNewsletter().catch(console.error);
