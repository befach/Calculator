'use client';

import { motion } from 'framer-motion';
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

export default function MobileStepSeaRoute({
  originCountryCode,
  currency,
  exchangeRate,
  exchangeRateSource,
  incoterm,
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
