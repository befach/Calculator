'use client';

import { Linkedin, Facebook, Instagram, Twitter } from 'lucide-react';

const BEFACH_URL = 'https://befach.com';

const footerColumns = [
  {
    title: 'Get support',
    links: [
      { label: 'Help Center', href: '/contact' },
      { label: 'Track Order', href: 'https://track.befach.com/track-new' },
      { label: 'Refunds', href: '/refund-policy' },
      { label: 'Report Issue', href: '/contact' },
    ],
  },
  {
    title: 'Important Links',
    links: [
      { label: 'Terms of Service', href: '/terms-of-service' },
      { label: 'Privacy Policy', href: '/privacy-policy' },
      { label: 'Shipping Policy', href: '/shipping-policy' },
      { label: 'Refund Policy', href: '/refund-policy' },
      { label: 'About Us', href: '/about' },
    ],
  },
  {
    title: 'Source on Befach',
    links: [
      { label: 'Request for Quote', href: '/contact' },
      { label: 'Whitelabel Program', href: '/import-services' },
      { label: 'OEM Manufacturing', href: '/import-services' },
      { label: 'Sample Program', href: '/contact' },
      { label: 'Befach Blog', href: '/blogs' },
    ],
  },
  {
    title: 'Get to know us',
    links: [
      { label: 'About Befach', href: '/about' },
      { label: "D'Cal Brand", href: '/about' },
      { label: 'Befach Wellness', href: '/about' },
      { label: 'Gallery', href: '/about#gallery' },
      { label: 'Careers', href: '/contact' },
      { label: 'Contact', href: '/contact' },
    ],
  },
];

const socialLinks = [
  {
    icon: Linkedin,
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/company/befachint/',
  },
  { icon: Twitter, label: 'X', href: 'https://x.com/befachint' },
  {
    icon: Instagram,
    label: 'Instagram',
    href: 'https://www.instagram.com/befachint?igsh=dGR0MHBmb3VrYmdq',
  },
  {
    icon: Facebook,
    label: 'Facebook',
    href: 'https://www.facebook.com/befachint',
  },
];

const bottomLinks = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms of Service', href: '/terms-of-service' },
];

function resolveHref(href: string): string {
  if (href.startsWith('http')) return href;
  return `${BEFACH_URL}${href}`;
}

const Footer: React.FC = () => {
  return (
    <footer className="bg-brand-brown">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 pt-12 pb-6">
        {/* Main grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-10">
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h2 className="font-bold text-[13px] text-white/90 mb-4 uppercase tracking-wide">
                {col.title}
              </h2>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={resolveHref(link.href)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[13px] text-white/50 hover:text-brand-orange transition-colors py-0.5 inline-block"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Trade on the go column */}
          <div className="col-span-2 md:col-span-1">
            <h2 className="font-bold text-[13px] text-white/90 mb-4 uppercase tracking-wide">
              Trade on the go
            </h2>
            <p className="text-xs text-white/40 leading-relaxed mb-4">
              The Befach app — coming soon for instant sourcing, tracking, and
              ordering.
            </p>
            <div className="flex gap-2">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-white/8 flex items-center justify-center text-white/50 hover:text-brand-orange hover:bg-white/15 transition-all"
                  aria-label={`Visit our ${label} page`}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 pt-5 flex flex-col sm:flex-row justify-between items-center gap-3">
          <span className="text-[12px] text-white/35">
            &copy; {new Date().getFullYear()} Befach International &middot;
            Befach 4X Pvt. Ltd. &middot; Hyderabad, India
          </span>
          <div className="flex gap-4 text-[12px] text-white/35">
            {bottomLinks.map((link) => (
              <a
                key={link.label}
                href={resolveHref(link.href)}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-brand-orange transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
