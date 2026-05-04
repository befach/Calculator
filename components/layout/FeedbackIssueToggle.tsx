'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, MessageSquareText, X } from 'lucide-react';

type FormMode = 'feedback' | 'issue';

const formConfig: Record<FormMode, { label: string; title: string; envUrl?: string }> = {
  feedback: {
    label: 'Feedback',
    title: 'Share feedback',
    envUrl: process.env.NEXT_PUBLIC_ZOHO_FEEDBACK_FORM_URL,
  },
  issue: {
    label: 'Issue',
    title: 'Raise an issue',
    envUrl: process.env.NEXT_PUBLIC_ZOHO_ISSUE_FORM_URL,
  },
};

export default function FeedbackIssueToggle() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<FormMode>('feedback');

  const activeForm = formConfig[mode];
  const formUrl = activeForm.envUrl?.trim();

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Open feedback and issue form"
        className="fixed bottom-4 right-4 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-brand-brown text-white shadow-xl shadow-brand-brown/20 transition hover:bg-brand-brown-light focus:outline-none focus:ring-4 focus:ring-brand-orange/30 sm:bottom-6 sm:right-6"
      >
        <MessageSquareText className="h-5 w-5" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-3 backdrop-blur-sm sm:items-center sm:p-6"
          >
            <motion.div
              initial={{ opacity: 0, y: 28, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ type: 'spring', duration: 0.35 }}
              className="flex h-[min(760px,calc(100dvh-1.5rem))] w-full max-w-xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-labelledby="feedback-issue-title"
            >
              <div className="flex items-center justify-between gap-3 border-b border-brand-border bg-brand-cream px-4 py-3 sm:px-5">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-brand-orange-light text-brand-orange">
                    <MessageSquareText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <h2 id="feedback-issue-title" className="truncate text-sm font-bold text-brand-brown">
                      {activeForm.title}
                    </h2>
                    <p className="text-xs text-brand-brown-light">
                      Help us improve the calculator
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  aria-label="Close feedback and issue form"
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-brand-brown-light transition hover:bg-white focus:outline-none focus:ring-4 focus:ring-brand-orange/20"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="border-b border-brand-border bg-white px-4 py-3 sm:px-5">
                <div className="grid grid-cols-2 rounded-xl bg-brand-cream p-1">
                  {(Object.keys(formConfig) as FormMode[]).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setMode(item)}
                      className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                        mode === item
                          ? 'bg-white text-brand-brown shadow-sm'
                          : 'text-brand-brown-light hover:text-brand-brown'
                      }`}
                    >
                      {formConfig[item].label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="min-h-0 flex-1 bg-gray-50">
                {formUrl ? (
                  <iframe
                    title={`${activeForm.label} form`}
                    aria-label={`${activeForm.label} form`}
                    src={formUrl}
                    className="h-full w-full border-0"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center p-5">
                    <div className="w-full rounded-xl border border-dashed border-brand-border bg-white p-5 text-center">
                      <AlertCircle className="mx-auto mb-3 h-6 w-6 text-brand-orange" />
                      <p className="text-sm font-semibold text-brand-brown">
                        Zoho form URL pending
                      </p>
                      <p className="mt-2 text-xs leading-relaxed text-brand-brown-light">
                        Add the public Zoho form permalink to your environment variable, then restart the app.
                      </p>
                      <code className="mt-4 block rounded-lg bg-brand-cream px-3 py-2 text-left text-[11px] text-brand-brown">
                        {mode === 'feedback'
                          ? 'NEXT_PUBLIC_ZOHO_FEEDBACK_FORM_URL='
                          : 'NEXT_PUBLIC_ZOHO_ISSUE_FORM_URL='}
                      </code>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
