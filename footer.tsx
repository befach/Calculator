import Link from "next/link"
import { Linkedin, Facebook, Instagram, Twitter } from "lucide-react"

const footerColumns = [
  {
    title: "Get support",
    links: [
      { label: "Help Center", href: "/contact" },
      { label: "Track Order", href: "https://track.befach.com/track-new" },
      { label: "Refunds", href: "/refund-policy" },
      { label: "Report Issue", href: "/contact" },
    ],
  },
  {
    title: "Important Links",
    links: [
      { label: "Terms of Service", href: "/terms-of-service" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Shipping Policy", href: "/shipping-policy" },
      { label: "Refund Policy", href: "/refund-policy" },
      { label: "About Us", href: "/about" },
    ],
  },
  {
    title: "Source on Befach",
    links: [
      { label: "Request for Quote", href: "/contact" },
      { label: "Whitelabel Program", href: "/import-services" },
      { label: "OEM Manufacturing", href: "/import-services" },
      { label: "Sample Program", href: "/contact" },
      { label: "Befach Blog", href: "/blogs" },
    ],
  },
  {
    title: "Get to know us",
    links: [
      { label: "About Befach", href: "/about" },
      { label: "D'Cal Brand", href: "/about" },
      { label: "Befach Wellness", href: "/about" },
      { label: "Gallery", href: "/about#gallery" },
      { label: "Careers", href: "/contact" },
      { label: "Contact", href: "/contact" },
    ],
  },
]

const socialLinks = [
  { icon: Linkedin, label: "LinkedIn", href: "https://www.linkedin.com/company/befachint/" },
  { icon: Twitter, label: "X", href: "https://x.com/befachint" },
  { icon: Instagram, label: "Instagram", href: "https://www.instagram.com/befachint?igsh=dGR0MHBmb3VrYmdq" },
  { icon: Facebook, label: "Facebook", href: "https://www.facebook.com/befachint" },
]

const bottomLinks = [
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Service", href: "/terms-of-service" },
]

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-100">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 pt-9 pb-5">
        {/* Main grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-7 mb-7">
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h2 className="font-bold text-[13px] text-gray-900 mb-3">{col.title}</h2>
              <ul className="space-y-[10px]">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-[13px] text-gray-500 hover:text-primary transition-colors py-1 inline-block"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Trade on the go column */}
          <div className="col-span-2 md:col-span-1">
            <h2 className="font-bold text-[13px] text-gray-900 mb-3">Trade on the go</h2>
            <p className="text-xs text-gray-400 leading-relaxed mb-3">
              The Befach app — coming soon for instant sourcing, tracking, and ordering.
            </p>
            <div className="flex gap-2 mb-3.5">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <Link
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-[44px] h-[44px] rounded-md bg-gray-100 flex items-center justify-center text-gray-500 hover:text-primary hover:bg-primary/10 transition-colors"
                  aria-label={`Visit our ${label} page`}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-gray-100 pt-3.5 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span className="text-[12px] text-gray-400">
            &copy; {new Date().getFullYear()} Befach International &middot; Befach 4X Pvt. Ltd. &middot; Hyderabad, India
          </span>
          <div className="flex gap-3.5 text-[12px] text-gray-400">
            {bottomLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
