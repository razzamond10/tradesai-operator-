// Admin layout — transparent pass-through.
// Existing admin pages manage their own full-page layout and header.
// This file exists so Next.js recognises /admin as a layout segment and
// to provide a future hook for shared admin chrome (e.g. analytics, error boundaries).
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
