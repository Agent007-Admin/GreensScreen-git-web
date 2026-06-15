import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlitchTitle } from './GlitchTitle';
import { X, ArrowRight, Check, Send, Sparkles, Terminal } from 'lucide-react';

interface CollaborationRequest {
  name: string;
  email: string;
  category: 'technology' | 'gaming' | 'entertainment';
  message: string;
}

const TypewriterTitle: React.FC<{ text: string }> = ({ text }) => {
  const [displayedText, setDisplayedText] = useState('');
  useEffect(() => {
    let index = 0;
    setDisplayedText('');
    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(index));
      index++;
      if (index >= text.length) {
        clearInterval(interval);
      }
    }, 45);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <span className="font-mono text-xs text-gs-green tracking-[3px] uppercase">
      {displayedText}
      <span className="animate-pulse bg-gs-green w-1.5 h-3.5 inline-block ml-0.5 align-middle" />
    </span>
  );
};

const PillarTicker: React.FC<{ 
  label: string; 
  items: string[]; 
  speed?: number; 
}> = ({ label, items, speed = 30 }) => {
  return (
    <div className="w-full max-w-[800px] mt-4 select-none font-mono relative group/ticker">
      {/* Glossy illuminated projector strip fluid */}
      <div className="relative py-3 px-6 overflow-hidden rounded-xl bg-gradient-to-r from-gs-dark/20 via-gs-green/[0.03] to-gs-dark/20 border border-gs-green/10 hover:border-gs-green/25 backdrop-blur-[2px] transition-all duration-500 shadow-[inset_0_1px_15px_rgba(0,255,136,0.02),0_0_15px_rgba(0,0,0,0.5)]">
        
        {/* Glowing green source signal dot perfectly positioned where items emerge as they fade into the light */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 z-20 flex items-center pointer-events-none">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gs-green opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-gs-green shadow-[0_0_8px_#00ff88]"></span>
          </span>
        </div>

        {/* Holographic Beam Flares / Illumination Lines */}
        <div className="absolute top-0 inset-x-12 h-[1px] bg-gradient-to-r from-transparent via-gs-green/35 to-transparent blur-[0.5px]" />
        <div className="absolute bottom-0 inset-x-12 h-[1px] bg-gradient-to-r from-transparent via-gs-green/15 to-transparent blur-[0.5px]" />
        
        {/* Ambient background projector beam center glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-10 bg-gs-green/5 rounded-full blur-xl pointer-events-none" />

        {/* Soft edge shadow mask gradients */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#030704] via-[#030704]/40 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#030704] via-[#030704]/40 to-transparent z-10 pointer-events-none" />
        
        <div className="flex whitespace-nowrap overflow-hidden pl-8">
          <motion.div 
            className="flex whitespace-nowrap gap-12 pr-12 text-[10px] font-semibold tracking-[1px] uppercase items-center"
            animate={{ x: ["0%", "-50%"] }}
            transition={{
              ease: "linear",
              duration: speed,
              repeat: Infinity
            }}
          >
            {[...items, ...items].map((item, idx) => (
              <span key={idx} className="flex items-center gap-3 text-gs-muted/80 hover:text-gs-green transition-colors duration-150 py-0.5 relative group/item">
                <span className="text-gs-green/45 group-hover/item:text-gs-green group-hover/item:scale-125 transition-transform duration-200">✦</span>
                <span className="relative">
                  {item}
                  <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-gs-green/30 group-hover/item:w-full transition-all duration-300" />
                </span>
              </span>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15
    }
  }
};

const rowVariants = {
  hidden: { 
    opacity: 0, 
    y: 35,
    filter: 'blur(8px)'
  },
  visible: { 
    opacity: 1, 
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 1.0,
      ease: [0.16, 1, 0.3, 1] as const
    }
  }
};

export const Pillars: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<'technology' | 'gaming' | 'entertainment' | null>(null);
  const [formData, setFormData] = useState<CollaborationRequest>({
    name: '',
    email: '',
    category: 'technology',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedCategory) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedCategory]);

  const handCategoryClick = (category: 'technology' | 'gaming' | 'entertainment') => {
    setFormData(prev => ({
      ...prev,
      category
    }));
    setSelectedCategory(category);
    setSubmitStatus('idle');
    setErrorMessage('');
  };

  const handleFormCategoryChange = (category: 'technology' | 'gaming' | 'entertainment') => {
    setFormData(prev => ({
      ...prev,
      category
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setErrorMessage('Please fill in all required fields.');
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/collaborate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        // Reset message but keep name & email for convenience if they submit another
        setFormData(prev => ({
          ...prev,
          message: ''
        }));
      } else {
        setErrorMessage(data.error || 'Failed to submit collaboration inquiry.');
        setSubmitStatus('error');
      }
    } catch (e) {
      console.error('Error submitting collaboration:', e);
      setErrorMessage('A network error occurred. Please try again.');
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Coords for hover effect tracking
  const [techHoverCoords, setTechHoverCoords] = useState({ x: 0, y: 0 });
  const [gamingHoverCoords, setGamingHoverCoords] = useState({ x: 0, y: 0 });
  const [entHoverCoords, setEntHoverCoords] = useState({ x: 0, y: 0 });
  const [commHoverCoords, setCommHoverCoords] = useState({ x: 0, y: 0 });

  const handleMouseMove = (
    e: React.MouseEvent<HTMLDivElement>,
    setCoords: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setCoords({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <section id="collaboration" className={`relative px-6 md:px-10 pt-[72px] max-w-[1100px] mx-auto selection:bg-gs-green selection:text-gs-dark transition-all duration-300 ${selectedCategory ? 'z-[1000]' : 'z-10'}`}>
      {/* SECTION HEADER */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className="font-mono text-[11px] tracking-[4px] text-gs-green mb-2 flex items-center gap-3"
      >
        GET INVOLVED
        <span className="flex-1 max-w-[50px] h-[1px] bg-gs-green/40" />
      </motion.div>
      <GlitchTitle 
        text="COLLABORATION" 
        className="font-display text-[clamp(32px,4.5vw,56px)] tracking-[3px] text-gs-text mb-3" 
      />
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-base text-gs-muted max-w-[620px] leading-[1.6] font-medium"
      >
        We offer structured collaboration loops across our technology, gaming, and entertainment networks. Discover opportunities, submit details directly to our datastream, and build alongside Greens Screens.
      </motion.p>

      {/* STACKED FULL-WIDTH ROWS */}
      <motion.div 
        className="mt-10 flex flex-col"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
      >
        
        {/* ROW 1: TECHNOLOGY REVIEWS */}
        <motion.div
          variants={rowVariants}
          onMouseMove={(e) => handleMouseMove(e, setTechHoverCoords)}
          className="bg-transparent border-b border-gs-border/30 hover:border-b-gs-green/45 py-8 md:py-10 md:px-0 relative overflow-hidden transition-all duration-300 group rounded-none"
        >
          {/* Dynamic Spotlight */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: `radial-gradient(400px circle at ${techHoverCoords.x}px ${techHoverCoords.y}px, rgba(0, 255, 136, 0.08), transparent 80%)`
            }}
          />
          <div className="absolute top-0 left-0 h-[2px] bg-gs-green w-0 group-hover:w-full transition-all duration-500" />
          
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
            <div className="flex-1">
              <span className="font-mono text-[10px] text-gs-green uppercase tracking-[3px] block mb-2">01 / BRANDED TESTING</span>
              <h3 className="font-display text-2xl md:text-3xl text-gs-text tracking-[1.5px] uppercase mb-3">Tech Reviews</h3>
              <p className="text-sm text-gs-muted leading-[1.6] max-w-[800px]">
                We produce premium, high-impact content reviewing software, hardware, and creative gear. Since your physical and digital setup is the nervous system of creation, we test every element to ensure peak performance for tomorrow's builders.
              </p>
              <PillarTicker 
                label="INGEST_VECTORS // CH_01" 
                items={[
                  'Keyboards & Keycaps', 'Cameras & Camcorders', 'Mics & Audio Gear', 
                  'Video Lights & Diffusers', 'Screens & Monitor Arrays', 
                  'VR / AR / Smart Glasses', 'Mobile Tech & Watches', 'Creator Apps & Utilities'
                ]} 
                speed={34}
              />
            </div>
            
            <div className="flex-shrink-0 self-start md:self-center">
              <motion.button
                onClick={() => handCategoryClick('technology')}
                whileHover={{ 
                  scale: 1.08,
                  backgroundColor: "#00ff88",
                  color: "#030704",
                  borderColor: "#00ff88",
                  boxShadow: "0 0 25px rgba(0, 255, 136, 0.75)",
                  y: -2
                }}
                whileTap={{ scale: 0.95 }}
                className="w-full md:w-auto bg-gs-dark border-2 border-gs-green text-gs-green font-mono text-xs tracking-[2px] px-8 py-3.5 transition-all duration-200 uppercase cursor-pointer btn-clip flex items-center justify-center gap-2 relative overflow-hidden group/btn font-bold"
              >
                Team Up? <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform duration-200" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* ROW 2: GAMING COLLABORATIONS */}
        <motion.div
          variants={rowVariants}
          onMouseMove={(e) => handleMouseMove(e, setGamingHoverCoords)}
          className="bg-transparent border-b border-gs-border/30 hover:border-b-gs-green/45 py-8 md:py-10 md:px-0 relative overflow-hidden transition-all duration-300 group rounded-none"
        >
          {/* Dynamic Spotlight */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: `radial-gradient(400px circle at ${gamingHoverCoords.x}px ${gamingHoverCoords.y}px, rgba(0, 255, 136, 0.08), transparent 80%)`
            }}
          />
          <div className="absolute top-0 left-0 h-[2px] bg-gs-green w-0 group-hover:w-full transition-all duration-500" />

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
            <div className="flex-1">
              <span className="font-mono text-[10px] text-gs-green uppercase tracking-[3px] block mb-2">02 / EXPERIMENTAL PLAY</span>
              <h3 className="font-display text-2xl md:text-3xl text-gs-text tracking-[1.5px] uppercase mb-3">Gaming Reviews & Playtests</h3>
              <p className="text-sm text-gs-muted leading-[1.6] max-w-[800px]">
                We run deep community playtests, developer showcases, and honest analytical reviews. Since 1996, our passion fuels first-looks and early alpha gameplay. Whether you seek direct exposure or private mechanics feedback, we deliver actionable evaluations.
              </p>
              <PillarTicker 
                label="GAMEPORT_FEED // CH_02" 
                items={[
                  'Alpha & Beta Playtesting', 'Indie First Looks', 'UI / UX Design Feedback', 
                  'Competitive Showcases', 'Dev Commentary Reels', 'Mechanics Dissection'
                ]} 
                speed={30}
              />
            </div>

            <div className="flex-shrink-0 self-start md:self-center">
              <motion.button
                onClick={() => handCategoryClick('gaming')}
                whileHover={{ 
                  scale: 1.08,
                  backgroundColor: "#00ff88",
                  color: "#030704",
                  borderColor: "#00ff88",
                  boxShadow: "0 0 25px rgba(0, 255, 136, 0.75)",
                  y: -2
                }}
                whileTap={{ scale: 0.95 }}
                className="w-full md:w-auto bg-gs-dark border-2 border-gs-green text-gs-green font-mono text-xs tracking-[2px] px-8 py-3.5 transition-all duration-200 uppercase cursor-pointer btn-clip flex items-center justify-center gap-2 relative overflow-hidden group/btn font-bold"
              >
                Team Up? <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform duration-200" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* ROW 3: ENTERTAINMENT INTAKE */}
        <motion.div
          variants={rowVariants}
          onMouseMove={(e) => handleMouseMove(e, setEntHoverCoords)}
          className="bg-transparent border-b border-gs-border/30 hover:border-b-gs-green/45 py-8 md:py-10 md:px-0 relative overflow-hidden transition-all duration-300 group rounded-none"
        >
          {/* Dynamic Spotlight */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: `radial-gradient(400px circle at ${entHoverCoords.x}px ${entHoverCoords.y}px, rgba(0, 255, 136, 0.08), transparent 80%)`
            }}
          />
          <div className="absolute top-0 left-0 h-[2px] bg-gs-green w-0 group-hover:w-full transition-all duration-500" />

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
            <div className="flex-1">
              <span className="font-mono text-[10px] text-gs-green uppercase tracking-[3px] block mb-2">03 / CREATIVE FREQUENCY</span>
              <h3 className="font-display text-2xl md:text-3xl text-gs-text tracking-[1.5px] uppercase mb-3">Entertainment & Media</h3>
              <p className="text-sm text-gs-muted leading-[1.6] max-w-[800px]">
                Our creative ecosystem connects custom ideas with interactive development. We collaborate daily with designers, brands, and content creators to build memorable audio-visual campaigns, compelling web styles, and interactive digital experiences.
              </p>
              <PillarTicker 
                label="CREATIVE_BUS // CH_03" 
                items={[
                  'Comedy Skits & Shorts', 'Voice Acting & Voiceovers', 'Multi-Creator Showcases', 
                  'Co-Branded Campaigns', 'Interactive Design Work', 'Compelling Web & UI Design'
                ]} 
                speed={28}
              />
            </div>

            <div className="flex-shrink-0 self-start md:self-center">
              <motion.button
                onClick={() => handCategoryClick('entertainment')}
                whileHover={{ 
                  scale: 1.08,
                  backgroundColor: "#00ff88",
                  color: "#030704",
                  borderColor: "#00ff88",
                  boxShadow: "0 0 25px rgba(0, 255, 136, 0.75)",
                  y: -2
                }}
                whileTap={{ scale: 0.95 }}
                className="w-full md:w-auto bg-gs-dark border-2 border-gs-green text-gs-green font-mono text-xs tracking-[2px] px-8 py-3.5 transition-all duration-200 uppercase cursor-pointer btn-clip flex items-center justify-center gap-2 relative overflow-hidden group/btn font-bold"
              >
                Team Up? <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform duration-200" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* ROW 4: COMMUNITY & EVENTS */}
        <motion.div
          variants={rowVariants}
          onMouseMove={(e) => handleMouseMove(e, setCommHoverCoords)}
          className="bg-transparent border-b border-gs-border/30 hover:border-b-gs-green/20 py-8 md:py-10 md:px-0 relative overflow-hidden transition-all duration-300 group rounded-none"
        >
          {/* Subtle slow scanline spotlight overlay */}
          <div 
            className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: `radial-gradient(350px circle at ${commHoverCoords.x}px ${commHoverCoords.y}px, rgba(0, 255, 136, 0.04), transparent 80%)`
            }}
          />
          <div className="absolute top-0 left-0 h-[2px] bg-gs-muted w-0 group-hover:w-full transition-all duration-500 opacity-30" />

          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
            <div className="flex-1">
              <span className="font-mono text-[10px] text-gs-muted uppercase tracking-[3px] block mb-2">04 / THE CONNECTOR SIGNAL</span>
              <h3 className="font-display text-2xl md:text-3xl text-gs-text tracking-[1.5px] uppercase mb-3">Community Hub</h3>
              <p className="text-sm text-gs-muted leading-[1.6] max-w-[800px]">
                The focal point where all signals merge. We orchestrate tournaments, custom co-op lobbies, and active multiplayer challenges designed purely to connect creators. Join our channels to secure your transmission.
              </p>
              <PillarTicker 
                label="COMMUNITY_NODE // CH_04" 
                items={['Global Tournaments', 'Custom Co-Op Lobbies', 'Active Matchmaking', 'Creator Showdowns', 'Interactive AMAs', 'Community Game Nights']} 
                speed={26}
              />
            </div>

            <div className="flex-shrink-0 self-start md:self-center flex flex-col items-center gap-1 px-4 text-center">
              <span className="font-mono text-[9px] text-gs-muted uppercase tracking-[2px] mb-1">Stay Connected Below</span>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="text-gs-green cursor-pointer"
                onClick={() => {
                  const target = document.getElementById('connect');
                  if (target) target.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </motion.div>
            </div>
          </div>
        </motion.div>

      </motion.div>

      {/* MODAL SYSTEM (AnimatePresence) */}
      <AnimatePresence>
        {selectedCategory && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCategory(null)}
              className="absolute inset-0 bg-gs-dark/90 backdrop-blur-md"
            />
            
            {/* Portal Card */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="bg-[#070e0a] border border-gs-green/30 w-full max-w-xl p-6 md:p-8 relative z-10 shadow-[0_0_50px_rgba(0,255,136,0.1)] rounded-none overflow-hidden"
            >
              {/* Top border light */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gs-green to-transparent" />
              
              {/* Scanline subtle overlay */}
              <div 
                className="absolute inset-0 pointer-events-none opacity-2 flex flex-col justify-between"
                style={{
                  background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 136, 0.015) 2px, rgba(0, 255, 136, 0.015) 4px)'
                }}
              />

              {/* Header */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-gs-border/60 relative z-10 w-full">
                <div className="flex items-center gap-2">
                  <Terminal size={16} className="text-gs-green" />
                  <TypewriterTitle text="GSE // Ally Submission" />
                </div>
                <button 
                  onClick={() => setSelectedCategory(null)}
                  className="text-gs-muted hover:text-gs-text transition-colors cursor-pointer p-1 hover:bg-gs-border/20 rounded"
                >
                  <X size={18} />
                </button>
              </div>

              {/* State 1: Active Form */}
              {submitStatus !== 'success' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                >
                  <form onSubmit={handleFormSubmit} className="space-y-4 relative z-10">
                    <h3 className="font-display text-2xl tracking-[2px] text-gs-text mb-2 uppercase">
                      Partner / Collaborate
                    </h3>
                    <p className="text-xs text-gs-muted leading-relaxed">
                      Insert as much detail as you can to describe your interest to collaborate. We will review and respond with our ability to connect.
                    </p>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-gs-green tracking-[1.5px] uppercase">Your Name / Organization *</label>
                      <input 
                        type="text" 
                        name="name" 
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="e.g. David Stark / Stark Digital"
                        className="w-full bg-gs-dark/80 border border-gs-border px-3 py-2 text-sm text-gs-text focus:outline-none focus:border-gs-green focus:ring-1 focus:ring-gs-green/20"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-gs-green tracking-[1.5px] uppercase">Contact Email *</label>
                      <input 
                        type="email" 
                        name="email" 
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="e.g. name@domain.com"
                        className="w-full bg-gs-dark/80 border border-gs-border px-3 py-2 text-sm text-gs-text focus:outline-none focus:border-gs-green focus:ring-1 focus:ring-gs-green/20"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-gs-green tracking-[1.5px] uppercase">Target Category</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['technology', 'gaming', 'entertainment'] as const).map(cat => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => handleFormCategoryChange(cat)}
                            className={`py-2 text-[10px] font-mono uppercase tracking-[1px] border transition-colors cursor-pointer ${
                              formData.category === cat 
                                ? 'border-gs-green text-gs-green bg-gs-green/10' 
                                : 'border-gs-border text-gs-muted hover:text-gs-text hover:border-gs-border-bright'
                            }`}
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-[10px] font-mono text-gs-green tracking-[1.5px] uppercase">
                        Collaboration Details *
                      </label>
                      <textarea 
                        name="message" 
                        required
                        rows={4}
                        value={formData.message}
                        onChange={handleInputChange}
                        placeholder={
                          formData.category === 'technology' 
                            ? "Specify the keyboards, cameras, microphones, smart tech, or software you'd like reviewed or featured in our studio pipeline..."
                            : formData.category === 'gaming'
                            ? "Detail your game's mechanics, release timeline, alpha access links, or coordinate developer commentary and playtests with us..."
                            : "Pitch custom web work, comedic setups, co-branded dynamic styles, or other unique artistic styles..."
                        }
                        className="w-full bg-gs-dark/80 border border-gs-border p-3 text-sm text-gs-text focus:outline-none focus:border-gs-green focus:ring-1 focus:ring-gs-green/20 resize-none font-sans"
                      />
                    </div>

                    {errorMessage && (
                      <div className="text-xs font-mono text-red-500 bg-red-950/20 border border-red-500/30 p-2">
                        ERROR: {errorMessage}
                      </div>
                    )}

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-3 bg-gs-green text-gs-dark font-mono text-xs tracking-[2px] font-semibold uppercase hover:bg-gs-green-dim disabled:opacity-50 transition-colors cursor-pointer btn-clip flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>SUBMITTING STREAM DATA...</>
                        ) : (
                          <>
                            <Send size={12} /> TRANSMIT INQUIRY
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* State 2: Success Submission Feedback */}
              {submitStatus === 'success' && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: "spring", duration: 0.5 }}
                  className="text-center py-6 space-y-4 relative z-10 font-mono"
                >
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.2, 1] }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="w-16 h-16 rounded-full border-2 border-gs-green bg-gs-green/10 flex items-center justify-center mx-auto text-gs-green shadow-[0_0_20px_rgba(0,255,136,0.3)] animate-pulse"
                  >
                    <Check size={32} strokeWidth={3} />
                  </motion.div>

                  <h3 className="font-display text-2xl tracking-[2px] text-gs-text uppercase">
                    Transmission Received
                  </h3>

                  <div className="bg-[#051c0d] border border-gs-green/30 p-5 max-w-sm mx-auto text-xs font-mono text-gs-muted/90 rounded leading-relaxed text-left relative overflow-hidden shadow-[0_0_30px_rgba(0,255,136,0.05)]">
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-gs-green/50 to-transparent" />
                    
                    {/* Animated side pulse light */}
                    <div className="absolute inset-0 bg-[radial-gradient(100px_at_50%_0%,rgba(0,255,136,0.1),transparent)] pointer-events-none" />

                    <div className="flex items-center gap-1.5 text-gs-green mb-3 text-[11px] font-bold tracking-wider">
                      <Terminal size={12} className="animate-pulse" /> TELEMETRY LOG: INGEST_OK
                    </div>
                    
                    <div className="space-y-1.5 text-[11px]">
                      <div>• SECURE STREAM: <span className="text-gs-green font-bold">ONLINE</span></div>
                      <div>• DATASTORE INGESTION: <span className="text-gs-green font-bold">COMMITTED // OK</span></div>
                      <div>• EXPORT SIGNAL: <span className="text-gs-text font-bold">DISPATCHED</span></div>
                      <div>• ALERT ROUTE: <span className="text-gs-green">agent007@gse_network</span></div>
                      <div>• FEEDBACK CODE: <span className="text-gs-green font-bold uppercase">ALLY_TRANS_202</span></div>
                    </div>
                  </div>

                  <p className="text-xs text-gs-muted max-w-sm mx-auto font-sans leading-relaxed">
                    Thank you. We will verify your credentials and collaborate options, then contact you via the provided email.
                  </p>
                  
                  <div className="pt-2">
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="px-6 py-2 border border-gs-border hover:border-gs-green/45 text-gs-muted hover:text-gs-text font-mono text-xs tracking-[2px] uppercase transition-colors cursor-pointer btn-clip"
                    >
                      Dismiss Portal
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
};
