'use client';

const formulaLines = [
  { label: 'CIF', formula: '= FOB + Freight + Insurance' },
  { label: 'Assessable Value', formula: '= CIF + 1% Landing Charges' },
  { label: 'BCD', formula: '= Assessable Value × BCD Rate' },
  { label: 'SWS', formula: '= BCD × 10%' },
  { label: 'IGST', formula: '= (Assessable Value + BCD + SWS) × IGST Rate' },
  { label: 'Landed Cost', formula: '= CIF + BCD + SWS + IGST + Other Charges' },
];

const dutyCards = [
  {
    title: 'BCD — Basic Customs Duty',
    description:
      'Varies by HSN code (0% to 150%). FTA benefits with ASEAN, Japan, UAE, Korea, and Australia may reduce this significantly.',
  },
  {
    title: 'SWS — Social Welfare Surcharge',
    description:
      'A flat 10% on BCD. Funds government welfare schemes. Always applied after BCD in the compounding sequence.',
  },
  {
    title: 'IGST — Integrated GST',
    description:
      'Calculated on the compounded base (CIF + BCD + SWS). Rates: 5%, 12%, 18%, or 28%. Claimable as ITC by GST-registered businesses.',
  },
];

const FormulaSection: React.FC = () => {
  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-10">
      <div className="max-w-[1100px] mx-auto">
        <div className="text-[11px] font-bold text-brand-orange uppercase tracking-[0.14em] mb-2 flex items-center gap-2">
          <span className="w-5 h-0.5 bg-brand-orange rounded-full" />
          The Formula
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-brown mb-2 leading-tight">
          India&apos;s Import Duty{' '}
          <span className="text-brand-orange">Calculation Engine</span>
        </h2>
        <p className="text-[15px] text-brand-brown/50 font-medium mb-10 max-w-lg">
          Built on official CBIC compounding logic — not a simple flat-rate
          estimate.
        </p>

        {/* Formula card */}
        <div className="bg-white border border-brand-border/50 rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-card">
          {/* Top accent bar */}
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-brand-orange to-brand-orange-dark" />

          <div className="text-[11px] font-bold text-brand-orange uppercase tracking-[0.12em] mb-5">
            CBIC-Compliant Landed Cost Formula
          </div>

          <div className="space-y-1.5 mb-8">
            {formulaLines.map((line) => (
              <div
                key={line.label}
                className="text-[14px] sm:text-[15px] text-brand-brown leading-relaxed"
              >
                <span className="font-bold text-brand-orange">{line.label}</span>{' '}
                <span className="text-brand-brown/70">{line.formula}</span>
              </div>
            ))}
          </div>

          {/* Duty explanation cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {dutyCards.map((card) => (
              <div
                key={card.title}
                className="bg-brand-cream rounded-xl border border-brand-border/30 p-4"
              >
                <h4 className="text-[13px] font-bold text-brand-orange-dark mb-1.5">
                  {card.title}
                </h4>
                <p className="text-[12px] text-brand-brown/50 leading-relaxed">
                  {card.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FormulaSection;
