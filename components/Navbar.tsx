import React, { useState } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

export const Navbar: React.FC = () => {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-9 h-14 bg-gs-dark/90 backdrop-blur-xl border-b border-gs-border">
      <div 
        className="flex items-center gap-3 cursor-pointer group"
        onClick={() => scrollTo('hero')}
      >
        <div className="relative flex items-center justify-center">
          <div className="w-2.5 h-2.5 rounded-full bg-gs-green " />
          <div className="absolute inset-x-0 w-2.5 h-2.5 rounded-full bg-gs-green animate-ping opacity-60" />
        </div>
        <div className="font-display text-[22px] tracking-[2px] leading-none mt-0.5">
          <span className="text-gs-green neon-text">GREENS</span>
          <span className="text-gs-text"> SCREENS</span>
          <span className="mx-2 w-[1px] h-5 bg-gs-green/20 inline-block align-middle" />
          <span className="text-gs-green neon-text">ENT</span>
          <span className="hidden lg:inline-block font-mono text-[9px] text-gs-muted tracking-[1px] ml-2 opacity-50">SIGNAL_GREEN</span>
        </div>
      </div>
      
      <ul className="hidden md:flex gap-4 list-none relative">
        {['newsletter', 'segments', 'connect', 'about', 'team'].map((item) => {
          const isHovered = hoveredItem === item;
          const label = item === 'segments' ? 'Signals' : 
                        item === 'newsletter' ? 'Collective' :
                        item;
                        
          return (
            <li 
              key={item}
              onMouseEnter={() => setHoveredItem(item)}
              onMouseLeave={() => setHoveredItem(null)}
              className="relative py-1 flex items-center justify-center"
            >
              <button 
                onClick={() => scrollTo(item)}
                className="font-sans font-semibold text-[12px] tracking-[2px] uppercase text-gs-muted hover:text-gs-green transition-colors cursor-pointer px-[10px] py-[3px] flex items-center justify-center min-w-[90px]"
              >
                {isHovered && (
                  <motion.span 
                    layoutId="nav-bracket-l"
                    className="text-gs-green mr-[3px] font-mono select-none"
                    initial={{ opacity: 0, x: -3 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    [
                  </motion.span>
                )}
                <span>{label}</span>
                {isHovered && (
                  <motion.span 
                    layoutId="nav-bracket-r"
                    className="text-gs-green ml-[3px] font-mono select-none"
                    initial={{ opacity: 0, x: 3 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    ]
                  </motion.span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
      
      <button 
        onClick={() => scrollTo('newsletter')}
        className="font-mono text-[11px] text-gs-dark bg-gs-green border-none px-[18px] py-[7px] cursor-pointer tracking-[1px] nav-btn-clip transition-all hover:bg-gs-accent hover:scale-[1.03] font-bold uppercase"
      >
        Join the Collective
      </button>

      {/* Network progress bar sync */}
      <motion.div 
        className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-gs-green via-gs-accent to-gs-green origin-left"
        style={{ scaleX }}
      />
    </nav>
  );
};
