import React from 'react';
import { motion } from 'framer-motion';

export const FounderCard: React.FC = () => {
  return (
    <div id="founder" className="relative z-10 max-w-[1100px] mx-auto px-10 py-[72px]">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="font-mono text-[11px] tracking-[4px] text-gs-green mb-6"
      >
        THE COLLECTIVE
      </motion.div>
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="bg-gs-card border border-gs-border p-10 md:px-12 md:py-10 flex flex-col md:flex-row items-start md:items-center gap-10 transition-colors hover:border-gs-green/40 founder-card-accent"
      >
        <div className="w-[88px] h-[88px] rounded-full flex-shrink-0 bg-gs-green/10 border-2 border-gs-green/40 flex items-center justify-center font-display text-[32px] text-gs-green">
          JG
        </div>
        <div className="flex-1">
          <div className="font-mono text-[11px] tracking-[3px] text-gs-green opacity-80 mb-1.5">FOUNDER · CREATIVE DIRECTOR</div>
          <div className="font-display text-[42px] tracking-[3px] text-gs-text mb-2">JEREMY GREEN</div>
          <p className="text-[15px] text-gs-muted leading-[1.6] font-medium max-w-[500px]">
            The signal starts here. Jeremy is the founder and creative force behind Greens Screens Ent — building at the intersection of technology, gaming, and digital culture.
          </p>
          <a 
            href="https://www.linkedin.com/in/jeremy-green-969a1b104/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 font-mono text-[12px] tracking-[1px] text-gs-green no-underline opacity-80 transition-opacity hover:opacity-100"
          >
            <span className="w-7 h-7 bg-gs-green/10 border border-gs-border flex items-center justify-center text-sm font-normal not-italic">in</span>
            CONNECT ON LINKEDIN →
          </a>
        </div>
      </motion.div>
    </div>
  );
};
