import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { Ticker } from './components/Ticker';
import { Pillars } from './components/Pillars';
import { SegmentsGuide } from './components/SegmentsGuide';
import { SocialGrid } from './components/SocialGrid';
import { Newsletter } from './components/Newsletter';
import { FounderCard } from './components/FounderCard';
import { Footer } from './components/Footer';
import { GridBackground } from './components/GridBackground';
import { BetaRadar } from './components/BetaRadar';

const App: React.FC = () => {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
    };
  }, []);

  const isBetaRadarRoute = currentPath === '/beta-radar';

  return (
    <div className="gs-page selection:bg-gs-green selection:text-gs-dark">
      <div className="scanlines" />
      <GridBackground />
      
      <Navbar />
      
      <main>
        {isBetaRadarRoute ? (
          <BetaRadar />
        ) : (
          <>
            <Hero />
            <Ticker />
            <Newsletter />
            <BetaRadar />
            <Pillars />
            <SegmentsGuide />
            <SocialGrid />
            <FounderCard />
          </>
        )}
      </main>
      
      <Footer />
    </div>
  );
};

export default App;
