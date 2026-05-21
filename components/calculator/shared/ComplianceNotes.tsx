'use client';

import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { getImportComplianceNotes, type ComplianceProduct } from '@/core/importCompliance';

interface Props {
  products: ComplianceProduct[];
}

export default function ComplianceNotes({ products }: Props) {
  const notes = getImportComplianceNotes(products);

  return (
    <div className="bg-white rounded-xl border border-amber-200 p-3 sm:p-4">
      <div className="flex items-start gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center flex-shrink-0">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
        </div>
        <div>
          <p className="text-xs font-bold text-brand-brown uppercase tracking-wider">Basic Import Compliance</p>
          <p className="text-[11px] text-amber-700 mt-0.5">
            Based on selected HSN code(s). Please verify before shipment.
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {notes.map((note) => (
          <div key={note.title} className="flex items-start gap-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-800">{note.title}</p>
              <p className="text-[11px] text-gray-600 leading-relaxed">{note.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
