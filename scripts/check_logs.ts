import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, orderBy, query, limit } from 'firebase/firestore';
import fs from 'fs';

async function main() {
  const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf-8'));
  const app = initializeApp(config);
  const db = getFirestore(app, config.firestoreDatabaseId);

  const logsRef = collection(db, 'newsletter_logs');
  const q = query(logsRef, orderBy('timestamp', 'desc'), limit(15));
  const snap = await getDocs(q);

  console.log('--- FIRESTORE NEWSLETTER_LOGS (Recent 15) ---');
  snap.forEach(doc => {
    const data = doc.data();
    console.log(`[${data.timestamp}] [${data.level?.toUpperCase()}] ${data.message}`);
    if (data.meta) {
      console.log('  Meta:', JSON.stringify(data.meta, null, 2));
    }
  });
  console.log('--------------------------------------------');
  process.exit(0);
}

main().catch(console.error);
