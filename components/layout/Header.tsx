'use client';

import React from 'react';

const Header: React.FC = () => {
  return (
    <header className="w-full border-b border-[#E0E0E0] bg-white px-4 sm:px-6 py-3 sm:py-4">
      <div className="mx-auto flex max-w-5xl items-center gap-2 sm:gap-3">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#36271E]">
          <span className="text-[#F29222]">BEFACH</span>
        </h1>
        <div className="h-5 sm:h-6 w-px bg-[#E0E0E0]" />
        <p className="text-xs sm:text-sm font-medium text-[#36271E]/70">
          Landing Cost Calculator
        </p>
      </div>
    </header>
  );
};

export default Header;
