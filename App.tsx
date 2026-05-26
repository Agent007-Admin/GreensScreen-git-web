import React from 'react';
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

const App: React.FC = () => {

  return (
    <div className="gs-page selection:bg-gs-green selection:text-gs-dark">
      <div className="scanlines" />
      <GridBackground />
      
      <Navbar />
      
      <main>
        <Hero />
        <Ticker />
        <Newsletter />
        <SegmentsGuide />
        <SocialGrid />
        <Pillars />
        <FounderCard />
      </main>
      
      <Footer />
    </div>
  );
};

export default App;
