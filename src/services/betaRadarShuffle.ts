import { GoogleGenAI, Type } from "@google/genai";
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDoc,
  Firestore 
} from "firebase/firestore";
interface BetaGame {
  id: string;
  title: string;
  type: 'Open Beta' | 'Closed Beta' | 'Playtest' | 'Demo';
  platforms: string[];
  genres?: string[];
  desc: string;
  start: string;
  end: string;
  link: string;
  spotlight?: boolean;
  gseNote?: string;
  indieBreakout?: boolean;
}

// Enforce Steam store pattern: https://store.steampowered.com/app/[ID]/[Exact_Game_Name]/
function validateSteamLink(link: string): boolean {
  try {
    const url = new URL(link);
    if (url.hostname !== "store.steampowered.com") return true; // Non-Steam links are allowed
    
    // Check pattern: /app/[ID]/[Name]
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts[0] === "app" && parts[1] && /^\d+$/.test(parts[1])) {
      return true;
    }
  } catch (e) {
    // Ignored
  }
  return false;
}

export async function runBetaRadarShuffle(db: any, apiKey: string) {
  console.log("Starting biweekly Beta Radar shuffle job...");
  
  if (!db) {
    console.error("Cannot shuffle: Firestore database instance is null");
    return;
  }

  try {
    // 1. Fetch current games in Firestore
    const gamesCollection = collection(db, "beta_radar_games");
    const querySnapshot = await getDocs(gamesCollection);
    
    const existingGames: BetaGame[] = [];
    querySnapshot.forEach((doc) => {
      existingGames.push({ id: doc.id, ...doc.data() } as BetaGame);
    });
    
    const todayStr = new Date().toISOString().split("T")[0];
    
    // 2. Identify and clean up outdated games (where end date has passed)
    const activeGames = existingGames.filter(game => {
      if (game.end && game.end < todayStr) {
        console.log(`Removing outdated game: ${game.title} (Ended: ${game.end})`);
        deleteDoc(doc(db, "beta_radar_games", game.id)).catch(err => {
          console.error(`Failed to delete outdated game ${game.id}:`, err);
        });
        return false;
      }
      return true;
    });
    
    console.log(`Remaining active games in pool: ${activeGames.length}`);
    
    // If we already have 12 or more active games, we don't need to add more
    if (activeGames.length >= 12) {
      console.log("Active games pool is already at or above limit (12 games). Shuffle completed.");
      return;
    }
    
    const neededCount = 12 - activeGames.length;
    console.log(`Attempting to discover and add ${neededCount} new announced game betas...`);
    
    if (!apiKey) {
      console.warn("Skipping AI discovery: No Gemini API key provided to shuffle job.");
      return;
    }

    // Initialize Gemini API
    const ai = new GoogleGenAI({ apiKey });
    
    // Prompt Gemini with strict JSON Schema output to discover authentic game betas
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Discover and list up to ${neededCount} actual, real, recently announced game playtests, open betas, closed betas, or demos currently active or starting in June/July/August/September 2026.
      
      CRITICAL LAUNCH & TIMELINE RULES (YEAR IS 2026):
      1. Every suggestion MUST be currently active or scheduled in the future relative to June 2026.
      2. Strictly FORBIDDEN to suggest games released or in beta in 2025 or earlier (e.g. do NOT suggest old games like inZOI, Marvel Rivals, FragPunk, Dune: Awakening, or other titles from 2025). Only suggest real, brand-new, or upcoming 2026 betas/playtests.
      3. If you cannot find high-quality, authentic games fitting these rules, return a smaller list or empty list. QUALITY OVER QUANTITY. We do not need exactly 12 games if valid ones do not exist.
      
      CRITICAL INSTRUCTIONS FOR LINKS:
      1. Every Steam store link MUST follow the exact pattern: https://store.steampowered.com/app/[ID]/[Exact_Game_Name]/
      2. No search results pages, publisher pages, franchise pages, general Steam pages, or placeholder links.
      3. Non-Steam links must be direct registration forms or developer news blogs with exact signup instructions.
      4. Avoid repeating these already existing games: ${activeGames.map(g => g.title).join(", ")}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            newBetas: {
              type: Type.ARRAY,
              description: "List of newly announced game playtests or betas from 2026",
              items: {
                type: Type.OBJECT,
                required: ["id", "title", "type", "platforms", "genres", "desc", "start", "end", "link"],
                properties: {
                  id: { type: Type.STRING, description: "Kebab-case unique identifier for the game" },
                  title: { type: Type.STRING, description: "Name of the game" },
                  type: { 
                    type: Type.STRING, 
                    enum: ["Open Beta", "Closed Beta", "Playtest", "Demo"],
                    description: "Type of playtest"
                  },
                  platforms: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: "Platforms supporting this beta (e.g., PC, PS5, Xbox)"
                  },
                  genres: { 
                    type: Type.ARRAY, 
                    items: { type: Type.STRING },
                    description: "Game genres (e.g., RPG, Shooter, Cozy)"
                  },
                  desc: { type: Type.STRING, description: "A highly punchy 1-2 sentence description of the gameplay and beta" },
                  start: { type: Type.STRING, description: "Start date of the beta in YYYY-MM-DD format (must be June 2026 or later)" },
                  end: { type: Type.STRING, description: "End date of the beta in YYYY-MM-DD format (must be June 2026 or later)" },
                  link: { type: Type.STRING, description: "Direct Steam store app page or official registration URL" },
                  indieBreakout: { type: Type.BOOLEAN, description: "Whether this is an indie breakout title" }
                }
              }
            }
          },
          required: ["newBetas"]
        }
      }
    });
    
    if (response.text) {
      const data = JSON.parse(response.text);
      const candidates: any[] = data.newBetas || [];
      
      let added = 0;
      for (const game of candidates) {
        if (added >= neededCount) break;
        
        // Ensure Steam links strictly match guidelines
        if (!validateSteamLink(game.link)) {
          console.warn(`Skipping candidate ${game.title} due to invalid Steam URL format: ${game.link}`);
          continue;
        }
        
        // Write to Firestore
        const docRef = doc(db, "beta_radar_games", game.id);
        await setDoc(docRef, {
          title: game.title,
          type: game.type,
          platforms: game.platforms,
          genres: game.genres,
          desc: game.desc,
          start: game.start,
          end: game.end,
          link: game.link,
          spotlight: false,
          gseNote: "",
          indieBreakout: !!game.indieBreakout,
          updatedAt: new Date().toISOString()
        });
        
        console.log(`Successfully added newly announced game to Beta Radar: ${game.title}`);
        added++;
      }
      console.log(`Shuffle job completed. Added ${added} new games to reach the target of 12 games.`);
    }
  } catch (error) {
    console.error("Error in runBetaRadarShuffle job:", error);
  }
}
