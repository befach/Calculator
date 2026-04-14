'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, CheckCircle, AlertCircle } from 'lucide-react';

interface EnquiryFormModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

export default function EnquiryFormModal({ isOpen, onComplete }: EnquiryFormModalProps) {
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
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop — no onClick to prevent dismissal */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.4 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-[#F29222] to-[#C47518] px-6 py-4 flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-white font-bold text-base">
                  Almost There!
                </h2>
                <p className="text-white/80 text-xs mt-0.5">
                  Fill in your details to view your landed cost results
                </p>
              </div>
            </div>

            {/* Zoho Form */}
            <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
              <iframe
                aria-label="Enquiry Form"
                frameBorder="0"
                style={{ height: '500px', width: '100%', border: 'none' }}
                src="https://forms.zohopublic.in/befach_Int/form/KYCForm/formperma/7iEZMEomK1RyG-sjoe9s369UrU9ZdItf5VaflKVd8Ek"
              />
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 bg-gray-50 space-y-3">
              {!formSubmitted && (
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200/60 rounded-lg px-3 py-2">
                  <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-700">
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
