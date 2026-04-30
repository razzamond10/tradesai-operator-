import type { Metadata } from 'next';
import './globals.css';
import CookieBanner from '@/components/CookieBanner';

export const metadata: Metadata = {
  title: 'TradesAI Operator - 24/7 AI Receptionist for UK Trade Businesses',
  description: 'Never miss a call. 24/7 AI receptionist for plumbers, electricians, HVAC, roofers, and 40+ trades.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
