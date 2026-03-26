'use client';

import {
  Package, Plane, Shield, FileText, Landmark,
  Building2, Truck, Receipt, CircleDollarSign
} from 'lucide-react';
import { type AirFreightResult } from '@/lib/calculate';

interface Props {
  result: AirFreightResult;
  exchangeRate: number;
  currency: string;
}

function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatForeign(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function CostItem({
  icon: Icon,
  label,
  amountINR,
  exchangeRate,
  currency,
}: {
  icon: typeof Package;
  label: string;
  amountINR: number;
  exchangeRate: number;
  currency: string;
}) {
  const amountForeign = exchangeRate > 0 ? amountINR / exchangeRate : 0;

  return (
    <div className="flex items-center justify-between py-2 sm:py-2.5 border-b border-gray-50 last:border-0 gap-2">
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
          <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-400" />
        </div>
        <span className="text-xs sm:text-sm text-gray-600 truncate">{label}</span>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-xs sm:text-sm font-medium tabular-nums">
          {currency !== 'INR' ? formatForeign(amountForeign, currency) : formatINR(amountINR)}
        </p>
        {currency !== 'INR' && (
          <p className="text-[10px] sm:text-xs text-gray-400 tabular-nums">{formatINR(amountINR)}</p>
        )}
      </div>
    </div>
  );
}

export default function CostBreakdownList({ result, exchangeRate, currency }: Props) {
  const items: { icon: typeof Package; label: string; amount: number }[] = [
    { icon: CircleDollarSign, label: 'FOB Value', amount: result.fobValueINR },
    { icon: Plane, label: `DHL Freight`, amount: result.dhlTotalFreight },
    { icon: Shield, label: 'Insurance (0.5%)', amount: result.insurance },
    { icon: Landmark, label: `Basic Customs Duty (${result.bcdRate}%)`, amount: result.basicCustomsDuty },
    { icon: FileText, label: 'Social Welfare Surcharge', amount: result.socialWelfareSurcharge },
    { icon: Receipt, label: `IGST (${result.igstRate}%)`, amount: result.igst },
    { icon: FileText, label: 'DTP Fee', amount: result.dtpFee },
    { icon: Building2, label: 'Clearance Processing', amount: result.clearanceProcessing },
    { icon: Building2, label: 'Port Charges (1%)', amount: result.portCharges },
    { icon: Building2, label: 'Customs Clearance', amount: result.customsClearance },
  ];

  if (result.inlandTransport > 0) {
    items.push({ icon: Truck, label: 'Inland Transport', amount: result.inlandTransport });
  }

  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
        Cost Breakdown
      </p>
      <div>
        {items.map((item, i) => (
          <CostItem
            key={i}
            icon={item.icon}
            label={item.label}
            amountINR={item.amount}
            exchangeRate={exchangeRate}
            currency={currency}
          />
        ))}
      </div>
    </div>
  );
}
