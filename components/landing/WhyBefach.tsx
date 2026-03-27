'use client';

import {
  Search,
  MapPin,
  FileText,
  CheckCircle,
  CreditCard,
  Tag,
} from 'lucide-react';

const services = [
  {
    icon: Search,
    title: 'Global Sourcing',
    description:
      'Access 10,000+ verified suppliers across China, Vietnam, Korea, Japan, UAE, and more. We handle identification, verification, and negotiation.',
  },
  {
    icon: MapPin,
    title: 'Logistics & Shipping',
    description:
      'Sea freight, air cargo, FCL, LCL — we manage it all. Door-to-door from your supplier\'s factory to your warehouse with tracking.',
  },
  {
    icon: FileText,
    title: 'Customs Clearance',
    description:
      'Expert customs brokers file your Bill of Entry via ICEGATE, handle HSN classification, duty payment, and full regulatory compliance.',
  },
  {
    icon: CheckCircle,
    title: 'Quality Inspection',
    description:
      'Pre-shipment quality testing, lab inspections, and compliance checks. Every product quality-checked before it leaves the factory.',
  },
  {
    icon: CreditCard,
    title: 'Supplier Payments',
    description:
      'Secure international payment processing — forex, Letters of Credit, and escrow-protected settlements on your behalf.',
  },
  {
    icon: Tag,
    title: 'Whitelabel & OEM',
    description:
      'Launch your own brand from MOQ 100 units. Custom packaging, private label, and full OEM manufacturing — we handle global procurement.',
  },
];

const WhyBefach: React.FC = () => {
  return (
    <section className="py-16 sm:py-20 px-4 sm:px-6 lg:px-10 bg-brand-cream-dark/50">
      <div className="max-w-[1100px] mx-auto">
        <div className="text-[11px] font-bold text-brand-orange uppercase tracking-[0.14em] mb-2 flex items-center gap-2">
          <span className="w-5 h-0.5 bg-brand-orange rounded-full" />
          Why Befach International
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-brand-brown mb-2 leading-tight">
          Beyond the Calculator —{' '}
          <span className="text-brand-orange">End-to-End</span> Import Solutions
        </h2>
        <p className="text-[15px] text-brand-brown/50 font-medium mb-10 max-w-lg">
          Knowing the cost is step one. Befach handles everything else —
          sourcing, customs, delivery.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map((service) => (
            <div
              key={service.title}
              className="bg-white border border-brand-border/40 rounded-2xl p-6 transition-all hover:border-brand-orange/30 hover:-translate-y-1 hover:shadow-card-hover"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-orange-light flex items-center justify-center text-brand-orange mb-4">
                <service.icon className="w-5 h-5" />
              </div>
              <h3 className="text-[15px] font-bold text-brand-brown mb-2">
                {service.title}
              </h3>
              <p className="text-[13px] text-brand-brown/50 leading-relaxed">
                {service.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyBefach;
