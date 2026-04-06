'use client';

import { motion } from 'framer-motion';
import { Globe } from 'lucide-react';
import OriginCountrySelect from '../shared/OriginCountrySelect';
import CurrencyExchangeFields from '../shared/CurrencyExchangeFields';
import IncotermsSelector, { type Incoterm } from '../shared/IncotermsSelector';

interface Props {
  originCountryCode: string;
  currency: string;
  exchangeRate: number;
  exchangeRateSource?: 'static' | 'live' | 'loading';
  incoterm: string;
  onFieldChange: (field: string, value: unknown) => void;
}

export default function WebStepSeaRoute({
  originCountryCode,
  currency,
  exchangeRate,
  exchangeRateSource,
  incoterm,
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
        Route, Currency & Incoterms
      </h3>

      <OriginCountrySelect
        originCountryCode={originCountryCode}
        dhlZone={null}
        onFieldChange={onFieldChange}
      />

      <CurrencyExchangeFields
        currency={currency}
        exchangeRate={exchangeRate}
        exchangeRateSource={exchangeRateSource}
        onFieldChange={onFieldChange}
      />

      <IncotermsSelector
        value={incoterm}
        onChange={(val: Incoterm) => onFieldChange('incoterm', val)}
      />
    </motion.div>
  );
}
