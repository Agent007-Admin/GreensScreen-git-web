import React, { useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export const GridBackground: React.FC = () => {
  // Capture coordinates (-0.5 to 0.5 scale for smooth offset calculations)
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs to avoid jittery translation transitions
  const springConfig = { damping: 45, stiffness: 90, mass: 0.8 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) - 0.5;
      const y = (e.clientY / window.innerHeight) - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // Maps coordinates to smooth pixels for responsive shifting
  const parallaxX = useTransform(smoothX, [-0.5, 0.5], [-25, 25]);
  const parallaxY = useTransform(smoothY, [-0.5, 0.5], [-25, 25]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#050a07]">
      {/* 1. Deep Backlight followglow */}
      <motion.div 
        className="absolute w-[600px] h-[600px] rounded-full blur-[140px] opacity-[0.08] bg-gs-green pointer-events-none select-none"
        style={{
          x: useSpring(useTransform(mouseX, [-0.5, 0.5], ["0%", "80%"]), springConfig),
          y: useSpring(useTransform(mouseY, [-0.5, 0.5], ["0%", "80%"]), springConfig),
          left: "calc(50% - 300px)",
          top: "calc(50% - 300px)",
        }}
      />

      {/* 2. Floating Ambient Cosmic Orbs (Dynamic Bezier Paths) */}
      {/* Cosmic Orb Alpha (Emerald Dream) */}
      <motion.div 
        animate={{
          x: ["-20vw", "45vw", "15vw", "75vw", "-20vw"],
          y: ["-10vh", "35vh", "-15vh", "25vh", "-10vh"],
          scale: [1, 1.15, 0.9, 1.1, 1],
        }}
        transition={{
          duration: 38,
          ease: "easeInOut",
          repeat: Infinity,
        }}
        className="absolute w-[450px] h-[450px] rounded-full bg-[#00ff88] opacity-[0.05] blur-[150px]"
      />

      {/* Cosmic Orb Beta (Prismatic Lime Accent) */}
      <motion.div 
        animate={{
          x: ["110vw", "40vw", "85vw", "20vw", "110vw"],
          y: ["80vh", "20vh", "100vh", "45vh", "80vh"],
          scale: [1.1, 0.85, 1.15, 0.95, 1.1],
        }}
        transition={{
          duration: 48,
          ease: "easeInOut",
          repeat: Infinity,
        }}
        className="absolute w-[500px] h-[500px] rounded-full bg-[#aaff44] opacity-[0.035] blur-[160px]"
      />

      {/* Cosmic Orb Gamma (Cyan/Deeper Green Dimmer) */}
      <motion.div 
        animate={{
          x: ["-30vw", "60vw", "-10vw", "30vw", "-30vw"],
          y: ["75vh", "-10vh", "30vh", "90vh", "75vh"],
          scale: [0.9, 1.1, 0.95, 1.05, 0.9],
        }}
        transition={{
          duration: 54,
          ease: "easeInOut",
          repeat: Infinity,
        }}
        className="absolute w-[400px] h-[400px] rounded-full bg-[#00cc6a] opacity-[0.04] blur-[140px]"
      />

      {/* 3. Micro Auto Drifting Grid Pattern (Enhanced visibility) */}
      <div 
        className="absolute inset-0 opacity-[0.09]"
        style={{
          backgroundImage: `linear-gradient(rgba(0,255,136,0.3) 1px, transparent 1px), 
                            linear-gradient(90deg, rgba(0,255,136,0.3) 1px, transparent 1px)`,
          backgroundSize: '36px 36px',
          animation: 'gridDriftSlow 32s linear infinite'
        }}
      />

      {/* 4. Parallax Responsive Mesh (Enhanced visibility) */}
      <motion.div 
        className="absolute -inset-[40px] opacity-[0.14]"
        style={{
          backgroundImage: `linear-gradient(rgba(0,255,136,0.35) 1px, transparent 1px), 
                            linear-gradient(90deg, rgba(0,255,136,0.35) 1px, transparent 1px)`,
          backgroundSize: '144px 144px',
          x: parallaxX,
          y: parallaxY,
        }}
      />

      {/* 5. Peripheral Vignette (CRT terminal dark lens look) */}
      <div 
        className="absolute inset-0" 
        style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 25%, #050a07 85%)',
        }}
      />
    </div>
  );
};
