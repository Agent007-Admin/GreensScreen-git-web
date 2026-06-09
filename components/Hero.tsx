import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

// Premium terminal decryption text sequence
const GlitchDecryptText: React.FC<{ text: string }> = ({ text }) => {
  const [displayText, setDisplayText] = useState('');
  const chars = '█░▒▓█◣◥▲▼✔✖✚✪✿☣☢☠';

  const triggerDecrypt = () => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(() => {
        return text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < iteration) {
              return text[index];
            }
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('');
      });

      if (iteration >= text.length) {
        clearInterval(interval);
      }
      iteration += 1 / 3;
    }, 35);
  };

  useEffect(() => {
    triggerDecrypt();
  }, [text]);

  return (
    <span 
      onMouseEnter={triggerDecrypt}
      className="cursor-default select-none font-display text-[clamp(22px,3.5vw,44px)] tracking-[8px] text-gs-muted mb-6 inline-block"
    >
      {displayText}
    </span>
  );
};

export const Hero: React.FC = () => {
  const [btnCoords, setBtnCoords] = useState({ x: 0, y: 0 });
  const [btnHovered, setBtnHovered] = useState(false);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="hero" className="relative min-h-[80vh] flex items-center justify-center text-center px-6 py-[60px] overflow-hidden z-10">
      {/* Subtle brand signals ambient colored glows (Red, Blue, Yellow) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        {/* Center Green backing glow */}
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[radial-gradient(ellipse,rgba(0,255,136,0.05)_0%,transparent_70%)]" />

        {/* Red Signal Glow (Left Side) - ON THE RADAR color style with gentle orbit/floating */}
        <motion.div 
          animate={{
            x: [-30, 30, -15, -30],
            y: [-20, 25, -30, -20],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
          className="absolute top-[10%] left-[8%] w-[400px] h-[400px] rounded-full bg-[radial-gradient(circle,rgba(255,32,32,0.025)_0%,transparent_70%)]"
        />

        {/* Blue Signal Glow (Right Side) - LOADING... color style with gentle offset orbit */}
        <motion.div 
          animate={{
            x: [25, -25, 30, 25],
            y: [15, -30, 20, 15],
          }}
          transition={{
            duration: 26,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
          className="absolute top-[20%] right-[5%] w-[450px] h-[450px] rounded-full bg-[radial-gradient(circle,rgba(0,212,255,0.025)_0%,transparent_70%)]"
        />

        {/* Yellow Signal Glow (Bottom Center) - CHECKPOINT color style with slow breathing pulse */}
        <motion.div 
          animate={{
            scale: [0.95, 1.08, 0.98, 0.95],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
          }}
          className="absolute bottom-[8%] left-[28%] w-[380px] h-[380px] rounded-full bg-[radial-gradient(circle,rgba(255,224,51,0.025)_0%,transparent_70%)]"
        />

        {/* SMALL PULSATING FLOATING ORBS (RED, BLUE, YELLOW) - CONTINUOUS RIGHT-TO-LEFT SPACE DRIFT */}
        
        {/* Red Orb 1 */}
        <motion.div
          initial={{ left: "105%" }}
          animate={{
            left: ["105%", "-10%"],
          }}
          transition={{
            duration: 38,
            repeat: Infinity,
            ease: "linear",
            delay: -8,
          }}
          className="absolute top-[18%] w-3 h-3"
        >
          <motion.div
            animate={{
              opacity: [0.4, 0.95, 0.4],
              scale: [0.9, 1.2, 0.9],
              y: [-15, 15, -15],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-full h-full rounded-full bg-[#ff3333] shadow-[0_0_12px_rgba(255,51,51,0.9),_0_0_24px_rgba(255,51,51,0.55)]"
          />
        </motion.div>

        {/* Blue Orb 2 */}
        <motion.div
          initial={{ left: "105%" }}
          animate={{
            left: ["105%", "-10%"],
          }}
          transition={{
            duration: 28,
            repeat: Infinity,
            ease: "linear",
            delay: -22,
          }}
          className="absolute top-[32%] w-3 h-3"
        >
          <motion.div
            animate={{
              opacity: [0.4, 0.85, 0.4],
              scale: [0.85, 1.15, 0.85],
              y: [12, -12, 12],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-full h-full rounded-full bg-[#00d4ff] shadow-[0_0_12px_rgba(0,212,255,0.9),_0_0_24px_rgba(0,212,255,0.55)]"
          />
        </motion.div>

        {/* Yellow Orb 3 */}
        <motion.div
          initial={{ left: "105%" }}
          animate={{
            left: ["105%", "-10%"],
          }}
          transition={{
            duration: 46,
            repeat: Infinity,
            ease: "linear",
            delay: -35,
          }}
          className="absolute top-[48%] w-2.5 h-2.5"
        >
          <motion.div
            animate={{
              opacity: [0.4, 0.9, 0.4],
              scale: [0.9, 1.2, 0.9],
              y: [-20, 20, -20],
            }}
            transition={{
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-full h-full rounded-full bg-[#FFE033] shadow-[0_0_10px_rgba(255,224,51,0.9),_0_0_22px_rgba(255,224,51,0.55)]"
          />
        </motion.div>

        {/* Red Orb 4 */}
        <motion.div
          initial={{ left: "105%" }}
          animate={{
            left: ["105%", "-10%"],
          }}
          transition={{
            duration: 33,
            repeat: Infinity,
            ease: "linear",
            delay: -14,
          }}
          className="absolute top-[65%] w-2.5 h-2.5"
        >
          <motion.div
            animate={{
              opacity: [0.4, 0.85, 0.4],
              scale: [0.85, 1.15, 0.85],
              y: [15, -15, 15],
            }}
            transition={{
              duration: 5.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-full h-full rounded-full bg-[#ff3333] shadow-[0_0_10px_rgba(255,51,51,0.9),_0_0_22px_rgba(255,51,51,0.55)]"
          />
        </motion.div>

        {/* Yellow Orb 5 */}
        <motion.div
          initial={{ left: "105%" }}
          animate={{
            left: ["105%", "-10%"],
          }}
          transition={{
            duration: 42,
            repeat: Infinity,
            ease: "linear",
            delay: -28,
          }}
          className="absolute top-[26%] w-2 h-2"
        >
          <motion.div
            animate={{
              opacity: [0.35, 0.8, 0.35],
              scale: [0.85, 1.15, 0.85],
              y: [-10, 10, -10],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-full h-full rounded-full bg-[#FFE033] shadow-[0_0_8px_rgba(255,224,51,0.85),_0_0_18px_rgba(255,224,51,0.45)]"
          />
        </motion.div>

        {/* Blue Orb 6 (Extra for depth) */}
        <motion.div
          initial={{ left: "105%" }}
          animate={{
            left: ["105%", "-10%"],
          }}
          transition={{
            duration: 35,
            repeat: Infinity,
            ease: "linear",
            delay: -5,
          }}
          className="absolute top-[58%] w-2 h-2"
        >
          <motion.div
            animate={{
              opacity: [0.35, 0.8, 0.35],
              scale: [0.85, 1.1, 0.85],
              y: [12, -12, 12],
            }}
            transition={{
              duration: 4.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-full h-full rounded-full bg-[#00d4ff] shadow-[0_0_8px_rgba(0,212,255,0.85),_0_0_18px_rgba(0,212,255,0.45)]"
          />
        </motion.div>

        {/* Red Orb 7 (High ambient drift, small) */}
        <motion.div
          initial={{ left: "105%" }}
          animate={{
            left: ["105%", "-10%"],
          }}
          transition={{
            duration: 45,
            repeat: Infinity,
            ease: "linear",
            delay: -18,
          }}
          className="absolute top-[12%] w-2 h-2"
        >
          <motion.div
            animate={{
              opacity: [0.3, 0.75, 0.3],
              scale: [0.8, 1.1, 0.8],
              y: [-8, 8, -8],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-full h-full rounded-full bg-[#ff3333] shadow-[0_0_8px_rgba(255,51,51,0.8),_0_0_18px_rgba(255,51,51,0.4)]"
          />
        </motion.div>

        {/* Blue Orb 8 (Lower speed-drift, medium size) */}
        <motion.div
          initial={{ left: "105%" }}
          animate={{
            left: ["105%", "-10%"],
          }}
          transition={{
            duration: 24,
            repeat: Infinity,
            ease: "linear",
            delay: -12,
          }}
          className="absolute top-[72%] w-2.5 h-2.5"
        >
          <motion.div
            animate={{
              opacity: [0.4, 0.9, 0.4],
              scale: [0.85, 1.15, 0.85],
              y: [10, -10, 10],
            }}
            transition={{
              duration: 3.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-full h-full rounded-full bg-[#00d4ff] shadow-[0_0_10px_rgba(0,212,255,0.9),_0_0_22px_rgba(0,212,255,0.5)]"
          />
        </motion.div>

        {/* Yellow Orb 9 (Mid-altitude slow slider) */}
        <motion.div
          initial={{ left: "105%" }}
          animate={{
            left: ["105%", "-10%"],
          }}
          transition={{
            duration: 39,
            repeat: Infinity,
            ease: "linear",
            delay: -29,
          }}
          className="absolute top-[40%] w-3 h-3"
        >
          <motion.div
            animate={{
              opacity: [0.4, 0.95, 0.4],
              scale: [0.9, 1.2, 0.9],
              y: [-15, 15, -15],
            }}
            transition={{
              duration: 6.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-full h-full rounded-full bg-[#FFE033] shadow-[0_0_12px_rgba(255,224,51,0.95),_0_0_24px_rgba(255,224,51,0.55)]"
          />
        </motion.div>

        {/* Red Orb 10 (Deep space background, slow and soft) */}
        <motion.div
          initial={{ left: "105%" }}
          animate={{
            left: ["105%", "-10%"],
          }}
          transition={{
            duration: 41,
            repeat: Infinity,
            ease: "linear",
            delay: -10,
          }}
          className="absolute top-[54%] w-2 h-2"
        >
          <motion.div
            animate={{
              opacity: [0.35, 0.8, 0.35],
              scale: [0.85, 1.1, 0.85],
              y: [8, -8, 8],
            }}
            transition={{
              duration: 4.8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="w-full h-full rounded-full bg-[#ff3333] shadow-[0_0_8px_rgba(255,51,51,0.8),_0_0_18px_rgba(255,51,51,0.4)]"
          />
        </motion.div>
      </div>
      
      <div className="relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="font-mono text-[11px] tracking-[3px] text-gs-green mb-4 flex items-center justify-center gap-3"
        >
          <span className="w-9 h-[1px] bg-gs-green/50" />
          TECHNOLOGY · GAMING · ENTERTAINMENT
          <span className="w-9 h-[1px] bg-gs-green/50" />
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
          className="font-display text-[clamp(56px,11vw,120px)] leading-[0.9] tracking-[4px] text-gs-text mb-2"
        >
          <span className="text-gs-green neon-text-strong">GREENS</span>
          <br />SCREENS<br />
          <span className="text-gs-green neon-text-strong">ENT</span>
        </motion.h1>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <GlitchDecryptText text="THE UMBRELLA_" />
        </motion.div>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="max-w-[520px] mx-auto text-base font-medium text-gs-muted leading-[1.6] mb-9"
        >
          A technology-first collective building at the intersection of gaming, creative media, and digital entertainment. Where the signal is always green.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="flex gap-[14px] justify-center flex-wrap"
        >
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            onClick={() => scrollTo('newsletter')}
            className="relative font-mono text-[12px] tracking-[2px] text-gs-dark bg-gs-green border-none px-8 py-3 cursor-pointer btn-clip font-bold uppercase overflow-hidden group"
          >
            <motion.div 
              className="absolute inset-y-0 w-12 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
              initial={{ left: "-100%" }}
              whileHover={{ left: "200%" }}
              transition={{ duration: 0.65, ease: "easeOut" }}
            />
            <span className="relative z-10">JOIN THE COLLECTIVE</span>
          </motion.button>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
            onClick={() => scrollTo('connect')}
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              setBtnCoords({
                x: e.clientX - rect.left,
                y: e.clientY - rect.top,
              });
            }}
            onMouseEnter={() => setBtnHovered(true)}
            onMouseLeave={() => setBtnHovered(false)}
            className="relative font-mono text-[12px] tracking-[2px] text-gs-green bg-transparent border border-gs-green/40 px-8 py-3 cursor-pointer btn-clip font-bold uppercase transition-colors overflow-hidden"
          >
            {/* Holographic Cursor Spotlight Overlay */}
            {btnHovered && (
              <div 
                className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                style={{
                  background: `radial-gradient(100px circle at ${btnCoords.x}px ${btnCoords.y}px, rgba(0, 255, 136, 0.15), transparent 80%)`,
                }}
              />
            )}
            <span className="relative z-10">FIND US ONLINE</span>
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
};
