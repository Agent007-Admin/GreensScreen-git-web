import React from 'react';
import { motion } from 'framer-motion';

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
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`bg-[rgba(15,30,22,0.8)] border border-[rgba(255,255,255,0.06)] p-[28px] transition-all group ${cardId}`}
      style={{ 
        borderTop: `3px solid ${color}`,
      }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        .${cardId}:hover {
          box-shadow: 0 0 24px ${color}14;
        }
      `}} />
      
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
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="font-display text-[56px] tracking-[4px] text-gs-text mb-4"
        >
          KNOW YOUR SIGNAL
        </motion.h2>
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
