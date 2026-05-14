import IdleTimer from '@/components/IdleTimer';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <IdleTimer />
      {children}
    </>
  );
}
