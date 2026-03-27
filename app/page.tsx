'use client';

import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import PainPoints from '@/components/landing/PainPoints';
import CalculatorWizard from '@/components/landing/CalculatorWizard';
import HowItWorks from '@/components/landing/HowItWorks';
import FormulaSection from '@/components/landing/FormulaSection';
import WhyBefach from '@/components/landing/WhyBefach';
import CTASection from '@/components/landing/CTASection';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero section */}
      <section className="relative bg-gradient-to-b from-brand-cream to-white overflow-hidden">
        {/* Dot pattern */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(242,146,34,0.05) 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />

        <div className="relative z-10 max-w-[1200px] mx-auto w-full px-4 sm:px-6 lg:px-10 pt-8 sm:pt-12 lg:pt-16 pb-12 sm:pb-16 lg:pb-20">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 xl:gap-16 lg:items-center">
            {/* Left: Pain points */}
            <PainPoints />

            {/* Right: Calculator wizard */}
            <div className="mt-6 lg:mt-0">
              <CalculatorWizard />
            </div>
          </div>
        </div>
      </section>

      {/* Content sections */}
      <HowItWorks />
      <FormulaSection />
      <WhyBefach />
      <CTASection />

      <Footer />
    </div>
  );
}
