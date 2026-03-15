'use client';

import { useRouter } from 'next/navigation';
import { useDocumentStore } from '@/store/document-store';
import { Button } from '@/components/ui/button';
import { Pencil, Printer, Languages } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';

export function ActionBar() {
  const router = useRouter();
  const { language, setLanguage, commonInfo, clientInfo, customerType } = useDocumentStore();

  const handlePrint = () => {
    // Build default Save-As filename: YYMMDD_Name_Location
    const date = commonInfo.eventDate;
    const dateStr = date
      ? `${String(date.getFullYear()).slice(-2)}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
      : 'NoDate';
    const name = customerType === 'corporate'
      ? (clientInfo.companyName || 'NoName')
      : `คุณ${clientInfo.customerName || 'NoName'}`;
    const location = commonInfo.location || 'NoLocation';

    const originalTitle = document.title;
    document.title = `${dateStr}_${location}_${name}`;

    // Restore original title once the print dialog is dismissed
    const restore = () => {
      document.title = originalTitle;
      window.removeEventListener('afterprint', restore);
    };
    window.addEventListener('afterprint', restore);

    window.print();
  };

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
        onClick={handlePrint}
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
