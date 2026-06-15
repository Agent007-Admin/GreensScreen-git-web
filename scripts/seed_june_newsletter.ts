import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { NewsletterAgent } from '../src/services/newsletterAgent.ts';
import fs from 'fs';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const draftData = {
  accentColor: "#00ff88",
  heroIntro: "Welcome to the neon-drenched frontier of June 2026. The neural net is buzzing as Alkimia resurrects gothic horrors and Yacht Club burrows deep into retro nostalgia. Meanwhile, silicon titans clash at Computex with hyper-efficient AI architecture set to redefine portable play. Lock in your connections; the digital tide is rising.",
  windowStart: "MAY 16, 2026",
  windowEnd: "JUN 15, 2026",
  signoffText: "Disconnecting uplink. Stay wired, stay hungry, and keep your displays glowing bright green. We will find you on the other side of the digital divide. — The Greens Screens Crew.",
  sections: [
    {
      type: "releases",
      name: "Major AAA/AA Releases",
      desc: "Heavy hitter major titles launching into the wild.",
      icon: "",
      stories: [
        {
          title: "Gothic 1 Remake",
          tag: "Action RPG",
          meta: "Released on June 5, 2026",
          blurb: "Return to the brutal penal colony of Khorinis in this stunning ground-up remake.",
          fullSummary: "Developed by Alkimia Interactive and published by THQ Nordic, this modern revival of the 2001 classic launches players back into the harsh mining colony on PC, PlayStation 5, and Xbox Series X/S. Rebuilt entirely in Unreal Engine 5, the game delivers breathtaking photorealistic visuals, fully overhauled modern combat mechanics, and a revamped faction system. Additionally, the developers have modernized the complex artificial intelligence routines of the colony's inhabitants, ensuring that day-to-day camp life feels dynamic, dangerous, and deeply reactive to the player's choices.",
          hasLink: true,
          link: "https://store.steampowered.com/app/1297900/Gothic_1_Remake/"
        },
        {
          title: "Mina the Hollower",
          tag: "Retro Action Adventure",
          meta: "Released on May 29, 2026",
          blurb: "Dig deep into a beautifully gothic, 8-bit adventure from the creators of Shovel Knight.",
          fullSummary: "Yacht Club Games returns with their next flagship title, delivering a top-down retro experience styled after classic Game Boy Color aesthetics on PC, PlayStation 4, PlayStation 5, Nintendo Switch, Nintendo Switch 2, and Xbox Series X/S. Players control Mina, a brilliant Hollower who must burrow beneath the earth and utilize a reliable whip to purge a cursed Victorian island of monstrous threats. The game boasts incredibly tight controls, complex environmental puzzle designs, and a brilliant, authentic chiptune soundtrack, earning the title a coveted 91 Metacritic \"Must-Play\" rating within its first week.",
          hasLink: true,
          link: "https://store.steampowered.com/app/1875580/Mina_the_Hollower/"
        },
        {
          title: "BrokenLore: FOLLOW",
          tag: "Psychological Horror",
          meta: "Released on June 1, 2026",
          blurb: "Unravel a disturbing, digital-age nightmare exploring the traumatic side of social media.",
          fullSummary: "Developed and published by Serafini Productions, this highly atmospheric first-person psychological horror title makes its official debut on PC, PlayStation 5, and Xbox Series X/S. Serving as a crucial narrative expansion to the developer's horror universe, players guide a young woman named Anne as she navigates distorted, surreal nightmares representing personal trauma, body dysmorphia, and worthlessness. Utilizing the power of Unreal Engine 5, the game delivers photorealistic environments, complex spatial sound design, and deeply unsettling puzzle mechanics to intensify the terrifying psychological journey.",
          hasLink: true,
          link: "https://store.steampowered.com/app/2846530/BrokenLore__FOLLOW/"
        }
      ]
    },
    {
      type: "indie",
      name: "Indie Releases",
      desc: "Innovative and cozy hits driving the indie scene.",
      icon: "",
      stories: [
        {
          title: "Arcane Merchant",
          tag: "Shopkeeping Simulation",
          meta: "Released on June 1, 2026",
          blurb: "Turn a dusty roadside table into the realm's premier magical trading hub.",
          fullSummary: "Developed and published by Findie Studios, this cozy medieval fantasy shopkeeping sim officially launches on PC via Steam. Players step into the shoes of an aspiring shopkeeper, tasked with procuring rare ingredients, brewing potent potions, arranging inventory, and setting prices to win customer trust. The gameplay seamlessly balances a relaxing 3D low-stress aesthetic with deep marketplace systems, allowing users to eventually hire automated assistants and finance heroic expeditions to secure legendary loot. The title launches with a 10% promotional discount during its first two weeks.",
          hasLink: true,
          link: "https://store.steampowered.com/app/4086760/Arcane_Merchant/"
        },
        {
          title: "Town to City",
          tag: "Cozy City Builder",
          meta: "Released on May 26, 2026",
          blurb: "Build and expand a stunning, grid-free 19th-century Mediterranean paradise.",
          fullSummary: "Created by Galaxy Grove—the award-winning indie studio behind Station to Station—and published on Steam, this cozy town planner officially makes its 1.0 debut. Players are invited to bypass traditional grid constraints to design an idyllic 19th-century coastal town and guide its transition into a bustling, prosperous city. The game utilizes highly detailed, stylized 3D graphics and deep simulation mechanics to track the dynamic needs and happiness of your growing population. With extensive customization options for every structure, players can build their dream Mediterranean landscape at their own relaxing pace.",
          hasLink: true,
          link: "https://store.steampowered.com/app/3115220/Town_to_City/"
        },
        {
          title: "33 Immortals",
          tag: "Co-op Action Roguelike",
          meta: "Released on June 10, 2026",
          blurb: "Rally your fellow rebels and face the ultimate wrath of God in hell.",
          fullSummary: "Developed and published by Thunder Lotus Games, this unique 33-player co-op action-roguelike celebrates its highly anticipated 1.0 launch on PC and Xbox Series X/S. Players step into the shoes of damned souls rebelling against God's final judgment, embarking on intense runs that require massive coordination and synergy. The game implements highly stylized, hand-drawn 2D animation, deep build customization, and cooperative raid-like boss fights that challenge groups to coordinate their special abilities via in-game emotes. It represents a massive scale leap for multiplayer roguelike games.",
          hasLink: true,
          link: "https://store.steampowered.com/app/958520/33_Immortals/"
        }
      ]
    },
    {
      type: "tech",
      name: "Breakthrough Tech Announcements",
      desc: "Next-generation silicon and hardware shaping future systems.",
      icon: "",
      stories: [
        {
          title: "NVIDIA RTX Spark Superchip",
          tag: "Mobile PC Hardware",
          meta: "Announced on May 31, 2026",
          blurb: "NVIDIA completely reinvents personal computer architecture for local AI and high-end gaming.",
          fullSummary: "Unveiled by CEO Jensen Huang at GTC Taipei ahead of Computex 2026, the NVIDIA RTX Spark is an ARM-based superchip designed to power a brand-new class of Windows AI PCs. Capable of delivering a staggering 1 Petaflop of AI performance, the SoC utilizes unified memory configurations up to 128GB to run 120-billion-parameter local AI agents securely. For gamers, the chip is a revolution, demonstrating the ability to run high-end AAA games like Alan Wake 2 on native ARM builds at 1440p resolution, easily pushing frame rates beyond 100 FPS with unprecedented battery efficiency.",
          hasLink: false,
          link: ""
        },
        {
          title: "Intel Arc G3 and G3 Extreme Processors",
          tag: "Handheld CPU Architecture",
          meta: "Announced on June 4, 2026",
          blurb: "Intel challenges AMD's portable console dominance with powerful Panther Lake chipsets.",
          fullSummary: "Officially introduced at Computex 2026, Intel's new Arc G3 and G3 Extreme processors are low-power mobile CPUs tailored specifically for next-generation handheld gaming PCs. Leveraging Intel's advanced Panther Lake architecture, these 14-core processors operate within a highly flexible 25 to 80-watt power envelope to maximize device battery life. The top-tier G3 Extreme incorporates the flagship Battlemage-based B390 integrated GPU, promising graphical performance that comfortably beats AMD's dominant Ryzen Z-series. Hardware partners MSI, Acer, and OneXPlayer have already confirmed integration in their upcoming 2026 handheld consoles.",
          hasLink: false,
          link: ""
        }
      ]
    },
    {
      type: "entertainment",
      name: "Multimedia & Entertainment",
      desc: "Crossover narratives and adaptations taking over streaming.",
      icon: "",
      stories: [
        {
          title: "Return to Silent Hill Hulu Premiere",
          tag: "Horror Adaptation",
          meta: "Released on June 13, 2026",
          blurb: "The polarizing video game adaptation defies box office struggles to dominate streaming.",
          fullSummary: "Directed by Christophe Gans and starring Jeremy Irvine, this atmospheric psychological horror film made its highly anticipated streaming debut on Hulu. Directly adapting the psychological narrative of Konami’s Silent Hill 2, the film follows James Sunderland's terrifying search for his lost love in the fog-drenched, monster-infested town. Despite attracting mixed critical scores during its theatrical run, the film experienced a massive post-release renaissance on streaming. It immediately rocketed up the charts to secure the absolute No. 1 spot as the most-streamed movie on Hulu in the United States.",
          hasLink: false,
          link: ""
        },
        {
          title: "Castlevania: Belmont's Curse Animated Series Announcement",
          tag: "Animated Series",
          meta: "Announced on June 5, 2026",
          blurb: "Netflix officially expands its acclaimed gothic universe with a legendary new chapter.",
          fullSummary: "Revealed during the Summer Game Fest 2026 live showcase, Netflix and Project 51 officially announced Castlevania: Belmont's Curse, a brand-new animated television adaptation. Drawing primary inspiration from Konami's classic 1989 NES game, Castlevania III: Dracula's Curse, this series acts as a direct expansion of the streaming giant’s popular gothic fantasy universe. The show will chronicle the legendary alliance of Trevor Belmont, the sorceress Sypha Belnades, and the dhampir Alucard as they wage a bloody war against Dracula's demonic hordes. Production is underway, promising to keep the stellar animation and mature storytelling standards of the franchise.",
          hasLink: false,
          link: ""
        }
      ]
    }
  ]
};

async function main() {
  const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf-8'));
  const app = initializeApp(config);
  const db = getFirestore(app, config.firestoreDatabaseId);

  const month = "June";
  const year = "2026";

  const draftId = `${month.toLowerCase()}-${year}`;
  const testDraftId = `${month.toLowerCase()}-${year}-test`;

  console.log('Inserting June 2026 drafts into Firestore...');

  try {
    const draftRef = doc(db, "newsletter_drafts", draftId);
    const testDraftRef = doc(db, "newsletter_drafts", testDraftId);

    const draftDoc = {
      month,
      year,
      content: draftData,
      updatedAt: new Date().toISOString()
    };

    await setDoc(draftRef, draftDoc);
    await setDoc(testDraftRef, draftDoc);

    console.log('SUCCESS: June 2026 drafts uploaded to Firestore successfully.');
  } catch (error: any) {
    console.error('FAILED to upload drafts to Firestore:', error.message || error);
    process.exit(1);
  }

  // Set up Nodemailer to send a copy to Jgreen2196
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
  
  // Clear the rate limit cache file so that the test send succeeds immediately
  try {
    if (fs.existsSync('last_sent_emails.json')) {
      fs.unlinkSync('last_sent_emails.json');
      console.log('SUCCESS: Cleared developer email sending rate limits.');
    }
  } catch (err: any) {
    console.warn('Could not clear rate limit cache:', err.message);
  }

  console.log('Sending test newsletter to jgreen2196@gmail.com...');
  
  // Send the test newsletter (forceRefresh = false so it uses the Firestore draft we just saved)
  const success = await agent.sendTestNewsletter('jgreen2196@gmail.com', month, year, false);
  
  if (success) {
    console.log('SUCCESS: Test newsletter sent to jgreen2196@gmail.com using the new draft!');
  } else {
    console.error('FAILED to send test newsletter to jgreen2196@gmail.com');
  }

  process.exit(0);
}

main().catch(console.error);
