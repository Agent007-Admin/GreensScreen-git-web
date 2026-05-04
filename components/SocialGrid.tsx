import React from 'react';
import { motion } from 'framer-motion';

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
  }
];

export const SocialGrid: React.FC = () => {
  return (
    <section id="connect" className="relative z-10 px-10 pt-[72px] max-w-[1100px] mx-auto">
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="font-mono text-[11px] tracking-[4px] text-gs-green mb-2 flex items-center gap-3"
      >
        FIND US
        <span className="flex-1 max-w-[50px] h-[1px] bg-gs-green/40" />
      </motion.div>
      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="font-display text-[clamp(32px,4.5vw,56px)] tracking-[3px] text-gs-text mb-3"
      >
        STAY CONNECTED
      </motion.h2>
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-base text-gs-muted max-w-[520px] leading-[1.6] font-medium"
      >
        Three channels. One collective. Pick your platform and plug in.
      </motion.p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-[14px] mt-10">
        {socialLinks.map((social, index) => (
          <motion.a 
            key={social.name}
            href={social.url} 
            target="_blank" 
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-gs-card border border-gs-border p-6 flex items-center gap-4 no-underline transition-all hover:border-gs-green/40 hover:-translate-y-[3px] group relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gs-green scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100" />
            <div className="absolute inset-0 bg-gs-green/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <div className="w-[42px] h-[42px] flex-shrink-0 bg-gs-green/10 border border-gs-border flex items-center justify-center text-xl relative z-10">
              {social.icon}
            </div>
            <div className="relative z-10">
              <div className="font-display text-lg tracking-[2px] text-gs-text mb-0.5">{social.name}</div>
              <div className="font-mono text-[11px] text-gs-green opacity-70">{social.handle}</div>
            </div>
            <span className="ml-auto text-gs-muted text-base transition-transform duration-200 group-hover:translate-x-1 group-hover:text-gs-green relative z-10">→</span>
          </motion.a>
        ))}
      </div>
    </section>
  );
};
