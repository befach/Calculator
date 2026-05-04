import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import Script from 'next/script';
import FeedbackIssueToggle from '@/components/layout/FeedbackIssueToggle';
import './globals.css';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});

export const metadata: Metadata = {
  title: 'Landing Cost Calculator | BEFACH International',
  description:
    'Calculate your import landing cost with BEFACH International. Get instant estimates for air freight, customs duties, taxes, and more.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={jakarta.variable}>
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-DDK4CD0WGM"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-DDK4CD0WGM');
          `}
        </Script>
      </head>
      <body className="min-h-screen bg-brand-cream font-sans antialiased">
        {children}
        <FeedbackIssueToggle />
      </body>
    </html>
  );
}
