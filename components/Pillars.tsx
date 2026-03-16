import React from 'react';
import { motion } from 'framer-motion';

interface PillarProps {
  num: string;
  name: string;
  desc: string;
  isTop?: boolean;
  delay?: number;
}

const PillarCard: React.FC<PillarProps> = ({ num, name, desc, isTop, delay = 0 }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay }}
    className={`bg-gs-card p-7 md:p-8 relative overflow-hidden transition-colors hover:bg-[#111f18] group border-gs-border`}
  >
    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gs-green scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100" />
    <span className="font-mono text-[10px] text-gs-green opacity-50 mb-[10px] tracking-[2px] block">{num}</span>
    <div className={`font-display tracking-[2px] text-gs-text mb-[10px] ${isTop ? 'text-4xl' : 'text-[28px]'}`}>
      {name}
    </div>
    <p className="text-sm text-gs-muted leading-[1.6] font-medium">{desc}</p>
  </motion.div>
);

export const Pillars: React.FC = () => {
  return (
    <section id="about" className="relative z-10 px-10 pt-[72px] max-w-[1100px] mx-auto">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="font-mono text-[11px] tracking-[4px] text-gs-green mb-2 flex items-center gap-3"
      >
        WHAT WE DO
        <span className="flex-1 max-w-[50px] h-[1px] bg-gs-green/40" />
      </motion.div>
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="font-display text-[clamp(32px,4.5vw,56px)] tracking-[3px] text-gs-text mb-3"
      >
        BUILT DIFFERENT
      </motion.h2>
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-base text-gs-muted max-w-[520px] leading-[1.6] font-medium"
      >
        Greens Screens Ent is a technology umbrella covering every angle of gaming and entertainment. Four pillars. One signal.
      </motion.p>

      <div className="mt-10 flex flex-col gap-[1px] bg-gs-border border border-gs-border">
        {/* Row 1: Technology */}
        <div className="grid grid-cols-1 bg-gs-border gap-[1px]">
          <PillarCard 
            num="01" 
            name="💻 TECHNOLOGY" 
            desc="The foundation of everything we build. Tools, platforms, and experiments at the cutting edge of what's possible in digital spaces — powering every pillar beneath it."
            isTop
            delay={0.1}
          />
        </div>
        
        {/* Row 2: Gaming + Entertainment */}
        <div className="grid grid-cols-1 md:grid-cols-2 bg-gs-border gap-[1px]">
          <PillarCard 
            num="02" 
            name="🎮 GAMING" 
            desc="From competitive titles to indie exploration — we play, review, and build culture around games that matter."
            delay={0.2}
          />
          <PillarCard 
            num="03" 
            name="🎬 ENTERTAINMENT" 
            desc="Original content, commentary, and creative productions pushing the boundaries of digital media."
            delay={0.3}
          />
        </div>
        
        {/* Row 3: Community */}
        <div className="grid grid-cols-1 bg-gs-border gap-[1px]">
          <PillarCard 
            num="04" 
            name="🌐 COMMUNITY" 
            desc="Where it all comes together. A growing network of creators, players, and enthusiasts connected by shared passion — and a shared signal."
            delay={0.4}
          />
        </div>
      </div>
    </section>
  );
};
