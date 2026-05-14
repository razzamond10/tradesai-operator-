import type { Metadata } from 'next';
import ForgotPasswordClient from './ForgotPasswordClient';

export const metadata: Metadata = {
  title: 'Forgot password — TradesAI Operator',
  description: 'Reset your TradesAI Operator account password.',
};

export default function ForgotPasswordPage() {
  return <ForgotPasswordClient />;
}
