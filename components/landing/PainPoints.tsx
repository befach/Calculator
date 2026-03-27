'use client';

import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const trustBadges = [
  'CBIC Compliant',
  'Updated 2026 Rates',
  'ITC Eligible',
];

const stats = [
  { value: '185+', label: 'Clients Served' },
  { value: '10,000+', label: 'Global Suppliers' },
  { value: '10+', label: 'Source Countries' },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1, delayChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] },
  },
};

const PainPoints: React.FC = () => {
  return (
    <div>
      {/* ── MOBILE ── */}
      <div className="lg:hidden text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-orange/10 text-brand-orange text-[11px] font-bold uppercase tracking-widest mb-4">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
          Free Import Cost Estimator
        </div>
        <h1 className="text-[22px] font-extrabold text-brand-brown leading-tight mb-2">
          Know Your True{' '}
          <span className="text-brand-orange">Import Cost</span>
          {' '}Before You Ship
        </h1>
        <p className="text-[13px] text-brand-brown/55 font-medium mb-4">
          Calculate duties, taxes, and logistics — in under 30 seconds
        </p>

        {/* Horizontal scroll trust badges */}
        <div className="flex justify-center gap-3 flex-wrap">
          {trustBadges.map((badge) => (
            <div
              key={badge}
              className="flex items-center gap-1.5 text-[11px] font-semibold text-brand-brown/50"
            >
              <Check className="w-3.5 h-3.5 text-green-600" strokeWidth={2.5} />
              {badge}
            </div>
          ))}
        </div>
      </div>

      {/* ── DESKTOP ── */}
      <motion.div
        className="hidden lg:block"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-orange/10 border border-brand-orange/15 text-brand-orange text-[12px] font-bold uppercase tracking-widest mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-orange animate-pulse" />
            Free Import Cost Estimator
          </div>
        </motion.div>

        <motion.div variants={itemVariants}>
          <h1 className="text-4xl xl:text-[2.75rem] font-extrabold text-brand-brown leading-[1.15] mb-4">
            Know Your True{' '}
            <span className="text-brand-orange">Import Cost</span>
            {' '}Before You Ship
          </h1>
          <p className="text-[15px] text-brand-brown/55 font-medium leading-relaxed mb-6 max-w-[440px]">
            Calculate the complete landed cost of your imports to India —
            including customs duty, IGST, surcharges, and logistics — in under
            30 seconds.
          </p>
        </motion.div>

        {/* Trust badges */}
        <motion.div variants={itemVariants} className="flex items-center gap-5 mb-8">
          {trustBadges.map((badge) => (
            <div
              key={badge}
              className="flex items-center gap-1.5 text-[13px] font-semibold text-brand-brown/50"
            >
              <Check className="w-4 h-4 text-green-600" strokeWidth={2.5} />
              {badge}
            </div>
          ))}
        </motion.div>

        {/* Stats row */}
        <motion.div
          variants={itemVariants}
          className="flex gap-10 pt-6 border-t border-brand-border/50"
        >
          {stats.map((stat) => (
            <div key={stat.label} className="flex flex-col">
              <span className="text-2xl font-extrabold text-brand-brown leading-none">
                {stat.value}
              </span>
              <span className="text-[11px] font-semibold text-brand-brown/35 uppercase tracking-wider mt-1.5">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default PainPoints;
