import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GlitchTitle } from './GlitchTitle';

const socialLinks = [
  {
    name: 'INSTAGRAM',
    handle: '@greens.screens',
    url: 'https://www.instagram.com/greens.screens/',
    icon: '📸'
  },
  {
    name: 'YOUTUBE',
    handle: '@Greens.screens',
    url: 'https://www.youtube.com/@Greens.screens',
    icon: '📺'
  },
  {
    name: 'DISCORD',
    handle: 'Join the server',
    url: 'https://discord.gg/rBdb9bsNaS',
    icon: '💬'
  },
  {
    name: 'TIKTOK',
    handle: '@greens.screens.ent',
    url: 'https://www.tiktok.com/@greens.screens.ent',
    icon: '🎵'
  }
];

interface SocialCardProps {
  social: {
    name: string;
    handle: string;
    url: string;
    icon: string;
  };
  index: number;
}

const SocialCard: React.FC<SocialCardProps> = ({ social, index }) => {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
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
        duration: 1.0,
        ease: [0.16, 1, 0.3, 1] as const,
        delay: index * 0.1
      }
    }
  };

  const contentVariants = {
    hidden: {
      opacity: 0,
      y: 12
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] as const,
        delay: index * 0.1 + 0.15
      }
    }
  };

  const lineVariants = {
    hidden: { top: '0%', opacity: 0 },
    visible: {
      top: ['0%', '100%'],
      opacity: [0, 1, 1, 0],
      transition: {
        duration: 1.0,
        ease: [0.16, 1, 0.3, 1] as const,
        delay: index * 0.1
      }
    }
  };

  return (
    <motion.a 
      href={social.url} 
      target="_blank" 
      rel="noopener noreferrer"
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="bg-gs-card border border-gs-border p-6 flex items-center gap-4 no-underline transition-all hover:border-gs-green/45 hover:-translate-y-[3px] group relative overflow-hidden"
    >
      {/* Holographic Laser Scanline */}
      <motion.div 
        variants={lineVariants}
        className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gs-green to-transparent z-30 pointer-events-none shadow-[0_0_8px_rgba(0,255,136,0.8)]"
      />

      {/* Dynamic Holographic Spotlight Overlay */}
      {isHovered && (
        <div 
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            background: `radial-gradient(250px circle at ${coords.x}px ${coords.y}px, rgba(0, 255, 136, 0.08), transparent 80%)`,
          }}
        />
      )}

      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gs-green scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100" />
      
      <motion.div variants={contentVariants} className="w-full flex items-center gap-4 relative z-10">
        <div className="w-[42px] h-[42px] flex-shrink-0 bg-gs-green/10 border border-[#203a2a] flex items-center justify-center text-xl relative z-10 group-hover:border-gs-green/40 transition-colors">
          {social.icon}
        </div>
        <div>
          <div className="font-display text-lg tracking-[2px] text-gs-text mb-0.5">{social.name}</div>
          <div className="font-mono text-[11px] text-gs-green opacity-70">{social.handle}</div>
        </div>
        <span className="ml-auto text-gs-muted text-base transition-transform duration-200 group-hover:translate-x-1 group-hover:text-gs-green">→</span>
      </motion.div>
    </motion.a>
  );
};

export const SocialGrid: React.FC = () => {
  return (
    <section id="connect" className="relative z-10 px-10 pt-[72px] max-w-[1100px] mx-auto selection:bg-gs-green selection:text-gs-dark">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="font-mono text-[11px] tracking-[4px] text-gs-green mb-2 flex items-center gap-3"
      >
        FIND US
        <span className="flex-1 max-w-[50px] h-[1px] bg-gs-green/40" />
      </motion.div>
      <GlitchTitle 
        text="STAY CONNECTED" 
        className="font-display text-[clamp(32px,4.5vw,56px)] tracking-[3px] text-gs-text mb-3" 
      />
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-base text-gs-muted max-w-[520px] leading-[1.6] font-medium"
      >
        Four channels. One collective. Pick your platform and plug in.
      </motion.p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[14px] mt-10">
        {socialLinks.map((social, index) => (
          <SocialCard key={social.name} social={social} index={index} />
        ))}
      </div>
    </section>
  );
};
