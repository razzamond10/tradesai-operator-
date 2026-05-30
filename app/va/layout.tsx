import IdleTimer from '@/components/IdleTimer';

export default function VALayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <IdleTimer />
      {children}
    </>
  );
}
