import type { Metadata } from 'next';
import ResetPasswordClient from './ResetPasswordClient';

export const metadata: Metadata = {
  title: 'Reset password — TradesAI Operator',
  description: 'Set a new password for your TradesAI Operator account.',
};

export default function ResetPasswordPage() {
  return <ResetPasswordClient />;
}
