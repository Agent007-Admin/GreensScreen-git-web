import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="relative z-10 px-10 py-7 max-w-[1100px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3 border-t border-gs-border">
      <div className="font-display text-base tracking-[2px] text-gs-green neon-text">
        GREENS <span className="text-gs-text">SCREENS </span><span className="text-gs-accent">ENT</span>
      </div>
      <div className="font-mono text-[11px] text-gs-muted opacity-60 tracking-[1px]">
        © 2026 GREENS SCREENS ENT · ALL RIGHTS RESERVED
      </div>
      <div className="font-mono text-[11px] text-gs-green tracking-[1px] opacity-60">
        SIGNAL_ALWAYS_GREEN
      </div>
    </footer>
  );
};
