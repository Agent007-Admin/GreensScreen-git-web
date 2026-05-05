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

const App: React.FC = () => {

  return (
    <div className="gs-page selection:bg-gs-green selection:text-gs-dark">
      <div className="scanlines" />
      <div className="grid-bg" />
      
      <Navbar />
      
      <main>
        <Hero />
        <Ticker />
        <Pillars />
        <SegmentsGuide />
        <Newsletter />
        <SocialGrid />
        <FounderCard />
      </main>
      
      <Footer />
    </div>
  );
};

export default App;
