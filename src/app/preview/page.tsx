'use client';

import { useRouter } from 'next/navigation';
import { useDocumentStore } from '@/store/document-store';
import { DocumentHeader } from '@/components/preview/document-header';
import { DocumentTable } from '@/components/preview/document-table';
import { DocumentFooter } from '@/components/preview/document-footer';
import { ActionBar } from '@/components/preview/action-bar';

export default function PreviewPage() {
  const router = useRouter();
  const { customerType, eventType, documentType } = useDocumentStore();

  // Redirect if selections incomplete
  if (!customerType || !eventType || !documentType) {
    if (typeof window !== 'undefined') router.replace('/');
    return null;
  }

  return (
    <main className="min-h-screen bg-muted/40 print:bg-white print:min-h-0">
      <div className="mx-auto max-w-[240mm] px-4 py-8 print:p-0 print:max-w-none">
        {/* Non-printable action bar */}
        <ActionBar />

        {/* A4 Paper — inline color ensures dark text even in dark mode */}
        <div className="a4-paper flex flex-col justify-between" style={{ color: 'oklch(0.145 0 0)' }}>
          {/* Top section: header + table */}
          <div className="space-y-5">
            <DocumentHeader />
            <DocumentTable />
          </div>

          {/* Bottom section: footer with remarks + signatures */}
          <div className="mt-auto pt-4">
            <DocumentFooter />
          </div>
        </div>
      </div>
    </main>
  );
}
