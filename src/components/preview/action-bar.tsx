'use client';

import { useRouter } from 'next/navigation';
import { useDocumentStore } from '@/store/document-store';
import { Button } from '@/components/ui/button';
import { Pencil, Printer, Languages } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';

export function ActionBar() {
  const router = useRouter();
  const { language, setLanguage } = useDocumentStore();

  return (
    <div className="print-hidden flex flex-wrap items-center justify-center gap-3 mb-6">
      {/* Edit Data */}
      <Button
        variant="outline"
        className="gap-2"
        onClick={() => router.push('/document')}
      >
        <Pencil className="h-4 w-4" />
        แก้ไขข้อมูล
      </Button>

      {/* Print */}
      <Button
        className="gap-2"
        onClick={() => window.print()}
      >
        <Printer className="h-4 w-4" />
        พิมพ์เอกสาร
      </Button>

      {/* Language Toggle */}
      <Button
        variant="outline"
        className="gap-2"
        onClick={() => setLanguage(language === 'th' ? 'en' : 'th')}
      >
        <Languages className="h-4 w-4" />
        <span className={cn(language === 'th' && 'font-bold')}>TH</span>
        /
        <span className={cn(language === 'en' && 'font-bold')}>EN</span>
      </Button>

      {/* Theme Toggle */}
      <ThemeToggle />
    </div>
  );
}
