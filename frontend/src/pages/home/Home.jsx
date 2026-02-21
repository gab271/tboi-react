// Home.jsx - Redesigned Landing Page (Companion App Focus)
import { HeroRedesign } from '../../components/home/HeroRedesign';
import { ItemAnalyzerBar } from '../../components/home/ItemAnalyzerBar';
import { SocialProofBar } from '../../components/home/SocialProofBar';
import { ProgressTracker } from '../../components/home/ProgressTracker';
import { ActivityFeed } from '../../components/home/ActivityFeed';
import { BenefitsSection } from '../../components/home/BenefitsSection';
import { PremiumTeaser } from '../../components/home/PremiumTeaser';
import { FinalCTA } from '../../components/home/FinalCTA';
import { MinimalFooter } from '../../components/home/MinimalFooter';
import { MobileStickyCTA } from '../../components/home/MobileStickyCTA';

export function Home() {
  return (
    <div className="flex flex-col relative">
      
      {/* 1. Hero - Clear value proposition */}
      <HeroRedesign />

      {/* 2. Tool Bar - Instant value demonstration */}
      <ItemAnalyzerBar />

      {/* 3. Social Proof - Community stats */}
      <SocialProofBar />

      {/* 4. Progress Tracker (Missing Poster redesigned) */}
      <ProgressTracker />

      {/* 5. Activity Feed - Live community */}
      <ActivityFeed />

      {/* 6. Benefits - Clear value cards */}
      <BenefitsSection />

      {/* 7. Premium Teaser - Subtle upsell */}
      <PremiumTeaser />

      {/* 8. Final CTA - Registration push */}
      <FinalCTA />

      {/* 9. Minimal Footer */}
      <MinimalFooter />

      {/* Mobile Sticky CTA */}
      <MobileStickyCTA />
    </div>
  );
}
