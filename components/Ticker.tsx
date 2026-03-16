import React from 'react';

export const Ticker: React.FC = () => {
  const items = [
    'GAMING', 'ENTERTAINMENT', 'TECHNOLOGY', 'CREATIVE MEDIA', 
    'DIGITAL CULTURE', 'CONTENT', 'COMMUNITY', 'INNOVATION'
  ];

  return (
    <div className="border-y border-gs-border bg-gs-surface py-2 overflow-hidden relative z-10">
      <div className="flex animate-ticker whitespace-nowrap">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex">
            {items.map((item, idx) => (
              <span key={idx} className="font-mono text-[11px] tracking-[2px] text-gs-green px-9 opacity-70 flex items-center">
                {item}
                <span className="text-gs-muted px-[6px]">◆</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};
