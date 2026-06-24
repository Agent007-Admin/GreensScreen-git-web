import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { betaGamesList } from '../src/data/betaGames';
import { BetaGame } from '../types';
import styles from './BetaRadar.module.css';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

// Link Quality Validation Rule configuration
const LINK_RULES = {
  storePatterns: [
    { host: 'store.steampowered.com', mustMatch: /\/app\/\d+/i },
    { host: 'store.playstation.com', mustMatch: /\/product\/|\/concept\//i },
    { host: 'xbox.com', mustMatch: /\/games\/|\/play\//i },
    { host: 'microsoft.com', mustMatch: /\/p\//i },
    { host: 'store.epicgames.com', mustMatch: /\/p\/|\/product\//i },
    { host: 'itch.io', mustMatch: /.+\.itch\.io|\/.+/i }
  ],
  blockedHosts: [
    'alphabetagamer.com', 'gematsu.com', 'gamerpower.com', 'operationsports.com',
    'pcgamer.com', 'ign.com', 'gamespot.com', 'polygon.com', 'kotaku.com',
    'youtube.com', 'youtu.be', 'twitter.com', 'x.com', 'reddit.com',
    'facebook.com', 'tiktok.com', 'instagram.com', 'massivelyop.com', 'games.gg'
  ]
};

function validateLink(url: string): { ok: boolean; reason?: string } {
  if (!url) return { ok: false, reason: 'No link provided' };
  let u: URL;
  try {
    u = new URL(url);
  } catch (e) {
    return { ok: false, reason: 'Not a valid URL' };
  }
  if (u.protocol !== 'https:') return { ok: false, reason: 'Must be https' };
  const host = u.hostname.replace(/^www\./, '');
  
  if (LINK_RULES.blockedHosts.some(h => host === h || host.endsWith('.' + h))) {
    return { ok: false, reason: 'Article/aggregator/social link — not the game itself' };
  }
  
  const store = LINK_RULES.storePatterns.find(s => host === s.host || host.endsWith('.' + s.host));
  if (store && !store.mustMatch.test(u.pathname)) {
    return { ok: false, reason: 'Store homepage, not the specific game page' };
  }
  
  return { ok: true };
}

function daysUntil(d: string): number | null {
  if (!d) return null;
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  const targetDate = new Date(d + 'T00:00:00');
  const diffTime = targetDate.getTime() - t.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

function statusOf(b: { start: string; end: string }): 'ended' | 'upcoming' | 'live' {
  const s = daysUntil(b.start);
  const e = daysUntil(b.end);
  if (e !== null && e < 0) return 'ended';
  if (s !== null && s > 0) return 'upcoming';
  return 'live';
}

function badgeClass(t: string): string {
  switch (t) {
    case 'Open Beta': return styles.bOpen;
    case 'Closed Beta': return styles.bClosed;
    case 'Playtest': return styles.bPlaytest;
    case 'Demo': return styles.bDemo;
    default: return styles.bOpen;
  }
}

export const BetaRadar: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'live' | 'upcoming'>('all');
  const [activeTypes, setActiveTypes] = useState<Set<string>>(new Set());
  const [activePlats, setActivePlats] = useState<Set<string>>(new Set());
  const [visibleLimit, setVisibleLimit] = useState(6);

  const [games, setGames] = useState<BetaGame[]>(betaGamesList);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const fetchGames = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'beta_radar_games'));
        if (!active) return;
        if (!querySnapshot.empty) {
          const list: BetaGame[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            list.push({
              id: doc.id,
              title: data.title || '',
              type: data.type || 'Open Beta',
              platforms: data.platforms || [],
              genres: data.genres || [],
              desc: data.desc || '',
              start: data.start || '',
              end: data.end || '',
              link: data.link || '',
              spotlight: !!data.spotlight,
              gseNote: data.gseNote || '',
              indieBreakout: !!data.indieBreakout,
            });
          });
          setGames(list);
        }
      } catch (error) {
        console.warn('Error loading dynamic beta games from Firestore, falling back to static seed:', error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };
    fetchGames();
    return () => {
      active = false;
    };
  }, []);

  // Validate and filter down to legitimate direct signup links
  const validBetas = games.filter(b => validateLink(b.link).ok);

  // Counters
  const countAll = validBetas.length;
  const countLive = validBetas.filter(b => statusOf(b) === 'live').length;
  const countUpcoming = validBetas.filter(b => statusOf(b) === 'upcoming').length;

  const toggleTypeFilter = (type: string) => {
    const next = new Set(activeTypes);
    if (next.has(type)) {
      next.delete(type);
    } else {
      next.add(type);
    }
    setActiveTypes(next);
  };

  const togglePlatFilter = (plat: string) => {
    const next = new Set(activePlats);
    if (next.has(plat)) {
      next.delete(plat);
    } else {
      next.add(plat);
    }
    setActivePlats(next);
  };  // Filter game feed
  let filtered = validBetas.filter(b => {
    const st = statusOf(b);

    // Tab filters
    if (activeTab === 'live' && st !== 'live') return false;
    if (activeTab === 'upcoming' && st !== 'upcoming') return false;

    // Type filters
    if (activeTypes.size > 0 && !activeTypes.has(b.type)) return false;

    // Platform filters
    if (activePlats.size > 0 && !activePlats.has('PC') && b.platforms.includes('PC')) {
      const matchesAnyOtherActive = [...activePlats].some(p => b.platforms.includes(p));
      if (!matchesAnyOtherActive) return false;
    } else if (activePlats.size > 0 && ![...activePlats].some(p => b.platforms.includes(p))) {
      return false;
    }

    return true;
  });

  // Sort: live first, then upcoming, then ended; within that, soonest end date first
  const rank = { live: 0, upcoming: 1, ended: 2 };
  filtered.sort((a, b) => {
    const ra = rank[statusOf(a)];
    const rb = rank[statusOf(b)];
    if (ra !== rb) return ra - rb;
    return (daysUntil(a.end) ?? 999999) - (daysUntil(b.end) ?? 999999);
  });

  return (
    <section id="beta-radar" className={`${styles.betaRadarContainer} relative z-10 px-6 md:px-10 py-16 max-w-[1100px] mx-auto selection:bg-gs-green selection:text-gs-dark`}>
      <motion.div 
        className={styles.wrap}
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Header */}
        <div className={styles.brandline}>
          <span className={styles.dot} />
          GREENS_SCREENS_ENT // SIGNAL_ALWAYS_GREEN
        </div>
        <h1 className={styles.title}>
          BETA <span className={styles.accent}>RADAR</span>
        </h1>
        <div className={styles.tag}>
          LIVE GAME BETA DISCOVERY // OPEN · CLOSED · PLAYTESTS · DEMOS
        </div>

        {/* Controls (Tabs & Search Bar) */}
        <div className={styles.controls}>
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${activeTab === 'all' ? styles.active : ''}`}
              onClick={() => setActiveTab('all')}
            >
              ALL <span className={styles.count}>{countAll}</span>
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'live' ? styles.active : ''}`}
              onClick={() => setActiveTab('live')}
            >
              LIVE NOW <span className={styles.count}>{countLive}</span>
            </button>
            <button
              className={`${styles.tab} ${activeTab === 'upcoming' ? styles.active : ''}`}
              onClick={() => setActiveTab('upcoming')}
            >
              UPCOMING <span className={styles.count}>{countUpcoming}</span>
            </button>
          </div>
        </div>

        {/* Filters Grid */}
        <div className={styles.filters}>
          <button
            className={`${styles.chip} ${activeTypes.has('Open Beta') ? styles.on : ''}`}
            onClick={() => toggleTypeFilter('Open Beta')}
          >
            OPEN BETA
          </button>
          <button
            className={`${styles.chip} ${activeTypes.has('Closed Beta') ? styles.on : ''}`}
            onClick={() => toggleTypeFilter('Closed Beta')}
          >
            CLOSED BETA
          </button>
          <button
            className={`${styles.chip} ${activeTypes.has('Playtest') ? styles.on : ''}`}
            onClick={() => toggleTypeFilter('Playtest')}
          >
            PLAYTEST
          </button>
          <button
            className={`${styles.chip} ${activeTypes.has('Demo') ? styles.on : ''}`}
            onClick={() => toggleTypeFilter('Demo')}
          >
            DEMO
          </button>
          <button
            className={`${styles.chip} ${styles.plat} ${activePlats.has('PC') ? styles.on : ''}`}
            onClick={() => togglePlatFilter('PC')}
          >
            PC
          </button>
          <button
            className={`${styles.chip} ${styles.plat} ${activePlats.has('PS5') ? styles.on : ''}`}
            onClick={() => togglePlatFilter('PS5')}
          >
            PS5
          </button>
          <button
            className={`${styles.chip} ${styles.plat} ${activePlats.has('Xbox') ? styles.on : ''}`}
            onClick={() => togglePlatFilter('Xbox')}
          >
            XBOX
          </button>
        </div>

        {/* Feed Cards Grid */}
        <div className={styles.feed}>
          {filtered.length === 0 ? (
            <div className={styles.empty}>NO SIGNALS MATCH // ADJUST FILTERS</div>
          ) : (
            filtered.slice(0, visibleLimit).map(b => {
              const st = statusOf(b);
              const e = daysUntil(b.end);
              const s = daysUntil(b.start);

              let stxt = '';
              let scls = '';

              if (st === 'ended') {
                stxt = 'BETA ENDED';
                scls = styles.end;
              } else if (st === 'upcoming') {
                stxt = `STARTS IN ${s} ${s === 1 ? 'DAY' : 'DAYS'}`;
                scls = styles.soon;
              } else if (e !== null && e <= 1) {
                stxt = e === 0 ? 'CLOSES TODAY' : 'CLOSES IN 1 DAY';
                scls = styles.urgent;
              } else {
                stxt = `CLOSES IN ${e} DAYS`;
                scls = styles.live;
              }

              const isUrgentStyle = scls === styles.urgent;

              return (
                <div
                  key={b.id}
                  className={`${styles.card} ${
                    st === 'ended'
                      ? styles.ended
                      : st === 'upcoming'
                      ? styles.upcoming
                      : styles.live
                  } ${isUrgentStyle ? styles.urgent : ''}`}
                >
                  <div className={styles.cardHead}>
                    <div className={styles.badges}>
                      <span className={`${styles.badge} ${badgeClass(b.type)}`}>
                        {b.type.toUpperCase()}
                      </span>
                      {b.indieBreakout && (
                        <span className={`${styles.badge} ${styles.bIndie}`}>
                          ◆ INDIE BREAKOUT
                        </span>
                      )}
                      <span className={`${styles.statusTag} ${scls}`}>
                        {stxt}
                      </span>
                    </div>
                  </div>
                  <div className={styles.cardTitle}>
                    <span>{b.title}</span>
                  </div>
                  <div className={styles.cardDesc}>{b.desc}</div>
                  <div className={styles.cardGenres}>
                    {(b.genres || []).join(' · ')}
                  </div>
                  <div className={styles.cardFoot}>
                    <div>
                      <div className={styles.plats}>{b.platforms.join(' · ')}</div>
                      <div className={styles.dates}>
                        {b.start || '?'} → {b.end || '?'}
                      </div>
                    </div>
                    <a className={styles.signup} href={b.link} target="_blank" rel="noreferrer">
                      {st === 'ended' ? 'INFO ↗' : 'SIGN UP ↗'}
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {filtered.length > visibleLimit && (
          <div className="flex justify-center mt-10">
            <button
              onClick={() => setVisibleLimit(prev => Math.min(prev + 6, 12))}
              className="font-mono text-xs tracking-[3px] border border-[rgba(0,255,136,0.3)] bg-[rgba(0,255,136,0.03)] hover:bg-[rgba(0,255,136,0.12)] hover:border-[#00ff88] text-[#00ff88] px-8 py-3.5 transition-all duration-300 uppercase cursor-pointer relative group overflow-hidden"
            >
              <span className="relative z-10">See more &gt;&gt;</span>
              <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-transparent via-[rgba(0,255,136,0.08)] to-transparent transition-transform duration-500 ease-out" />
            </button>
          </div>
        )}
      </motion.div>
    </section>
  );
};
