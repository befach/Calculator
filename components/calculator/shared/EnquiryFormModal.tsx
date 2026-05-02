'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, CheckCircle, AlertCircle, X } from 'lucide-react';

interface EnquiryFormModalProps {
  isOpen: boolean;
  onComplete: () => void;
  onClose: () => void;
}

export default function EnquiryFormModal({ isOpen, onComplete, onClose }: EnquiryFormModalProps) {
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

  const handleViewResults = () => {
    if (!formSubmitted) return;
    onComplete();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
        >
          {/* Backdrop — no onClick to prevent dismissal */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg h-[calc(100dvh-1rem)] sm:h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#F29222] to-[#C47518] px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-3 flex-shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-white font-bold text-base">
                  Almost There!
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close enquiry form"
                className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 text-white flex items-center justify-center transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Zoho Form */}
            <div className="flex-1 min-h-0 overflow-hidden bg-gray-50">
              <iframe
                aria-label="Enquiry Form"
                frameBorder="0"
                className="w-full h-full border-0"
                src="https://forms.zohopublic.in/befach_Int/form/KYCForm/formperma/7iEZMEomK1RyG-sjoe9s369UrU9ZdItf5VaflKVd8Ek"
              />
            </div>

            {/* Footer */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-t border-gray-100 bg-gray-50 space-y-2.5 sm:space-y-3 flex-shrink-0">
              {!formSubmitted && (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200/60 rounded-lg px-3 py-2">
                  <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-[11px] sm:text-xs text-amber-700 leading-relaxed">
                    Please submit the form above to view your calculation results
                  </p>
                </div>
              )}

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
                onClick={handleViewResults}
                disabled={!formSubmitted}
                className="w-full flex items-center justify-center gap-2 py-3 bg-brand-brown text-white rounded-xl text-sm font-semibold hover:bg-brand-brown/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <CheckCircle className="w-4 h-4" />
                View My Results
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
