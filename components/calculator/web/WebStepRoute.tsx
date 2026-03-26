'use client';

import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import OriginCountrySelect from '../shared/OriginCountrySelect';
import CurrencyExchangeFields from '../shared/CurrencyExchangeFields';

interface Props {
  originCountryCode: string;
  currency: string;
  exchangeRate: number;
  dhlZone: number | null;
  onFieldChange: (field: string, value: unknown) => void;
}

export default function WebStepRoute({
  originCountryCode,
  currency,
  exchangeRate,
  dhlZone,
  onFieldChange,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-5"
    >
      <h3 className="text-lg font-semibold text-brand-brown flex items-center gap-2">
        <Globe className="w-5 h-5 text-brand-orange" />
        Route & Currency
      </h3>

      <OriginCountrySelect
        originCountryCode={originCountryCode}
        dhlZone={dhlZone}
        onFieldChange={onFieldChange}
      />

      <CurrencyExchangeFields
        currency={currency}
        exchangeRate={exchangeRate}
        onFieldChange={onFieldChange}
      />
    </motion.div>
  );
}
