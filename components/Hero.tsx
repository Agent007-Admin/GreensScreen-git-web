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
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-[radial-gradient(ellipse,rgba(0,255,136,0.08)_0%,transparent_70%)] pointer-events-none" />
      
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
          <br />SCREENS<br />ENT
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
