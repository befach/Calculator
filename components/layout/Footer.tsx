'use client';

import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#36271E] px-6 py-6">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 sm:flex-row">
        <p className="text-sm text-white/80">
          &copy; 2026 BEFACH International. All rights reserved.
        </p>
        <a
          href="https://befach.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-white/80 underline underline-offset-2 transition-colors hover:text-[#F29222]"
        >
          Visit befach.com
        </a>
      </div>
    </footer>
  );
};

export default Footer;
