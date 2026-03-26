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
    <div className="flex items-center justify-between py-2 sm:py-2.5 gap-2">
      <div className="flex items-center gap-2 min-w-0">
        <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-brand-orange/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-brand-orange" />
        </div>
        <span className="text-xs sm:text-sm text-gray-700 truncate">{label}</span>
      </div>
      <div className="text-right flex-shrink-0">
        <p className="text-xs sm:text-sm font-semibold text-brand-brown tabular-nums">
          {currency !== 'INR' ? formatForeign(amountForeign, currency) : formatINR(amountINR)}
        </p>
        {currency !== 'INR' && (
          <p className="text-[10px] sm:text-xs text-gray-500 tabular-nums">{formatINR(amountINR)}</p>
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
          {currency !== 'INR' ? formatForeign(amountForeign, currency) : formatINR(amountINR)}
        </p>
        {currency !== 'INR' && (
          <p className="text-[10px] sm:text-xs text-gray-500 tabular-nums">{formatINR(amountINR)}</p>
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

export default function CostBreakdownList({ result, exchangeRate, currency }: Props) {
  return (
    <div className="space-y-1">
      <p className="text-xs sm:text-sm font-bold text-brand-brown uppercase tracking-wider mb-3">
        Cost Breakdown
      </p>

      {/* ─── Product & Freight ─── */}
      <SectionHeader title="Product & Freight" />
      <CostItem icon={CircleDollarSign} label="FOB Value" amountINR={result.fobValueINR} exchangeRate={exchangeRate} currency={currency} />
      <CostItem icon={Plane} label="Air Freight" amountINR={result.totalFreight} exchangeRate={exchangeRate} currency={currency} />
      <CostItem icon={Shield} label="Insurance (0.5%)" amountINR={result.insurance} exchangeRate={exchangeRate} currency={currency} />
      <SubtotalRow label="CIF Value" amountINR={result.cifValue} exchangeRate={exchangeRate} currency={currency} />

      {/* ─── Duties & Taxes ─── */}
      <SectionHeader title="Duties & Taxes" />
      <CostItem icon={Landmark} label={`Basic Customs Duty (${result.bcdRate}%)`} amountINR={result.basicCustomsDuty} exchangeRate={exchangeRate} currency={currency} />
      <CostItem icon={FileText} label="Social Welfare Surcharge" amountINR={result.socialWelfareSurcharge} exchangeRate={exchangeRate} currency={currency} />
      <CostItem icon={Receipt} label={`IGST (${result.igstRate}%)`} amountINR={result.igst} exchangeRate={exchangeRate} currency={currency} />
      <SubtotalRow label="Total Duties" amountINR={result.totalDuties} exchangeRate={exchangeRate} currency={currency} />

      {/* ─── Processing Fees ─── */}
      <SectionHeader title="Processing Fees" />
      <CostItem icon={FileText} label="DTP Fee" amountINR={result.dtpFee} exchangeRate={exchangeRate} currency={currency} />
      <CostItem icon={Building2} label="Clearance Charges" amountINR={result.clearanceCharges} exchangeRate={exchangeRate} currency={currency} />
      <CostItem icon={Building2} label="Port Charges (1%)" amountINR={result.portCharges} exchangeRate={exchangeRate} currency={currency} />
      <CostItem icon={Building2} label="Customs Clearance" amountINR={result.customsClearance} exchangeRate={exchangeRate} currency={currency} />

      {/* ─── Delivery (conditional) ─── */}
      {result.inlandTransport > 0 && (
        <>
          <SectionHeader title="Delivery" />
          <CostItem icon={Truck} label="Inland Transport" amountINR={result.inlandTransport} exchangeRate={exchangeRate} currency={currency} />
        </>
      )}
    </div>
  );
}
