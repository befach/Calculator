import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Landing Cost Calculator | BEFACH International',
  description: 'Calculate your import landing cost with BEFACH International. Get instant estimates for air freight, customs duties, taxes, and more.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#FAFAFA]">
        {children}
      </body>
    </html>
  );
}
