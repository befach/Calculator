'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { label: 'Home', href: 'https://befach.com' },
  { label: 'Import Services', href: 'https://befach.com/import-services' },
  { label: 'About Us', href: 'https://befach.com/about' },
  { label: 'Blog', href: 'https://befach.com/blogs' },
  { label: 'Track Your Shipment', href: 'https://track.befach.com/track-new' },
];

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState(64);
  const savedScrollY = useRef(0);

  useEffect(() => {
    const check = () => setIsScrolled(window.scrollY > 10);
    check();
    window.addEventListener('scroll', check, { passive: true });
    return () => window.removeEventListener('scroll', check);
  }, []);

  useEffect(() => {
    if (!headerRef.current) return;
    const update = () => {
      if (headerRef.current) setHeaderHeight(headerRef.current.offsetHeight);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isMenuOpen) return;
    savedScrollY.current = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${savedScrollY.current}px`;
    document.body.style.width = '100%';
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      window.scrollTo(0, savedScrollY.current);
    };
  }, [isMenuOpen]);

  return (
    <header
      ref={headerRef}
      className={`w-full sticky top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-header'
          : 'bg-white'
      }`}
      style={{ borderBottom: '1px solid rgba(224,216,207,0.6)' }}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        <div className="flex items-center h-16 gap-4">
          <a href="https://befach.com" className="flex items-center shrink-0">
            <Image
              src="/logo.png"
              alt="BEFACH"
              width={180}
              height={72}
              className="h-12 sm:h-14 w-auto"
              priority
              unoptimized
            />
          </a>

          <div className="hidden lg:block flex-1 min-w-0" />

          <nav
            aria-label="Main navigation"
            className="hidden lg:flex items-center gap-1"
          >
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 text-[13px] font-semibold text-brand-brown/70 hover:text-brand-orange transition-colors whitespace-nowrap rounded-lg hover:bg-brand-orange/5"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="lg:hidden ml-auto">
            <button
              className="p-2 text-brand-brown min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-brand-cream-dark transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu with smooth slide transition */}
      <div
        className={`lg:hidden fixed inset-0 bg-brand-brown z-40 overflow-y-auto overscroll-contain transition-all duration-300 ease-in-out ${
          isMenuOpen
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
        style={{ top: `${headerHeight}px` }}
      >
        <nav className="flex flex-col p-5 gap-1">
          {navLinks.map((link, i) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3.5 px-4 text-[15px] font-medium text-white/90 hover:text-white hover:bg-white/5 rounded-lg transition-all duration-200"
              style={{
                transitionDelay: isMenuOpen ? `${i * 50}ms` : '0ms',
                opacity: isMenuOpen ? 1 : 0,
                transform: isMenuOpen ? 'translateX(0)' : 'translateX(-12px)',
              }}
              onClick={() => setIsMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Header;
