import React from 'react';

export const Navbar: React.FC = () => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-6 md:px-9 h-14 bg-gs-dark/90 backdrop-blur-xl border-b border-gs-border">
      <div className="font-display text-xl tracking-[2px] text-gs-green neon-text">
        GREENS<span className="text-gs-text"> SCREENS</span><span className="text-gs-accent"> ENT</span>
      </div>
      
      <ul className="hidden md:flex gap-7 list-none">
        {['about', 'connect', 'newsletter', 'founder'].map((item) => (
          <li key={item}>
            <button 
              onClick={() => scrollTo(item)}
              className="font-sans font-semibold text-[12px] tracking-[2px] uppercase text-gs-muted hover:text-gs-green transition-colors cursor-pointer"
            >
              {item === 'founder' ? 'Team' : item}
            </button>
          </li>
        ))}
      </ul>
      
      <button 
        onClick={() => scrollTo('newsletter')}
        className="font-mono text-[11px] text-gs-dark bg-gs-green border-none px-[18px] py-[7px] cursor-pointer tracking-[1px] nav-btn-clip transition-all hover:bg-gs-accent hover:scale-[1.03] font-bold"
      >
        JOIN THE LIST
      </button>
    </nav>
  );
};
