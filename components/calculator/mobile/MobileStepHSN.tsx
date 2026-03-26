'use client';

import { motion } from 'framer-motion';

import HSNSearchField from '../shared/HSNSearchField';
import DutyRateFields from '../shared/DutyRateFields';

interface Props {
  hsnCode: string;
  bcdRate: number;
  igstRate: number;
  onFieldChange: (field: string, value: unknown) => void;
}

export default function MobileStepHSN({
  hsnCode,
  bcdRate,
  igstRate,
  onFieldChange,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="space-y-4"
    >
      <HSNSearchField
        hsnCode={hsnCode}
        bcdRate={bcdRate}
        igstRate={igstRate}
        onFieldChange={onFieldChange}
      />

      <DutyRateFields
        bcdRate={bcdRate}
        igstRate={igstRate}
        onFieldChange={onFieldChange}
      />
    </motion.div>
  );
}
