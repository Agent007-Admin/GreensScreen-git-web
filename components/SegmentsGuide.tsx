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

const getOrbsConfig = (numberString: string) => {
  if (numberString === 'SEG_01') {
    // Red: ON THE RADAR - larger, faster, alert-like blips
    return [
      { top: '10%', size: '20px', duration: 18, delay: 0, yOffset: [-35, 35], orbDur: 3 },
      { top: '35%', size: '8px', duration: 32, delay: -5, yOffset: [20, -20], orbDur: 6 },
      { top: '55%', size: '14px', duration: 22, delay: -12, yOffset: [-15, 15], orbDur: 4 },
      { top: '75%', size: '11px', duration: 26, delay: -8, yOffset: [25, -25], orbDur: 5 },
      { top: '90%', size: '7px', duration: 20, delay: -18, yOffset: [-10, 10], orbDur: 3.5 },
    ];
  }
  if (numberString === 'SEG_02') {
    // Blue: LOADING... - steady, flowing streams of data, moderate speed
    return [
      { top: '15%', size: '11px', duration: 33, delay: -2, yOffset: [15, -15], orbDur: 7 },
      { top: '40%', size: '16px', duration: 26, delay: -10, yOffset: [-20, 20], orbDur: 5.5 },
      { top: '65%', size: '9px', duration: 38, delay: -15, yOffset: [12, -12], orbDur: 8 },
      { top: '80%', size: '13px', duration: 29, delay: -5, yOffset: [-18, 18], orbDur: 6.5 },
    ];
  }
  // Gold: CHECKPOINT - slow, elegant, drifting frequency particles
  return [
    { top: '8%', size: '5px', duration: 62, delay: 0, yOffset: [8, -8], orbDur: 9 },
    { top: '25%', size: '12px', duration: 48, delay: -15, yOffset: [-12, 12], orbDur: 10 },
    { top: '45%', size: '7px', duration: 68, delay: -25, yOffset: [10, -10], orbDur: 8 },
    { top: '60%', size: '10px', duration: 54, delay: -8, yOffset: [-16, 16], orbDur: 11 },
    { top: '75%', size: '9px', duration: 58, delay: -30, yOffset: [14, -14], orbDur: 9.5 },
    { top: '90%', size: '4px', duration: 72, delay: -5, yOffset: [-6, 6], orbDur: 12 },
  ];
};

const PulsingDivider = () => (
  <div className="relative w-full h-[1px] overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gs-green/10 to-transparent" />
    <motion.div 
      animate={{ 
        opacity: [0.12, 0.4, 0.12],
        scaleY: [1, 1.4, 1]
      }}
      transition={{
        duration: 4.5,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="absolute inset-0 bg-gradient-to-r from-transparent via-gs-green/30 to-transparent blur-[0.5px]"
    />
  </div>
);

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
      opacity: 0,
      filter: 'blur(6px)'
    },
    visible: {
      opacity: 1,
      filter: 'blur(0px)',
      transition: {
        duration: 1.2,
        ease: [0.16, 1, 0.3, 1] as const
      }
    }
  };

  const contentVariants = {
    hidden: {
      opacity: 0,
      y: 15
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] as const,
        delay: 0.1
      }
    }
  };

  const lineVariants = {
    hidden: { top: '0%', opacity: 0 },
    visible: {
      top: ['0%', '100%'],
      opacity: [0, 1, 1, 0],
      transition: {
        duration: 1.5,
        ease: [0.16, 1, 0.3, 1] as const
      }
    }
  };
  
  return (
    <motion.div 
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-120px" }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`w-full relative py-16 md:py-20 overflow-hidden transition-all duration-300 group ${cardId}`}
    >
      {/* Holographic Colored Laser Scanline */}
      <motion.div 
        variants={lineVariants}
        className="absolute left-0 right-0 h-[2px] z-30 pointer-events-none"
        style={{
          background: `linear-gradient(90deg, transparent, ${color}, transparent)`,
          boxShadow: `0 0 12px ${color}`
        }}
      />

      {/* Immersive backdrop horizontal color-band reflection */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40 transition-opacity duration-500 group-hover:opacity-75"
        style={{
          background: `linear-gradient(90deg, transparent 5%, ${color}04 50%, transparent 95%)`
        }}
      />

      {/* Signature Color Cursor Spotlight / Ambient Depth Glow */}
      <div 
        className="pointer-events-none absolute inset-0 transition-opacity duration-700"
        style={{
          background: isHovered 
            ? `radial-gradient(600px circle at ${coords.x}px ${coords.y}px, ${color}10, transparent 80%)`
            : `radial-gradient(800px circle at 50% 50%, ${color}03, transparent 80%)`,
        }}
      />

      {/* CONTINUOUS RIGHT-TO-LEFT BACKGROUND COLOR ORBS DRIFTERS */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
        {getOrbsConfig(number).map((orb, index) => (
          <motion.div
            key={index}
            initial={{ left: "110%" }}
            animate={{
              left: ["110%", "-15%"],
            }}
            transition={{
              duration: orb.duration,
              repeat: Infinity,
              ease: "linear",
              delay: orb.delay,
            }}
            className="absolute"
            style={{ top: orb.top }}
          >
            <motion.div
              animate={{
                opacity: [0.25, 0.85, 0.25],
                scale: [0.85, 1.25, 0.85],
                y: orb.yOffset,
              }}
              transition={{
                duration: orb.orbDur,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="rounded-full"
              style={{
                width: orb.size,
                height: orb.size,
                backgroundColor: color,
                boxShadow: `0 0 16px ${color}, 0 0 32px ${color}60`,
              }}
            />
          </motion.div>
        ))}
      </div>
      
      <motion.div variants={contentVariants} className="relative z-10 max-w-[1100px] mx-auto px-6 md:px-10">
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
        
        <div className="h-[1px] w-full mb-6" style={{ background: `linear-gradient(90deg, ${color}33, transparent)` }} />
        
        <p className="text-[15px] text-gs-text/80 leading-[1.6] font-medium mb-6 max-w-[800px]">
          {blurb}
        </p>
        
        <div className="font-mono text-[11px] text-gs-muted tracking-[3px] uppercase mb-4 opacity-50">
          // what you get
        </div>
        
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-[900px]">
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
    <section id="segments" className="relative z-10 py-20 border-t border-b border-[rgba(0,255,136,0.12)] overflow-hidden">
      <div className="max-w-[1100px] mx-auto text-center mb-16 px-6 md:px-10">
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

      <div className="w-full flex flex-col">
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

        <PulsingDivider />

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

        <PulsingDivider />

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
