'use client';

import { motion } from 'framer-motion';
import { FileText } from 'lucide-react';
import HSNSearchField from '../shared/HSNSearchField';
import DutyRateFields from '../shared/DutyRateFields';

interface Props {
  hsnCode: string;
  bcdRate: number;
  igstRate: number;
  onFieldChange: (field: string, value: unknown) => void;
}

export default function WebStepHSN({
  hsnCode,
  bcdRate,
  igstRate,
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
        <FileText className="w-5 h-5 text-brand-orange" />
        HSN & Duties
      </h3>

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
