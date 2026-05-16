'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';
import { CalendarDays, Home } from 'lucide-react';

const NAV_LINKS = [
  { href: '/', label: 'หน้าหลัก', icon: Home },
  { href: '/calendar', label: 'ปฏิทิน', icon: CalendarDays },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="print:hidden fixed top-0 left-0 right-0 z-50 h-14 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-full max-w-3xl items-center justify-between px-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/blossom-logo.png"
            alt="Blossom Pixel"
            width={28}
            height={28}
            className="rounded-md"
          />
          <span className="text-sm font-semibold tracking-tight hidden sm:block">
            Blossom Pixel
          </span>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          {NAV_LINKS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Theme toggle */}
        <ThemeToggle />
      </div>
    </header>
  );
}
