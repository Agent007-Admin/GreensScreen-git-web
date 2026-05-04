import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="relative z-10 px-10 py-10 max-w-[1100px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6 border-t border-gs-border">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-gs-green animate-pulse" />
        <div className="font-display text-lg tracking-[2px] text-gs-green">
          GREENS <span className="text-gs-text">SCREENS </span><span className="text-gs-accent">ENT</span>
        </div>
      </div>
      <div className="font-mono text-[10px] text-gs-muted opacity-50 tracking-[1px] text-center md:text-left">
        © 2026 GREENS SCREENS ENT · ALL RIGHTS RESERVED<br />
        <span className="mt-1 block">BUILT DIFFERENT · THE UMBRELLA_</span>
      </div>
      <div className="font-mono text-[11px] flex items-center gap-4">
        <span className="text-gs-green tracking-[2px] opacity-40">SIGNAL_ALWAYS_GREEN</span>
      </div>
    </footer>
  );
};
