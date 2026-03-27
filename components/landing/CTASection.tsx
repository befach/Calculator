'use client';

import { ArrowRight } from 'lucide-react';

const CTASection: React.FC = () => {
  return (
    <section className="relative py-16 sm:py-20 px-4 sm:px-6 lg:px-10 bg-brand-brown overflow-hidden">
      {/* Dot pattern overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, rgba(242,146,34,0.06) 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />

      <div className="max-w-[700px] mx-auto text-center relative z-10">
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3 leading-tight">
          Ready to Import{' '}
          <span className="text-brand-orange">Smarter</span>?
        </h2>
        <p className="text-[15px] text-white/55 font-medium leading-relaxed mb-8 max-w-lg mx-auto">
          Get a personalized landed cost analysis for your product. Our import
          experts will help you optimize duties, find better suppliers, and save
          on logistics.
        </p>

        <div className="flex gap-3 justify-center flex-wrap">
          <a
            href="https://go.befach.com/intake/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-orange text-white font-bold text-[14px] hover:bg-brand-orange-dark transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand-orange/30"
          >
            Start Your Import Journey
            <ArrowRight className="w-4 h-4" />
          </a>
          <a
            href="https://befach.com/import-services"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-3 rounded-xl border border-white/20 text-white font-semibold text-[14px] hover:border-brand-orange hover:text-brand-orange transition-all"
          >
            Explore Services
          </a>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
