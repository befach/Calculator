'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Download, CheckCircle } from 'lucide-react';

interface PDFFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownload: () => void;
}

export default function PDFFormModal({ isOpen, onClose, onDownload }: PDFFormModalProps) {
  const [formSubmitted, setFormSubmitted] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setFormSubmitted(false);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleDownloadAndClose = () => {
    if (!formSubmitted) return;
    onDownload();
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#F29222] to-[#C47518] px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-bold text-base">
                    Get Your Detailed Cost Breakdown
                  </h2>
                  <p className="text-white/80 text-xs mt-0.5">
                    Fill in your details to download the PDF report
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>

            {/* Zoho Form */}
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 160px)' }}>
              <iframe
                aria-label="Get Your Detailed Cost Breakdown"
                frameBorder="0"
                style={{ height: '500px', width: '100%', border: 'none' }}
                src="https://forms.zohopublic.in/befach_Int/form/KYCForm/formperma/7iEZMEomK1RyG-sjoe9s369UrU9ZdItf5VaflKVd8Ek"
              />
            </div>

            {/* Download button at the bottom */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formSubmitted}
                  onChange={(e) => setFormSubmitted(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-brand-orange focus:ring-brand-orange/30"
                />
                <span className="text-xs text-gray-600">I have submitted the form above</span>
              </label>
              <button
                onClick={handleDownloadAndClose}
                disabled={!formSubmitted}
                className="w-full flex items-center justify-center gap-2 py-3 bg-brand-brown text-white rounded-xl text-sm font-semibold hover:bg-brand-brown/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <Download className="w-4 h-4" />
                Download PDF Now
              </button>
              {!formSubmitted && (
                <p className="text-[10px] text-amber-600 text-center">
                  Please submit the form and check the box above to enable download
                </p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
