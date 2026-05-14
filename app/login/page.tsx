import type { Metadata } from 'next';
import LoginClient from './LoginClient';

export const metadata: Metadata = {
  title: 'Sign in — TradesAI Operator',
  description: 'Sign in to your TradesAI Operator account.',
};

export default function LoginPage() {
  return <LoginClient />;
}
