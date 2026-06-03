import React from 'react';
import Navbar from './components/ui/navbar';
import Hero from './components/sections/hero';
import Problem from './components/sections/problem';
import Approach from './components/sections/approach';
import Architecture from './components/sections/architecture';
import Vocabulary from './components/sections/vocabulary';
import Impact from './components/sections/impact';
import Team from './components/sections/team';
import CTAFooter from './components/sections/cta-footer';

export default function LandingPage() {
  return (
    <main className="flex flex-col min-h-screen">
      {/* Navigation */}
      <Navbar />

      {/* Hero Section */}
      <Hero />

      {/* Why This Matters / Problem Section */}
      <Problem />

      {/* Our Approach / Novelty Pillars */}
      <Approach />

      {/* System Architecture / Pipeline */}
      <Architecture />

      {/* Vocabulary / Words of Hope */}
      <Vocabulary />

      {/* Research Impact / Protocol */}
      <Impact />

      {/* Team / Researchers */}
      <Team />

      {/* CTA Strip & Footer */}
      <CTAFooter />
    </main>
  );
}
