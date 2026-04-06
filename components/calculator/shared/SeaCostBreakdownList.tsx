'use client';

import {
  Ship, Shield, Landmark,
  Building2, Truck, CircleDollarSign,
  Anchor, FileText, Container,
  type LucideIcon,
} from 'lucide-react';
import { type SeaFreightResult } from '@/lib/calculateSea';

interface Props {
  result: SeaFreightResult;
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
  icon: LucideIcon;
  label: string;
  amountINR: number;
  exchangeRate: number;
  currency: string;
}) {
  const amountForeign = exchangeRate > 0 ? amountINR / exchangeRate : 0;

  return (
    <div className="flex items-center justify-between py-2 sm:py-2.5 gap-2">
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-brand-orange/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-brand-orange" />
        </div>
        <span className="text-xs sm:text-sm text-gray-700 truncate">{label}</span>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-xs sm:text-sm font-semibold text-brand-brown tabular-nums">
          {formatINR(amountINR)}
        </p>
        {currency !== 'INR' && (
          <p className="text-[10px] sm:text-xs text-gray-500 tabular-nums">{formatForeign(amountForeign, currency)}</p>
        )}
      </div>
    </div>
  );
}

function SubtotalRow({
  label,
  amountINR,
  exchangeRate,
  currency,
}: {
  label: string;
  amountINR: number;
  exchangeRate: number;
  currency: string;
}) {
  const amountForeign = exchangeRate > 0 ? amountINR / exchangeRate : 0;

  return (
    <div className="flex items-center justify-between bg-brand-orange/5 rounded-lg px-2.5 py-2 mt-1">
      <span className="text-xs sm:text-sm font-bold text-brand-brown">{label}</span>
      <div className="text-right">
        <p className="text-xs sm:text-sm font-bold text-brand-brown tabular-nums">
          {formatINR(amountINR)}
        </p>
        {currency !== 'INR' && (
          <p className="text-[10px] sm:text-xs text-gray-500 tabular-nums">{formatForeign(amountForeign, currency)}</p>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <p className="text-[10px] sm:text-xs font-bold text-brand-brown uppercase tracking-wider mt-4 mb-1 first:mt-0">
      {title}
    </p>
  );
}

export default function SeaCostBreakdownList({ result, exchangeRate, currency }: Props) {
  return (
    <div className="space-y-1">
      <p className="text-xs sm:text-sm font-bold text-brand-brown uppercase tracking-wider mb-3">
        Cost Breakdown
      </p>

      {/* Product & FOB */}
      <SectionHeader title="Product Value" />
      <CostItem icon={CircleDollarSign} label="FOB Value" amountINR={result.totalFobINR} exchangeRate={exchangeRate} currency={currency} />

      {/* Freight & Port Charges */}
      <SectionHeader title="Freight & Port Charges" />
      <CostItem icon={Ship} label={result.isUserFreight ? 'Ocean Freight (Custom)' : 'Ocean Freight'} amountINR={result.oceanFreight} exchangeRate={exchangeRate} currency={currency} />
      <CostItem icon={Anchor} label="THC Origin" amountINR={result.thcOrigin} exchangeRate={exchangeRate} currency={currency} />
      <CostItem icon={Anchor} label="THC Destination" amountINR={result.thcDestination} exchangeRate={exchangeRate} currency={currency} />
      <CostItem icon={FileText} label="BL Fee" amountINR={result.blFee} exchangeRate={exchangeRate} currency={currency} />
      <CostItem icon={FileText} label="DO Charges" amountINR={result.doCharges} exchangeRate={exchangeRate} currency={currency} />
      {result.cfsCharges > 0 && (
        <CostItem icon={Container} label="CFS Charges" amountINR={result.cfsCharges} exchangeRate={exchangeRate} currency={currency} />
      )}
      <CostItem icon={Building2} label="Customs Examination" amountINR={result.customExamination} exchangeRate={exchangeRate} currency={currency} />
      {result.demurrage > 0 && (
        <CostItem icon={Building2} label="Demurrage" amountINR={result.demurrage} exchangeRate={exchangeRate} currency={currency} />
      )}
      {result.detention > 0 && (
        <CostItem icon={Building2} label="Detention" amountINR={result.detention} exchangeRate={exchangeRate} currency={currency} />
      )}

      {/* Insurance */}
      <CostItem icon={Shield} label="Insurance (0.5%)" amountINR={result.totalInsurance} exchangeRate={exchangeRate} currency={currency} />
      <SubtotalRow label="CIF Value" amountINR={result.totalCifValue} exchangeRate={exchangeRate} currency={currency} />

      {/* Duties & Taxes */}
      <SectionHeader title="Duties & Taxes" />
      <CostItem icon={Landmark} label="Import Duties" amountINR={result.totalDuties} exchangeRate={exchangeRate} currency={currency} />

      {/* Processing Fees */}
      <SectionHeader title="Processing Fees" />
      <CostItem icon={Building2} label="Clearance Charges" amountINR={result.clearanceCharges} exchangeRate={exchangeRate} currency={currency} />

      {/* Delivery (conditional) */}
      {result.inlandTransport > 0 && (
        <>
          <SectionHeader title="Delivery" />
          <CostItem icon={Truck} label="Inland Transport" amountINR={result.inlandTransport} exchangeRate={exchangeRate} currency={currency} />
        </>
      )}
    </div>
  );
}
