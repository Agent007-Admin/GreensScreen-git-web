import React, { useEffect, useState, useRef } from 'react';

interface GlitchTitleProps {
  text: string;
  className?: string;
  speed?: number; // millisecond step speed
}

export const GlitchTitle: React.FC<GlitchTitleProps> = ({ 
  text, 
  className = "font-display text-[44px] tracking-[4px] text-gs-text", 
  speed = 35 
}) => {
  const [displayText, setDisplayText] = useState(text);
  const chars = '█░▒▓█◣◥▲▼✔✖✚✪✿☣☢☠';
  const elementRef = useRef<HTMLHeadingElement>(null);
  const hasTriggered = useRef(false);

  const triggerDecrypt = () => {
    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(() => {
        return text
          .split('')
          .map((char, index) => {
            if (char === ' ') return ' ';
            if (index < iteration) {
              return text[index];
            }
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('');
      });

      if (iteration >= text.length) {
        clearInterval(interval);
      }
      iteration += 1 / 3;
    }, speed);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting && !hasTriggered.current) {
          hasTriggered.current = true;
          triggerDecrypt();
        } else if (!entry.isIntersecting) {
          // Reset so it triggers again if scrolled out and back
          hasTriggered.current = false;
        }
      },
      { threshold: 0.2 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current);
      }
    };
  }, [text, speed]);

  return (
    <h2 
      ref={elementRef}
      onMouseEnter={triggerDecrypt}
      className={`${className} cursor-default select-none`}
    >
      {displayText}
    </h2>
  );
};
