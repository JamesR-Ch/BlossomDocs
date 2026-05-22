'use client';

import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/navbar';

export function NavbarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showNav  = !pathname.startsWith('/oom');

  return (
    <>
      {showNav && <Navbar />}
      <div className={showNav ? 'pt-14 print:pt-0' : ''}>
        {children}
      </div>
    </>
  );
}
