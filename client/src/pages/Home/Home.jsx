import React, { useEffect } from 'react';
import Hero from '../../components/LandingPage/Hero';
import HotelShowcase from '../../components/LandingPage/HotelShowcase';
import FacilitiesMarquee from '../../components/LandingPage/FacilitiesMarquee';
import TestimonialsSection from '../../components/LandingPage/TestimonialsSection';
import Footer from '../../components/LandingPage/Footer';
import Navigation from '../../components/LandingPage/Navigation';
import Bot from './components/Bot';

const Home = () => {
  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-white text-[#1E293B] selection:bg-[#E8A317] selection:text-white overflow-x-hidden">
      <Navigation />
      
      {/* Hero Section */}
      <Hero />
      
      {/* Dynamic Animated Hotel Showcase */}
      <HotelShowcase />
      
      {/* Scrolling Facilities Marquee */}
      <FacilitiesMarquee />

      {/* Testimonials Review Section */}
      <TestimonialsSection />
      
      {/* Footer */}
      <Footer />
      <Bot />
    </div>
  );
};

export default Home;