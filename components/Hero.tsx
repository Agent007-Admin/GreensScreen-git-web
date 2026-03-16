import React from 'react';
import { motion } from 'framer-motion';

export const Hero: React.FC = () => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[80vh] flex items-center justify-center text-center px-6 py-[60px] overflow-hidden z-10">
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display text-[clamp(56px,11vw,120px)] leading-[0.9] tracking-[4px] text-gs-text mb-2"
        >
          <span className="text-gs-green neon-text-strong">GREENS</span>
          <br />SCREENS<br />ENT
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="font-display text-[clamp(22px,3.5vw,44px)] tracking-[8px] text-gs-muted mb-6"
        >
          THE UMBRELLA<span className="blink">_</span>
        </motion.p>
        
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
          <button 
            onClick={() => scrollTo('newsletter')}
            className="font-mono text-[12px] tracking-[2px] text-gs-dark bg-gs-green border-none px-8 py-3 cursor-pointer btn-clip transition-all hover:bg-gs-accent hover:-translate-y-0.5 font-bold uppercase"
          >
            STAY IN THE LOOP
          </button>
          <button 
            onClick={() => scrollTo('connect')}
            className="font-mono text-[12px] tracking-[2px] text-gs-green bg-transparent border border-gs-green/40 px-8 py-3 cursor-pointer btn-clip transition-all hover:bg-gs-green/10 hover:-translate-y-0.5 font-bold uppercase"
          >
            FIND US ONLINE
          </button>
        </motion.div>
      </div>
    </section>
  );
};
