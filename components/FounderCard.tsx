import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GlitchTitle } from './GlitchTitle';

export const FounderCard: React.FC = () => {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const cardVariants = {
    hidden: { 
      scale: 1.08,
      opacity: 0,
      filter: 'blur(10px)'
    },
    visible: {
      scale: 1,
      opacity: 1,
      filter: 'blur(0px)',
      transition: {
        duration: 1.2,
        ease: [0.16, 1, 0.3, 1] as const
      }
    }
  };

  const contentVariants = {
    hidden: {
      opacity: 0,
      y: 15
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] as const,
        delay: 0.15
      }
    }
  };

  const lineVariants = {
    hidden: { top: '0%', opacity: 0 },
    visible: {
      top: ['0%', '100%'],
      opacity: [0, 1, 1, 0],
      transition: {
        duration: 1.2,
        ease: [0.16, 1, 0.3, 1] as const
      }
    }
  };

  return (
    <div id="team" className="relative z-10 max-w-[1100px] mx-auto px-10 py-[72px]">
      <GlitchTitle 
        text="THE TEAM" 
        className="font-display text-[clamp(44px,8vw,84px)] tracking-[8px] text-gs-green mb-10" 
      />
      
      <motion.div 
        variants={cardVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="bg-gs-card border border-gs-border p-10 md:px-12 md:py-10 flex flex-col md:flex-row items-start md:items-center gap-10 transition-colors hover:border-gs-green/40 group relative overflow-hidden founder-card-accent cursor-default"
      >
        {/* Holographic Laser Scanline */}
        <motion.div 
          variants={lineVariants}
          className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gs-green to-transparent z-30 pointer-events-none shadow-[0_0_8px_rgba(0,255,136,0.8)]"
        />

        {/* Holographic Cursor Spotlight Overlay */}
        {isHovered && (
          <div 
            className="absolute inset-0 pointer-events-none transition-opacity duration-300"
            style={{
              background: `radial-gradient(400px circle at ${coords.x}px ${coords.y}px, rgba(0, 255, 136, 0.08), transparent 80%)`,
            }}
          />
        )}

        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gs-green scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100 z-20" />
        
        <motion.div variants={contentVariants} className="w-full flex flex-col md:flex-row items-start md:items-center gap-10 relative z-10">
          <div className="w-[88px] h-[88px] rounded-full flex-shrink-0 bg-gs-green/10 border-2 border-gs-green/40 flex items-center justify-center font-display text-[32px] text-gs-green relative z-10">
            JG
          </div>
          <div className="flex-1 relative z-10">
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
      </motion.div>
    </div>
  );
};
