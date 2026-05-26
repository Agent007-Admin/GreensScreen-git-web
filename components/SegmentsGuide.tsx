import React from 'react';
import { motion } from 'framer-motion';
import { GlitchTitle } from './GlitchTitle';

interface SegmentCardProps {
  number: string;
  name: string;
  tagline: string;
  color: string;
  glow: string;
  blurb: string;
  bullets: string[];
}

const SegmentCard: React.FC<SegmentCardProps> = ({ number, name, tagline, color, glow, blurb, bullets }) => {
  const cardId = `segment-card-${name.replace(/\s+/g, '-').toLowerCase()}`;
  const [coords, setCoords] = React.useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = React.useState(false);

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
        duration: 1.0,
        ease: [0.16, 1, 0.3, 1] as const
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
    <motion.div 
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`bg-[rgba(10,20,15,0.85)] border border-[rgba(0,255,136,0.08)] p-[28px] relative overflow-hidden transition-all group ${cardId}`}
      style={{ 
        borderTop: `3px solid ${color}`,
      }}
    >
      {/* Holographic Colored Laser Scanline */}
      <motion.div 
        variants={lineVariants}
        className="absolute left-0 right-0 h-[2px] z-30 pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          boxShadow: `0 0 10px ${color}`
        }}
      />

      {/* Signature Color Cursor Spotlight */}
      {isHovered && (
        <div 
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            background: `radial-gradient(350px circle at ${coords.x}px ${coords.y}px, ${color}15, transparent 80%)`,
          }}
        />
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        .${cardId}:hover {
          box-shadow: 0 0 24px ${color}14;
          border-color: ${color}33;
        }
      `}} />
      
      <motion.div variants={contentVariants} className="relative z-10">
        <div className="font-mono text-[11px] text-gs-muted tracking-[2px] mb-2 uppercase opacity-60">
          {number}
        </div>
        <h3 
          className="font-display text-[42px] tracking-[2px] leading-none mb-3"
          style={{ color, textShadow: glow }}
        >
          {name}
        </h3>
        <div className="font-rajdhani text-[16px] text-gs-muted italic mb-4">
          {tagline}
        </div>
        
        <div className="h-[1px] w-full mb-6" style={{ background: `rgba(${parseInt(color.slice(1,3), 16)}, ${parseInt(color.slice(3,5), 16)}, ${parseInt(color.slice(5,7), 16)}, 0.2)` }} />
        
        <p className="text-[15px] text-gs-text/80 leading-[1.6] font-medium mb-6">
          {blurb}
        </p>
        
        <div className="font-mono text-[11px] text-gs-muted tracking-[3px] uppercase mb-4 opacity-50">
          // what you get
        </div>
        
        <ul className="space-y-3">
          {bullets.map((bullet, idx) => {
            const [label, ...rest] = bullet.split(' — ');
            return (
              <li key={idx} className="flex items-start gap-2.5 text-[14px] text-gs-muted leading-[1.5]">
                <span className="mt-1" style={{ color }}>▸</span>
                <span>
                  <span className="font-bold text-gs-text">{label}</span>
                  {rest.length > 0 && ` — ${rest.join(' — ')}`}
                </span>
              </li>
            );
          })}
        </ul>
      </motion.div>
    </motion.div>
  );
};

export const SegmentsGuide: React.FC = () => {
  return (
    <section id="segments" className="relative z-10 py-20 px-10 border-t border-b border-[rgba(0,255,136,0.12)]">
      <div className="max-w-[1100px] mx-auto text-center mb-16">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-mono text-[11px] tracking-[6px] text-[#6b9a7a] mb-3 uppercase"
        >
          // GSE Content
        </motion.div>
        <GlitchTitle
          text="KNOW YOUR SIGNAL"
          className="font-display text-[56px] tracking-[4px] text-gs-text mb-4"
        />
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="font-rajdhani text-[16px] text-gs-muted max-w-[600px] mx-auto"
        >
          Every segment we publish has a purpose. Here's what each one delivers for you.
        </motion.p>
      </div>

      <div className="max-w-[1100px] mx-auto flex flex-col gap-10">
        <SegmentCard 
          number="SEG_01"
          name="ON THE RADAR"
          color="#FF2020"
          glow="0 0 30px rgba(255,32,32,0.25)"
          tagline="Games & news that deserve your attention — right now"
          blurb="Your early warning system for everything worth knowing in gaming. We surface games that are trending, newly announced, or releasing soon before most people have heard of them."
          bullets={[
            "Early discovery — know about games worth playing before they peak and the internet catches up",
            "Trending titles — what's gaining real momentum in the community, not just what has the biggest ad budget",
            "Release awareness — never get caught off guard by a launch date on something you've been waiting for",
            "Hidden gems — smaller titles that deserve a spotlight, because great games don't always come with loud marketing"
          ]}
        />

        <SegmentCard 
          number="SEG_02"
          name="LOADING..."
          color="#00D4FF"
          glow="0 0 30px rgba(0,212,255,0.25)"
          tagline="What's in the console — what we're actually playing today"
          blurb="No hype. No previews. Just the honest answer to the question every gamer asks — what are you playing right now? Active campaigns, core titles in rotation, stories we're deep into."
          bullets={[
            "Genuine recommendations — if it's featured here we're actually playing it, no sponsorship, just real sessions",
            "Community connection — find common ground with others in the GSE community locked into the same titles",
            "Play inspiration — when you don't know what to load next, this is the most honest place to find your answer",
            "Real player perspective — not a review, not a preview — how a game actually feels when you're living inside it daily"
          ]}
        />

        <SegmentCard 
          number="SEG_03"
          name="CHECKPOINT"
          color="#FFE033"
          glow="0 0 30px rgba(255,224,51,0.25)"
          tagline="A signal from The Frequency — stories that go beyond the feed"
          blurb="Some stories deserve more than a caption. Checkpoint takes one standout story from The Frequency, our newsletter, and brings it directly to your feed — depth over speed."
          bullets={[
            "Depth over speed — a story given the space it needs, not squeezed into a caption or a 15-second clip",
            "The Frequency, unlocked — real newsletter content delivered to your feed, no subscription required",
            "Context and perspective — gaming stories and industry moments with real analysis, not just a headline",
            "A reason to read — in a world built for scrolling, content that makes you stop and actually take something in"
          ]}
        />
      </div>
    </section>
  );
};
