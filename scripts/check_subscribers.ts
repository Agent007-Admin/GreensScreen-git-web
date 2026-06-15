import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf-8'));
  const app = initializeApp(config);
  const db = getFirestore(app, config.firestoreDatabaseId);

  console.log('Querying subscribers in Firestore...');
  const subscribersRef = collection(db, 'subscribers');
  try {
    const querySnapshot = await getDocs(subscribersRef);
    console.log(`Found ${querySnapshot.size} documents in subscribers:`);
    querySnapshot.forEach(docSnap => {
      console.log(`ID/Email: ${docSnap.id}, Data:`, docSnap.data());
    });
  } catch (err: any) {
    console.error('Error reading subscribers:', err.message || err);
  }

  process.exit(0);
}

main().catch(console.error);
