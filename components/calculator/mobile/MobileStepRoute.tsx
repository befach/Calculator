'use client';

import { motion } from 'framer-motion';

import OriginCountrySelect from '../shared/OriginCountrySelect';
import CurrencyExchangeFields from '../shared/CurrencyExchangeFields';

interface Props {
  originCountryCode: string;
  currency: string;
  exchangeRate: number;
  exchangeRateSource?: 'static' | 'live' | 'loading';
  dhlZone: number | null;
  onFieldChange: (field: string, value: unknown) => void;
}

export default function MobileStepRoute({
  originCountryCode,
  currency,
  exchangeRate,
  exchangeRateSource,
  dhlZone,
  onFieldChange,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      <OriginCountrySelect
        originCountryCode={originCountryCode}
        dhlZone={dhlZone}
        onFieldChange={onFieldChange}
      />

      <CurrencyExchangeFields
        currency={currency}
        exchangeRate={exchangeRate}
        exchangeRateSource={exchangeRateSource}
        onFieldChange={onFieldChange}
      />
    </motion.div>
  );
}
