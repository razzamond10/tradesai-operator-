import type { Metadata } from 'next';
import './globals.css';

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
      <body>{children}</body>
    </html>
  );
}
