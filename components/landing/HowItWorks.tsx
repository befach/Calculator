'use client';

const steps = [
  {
    num: '01',
    title: 'Enter Product Value',
    description:
      'Start with your FOB (Free on Board) price — the cost of goods at the supplier\'s port, including local transport and loading.',
  },
  {
    num: '02',
    title: 'Add Freight & Insurance',
    description:
      'Include international shipping costs (sea or air freight) and cargo insurance to arrive at your CIF value.',
  },
  {
    num: '03',
    title: 'Apply Duties & Taxes',
    description:
      'We compute BCD, Social Welfare Surcharge, and IGST using the CBIC\'s compounding formula on your assessable value.',
  },
  {
    num: '04',
    title: 'Get Total Landed Cost',
    description:
      'See a complete cost breakdown — including clearance charges and local delivery — to price your products with confidence.',
  },
];

const HowItWorks: React.FC = () => {
  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-10 bg-brand-cream-dark/50">
      <div className="max-w-[1100px] mx-auto">
        <div className="text-[11px] font-bold text-brand-orange uppercase tracking-[0.14em] mb-2 flex items-center gap-2">
          <span className="w-5 h-0.5 bg-brand-orange rounded-full" />
          How It Works
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-brown mb-2 leading-tight">
          Four Steps to Your{' '}
          <span className="text-brand-orange">Landed Cost</span>
        </h2>
        <p className="text-[15px] text-brand-brown/50 font-medium mb-10 max-w-lg">
          From product cost to your warehouse door — every rupee accounted for.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((step) => (
            <div
              key={step.num}
              className="bg-white border border-brand-border/40 rounded-2xl p-6 transition-all hover:border-brand-orange/30 hover:-translate-y-1 hover:shadow-card-hover"
            >
              <div className="w-9 h-9 rounded-xl bg-brand-orange-light flex items-center justify-center text-brand-orange text-[13px] font-extrabold mb-4">
                {step.num}
              </div>
              <h3 className="text-[15px] font-bold text-brand-brown mb-2">
                {step.title}
              </h3>
              <p className="text-[13px] text-brand-brown/50 leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
