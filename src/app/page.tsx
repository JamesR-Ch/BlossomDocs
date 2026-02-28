'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useDocumentStore } from '@/store/document-store';
import { SelectionCard } from '@/components/selection/selection-card';
import { Button } from '@/components/ui/button';
import {
  Users, Building2, Heart, PartyPopper, Sparkles,
  FileText, FileCheck, Receipt, ClipboardList, ArrowRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/theme-toggle';
import type { CustomerType, EventType, DocumentType } from '@/lib/types';

export default function HomePage() {
  const router = useRouter();
  const {
    customerType, eventType, documentType,
    setCustomerType, setEventType, setDocumentType,
  } = useDocumentStore();

  const allSelected = customerType && eventType && documentType;

  /** Toggle selection — deselect if already selected, clearing downstream choices */
  function toggleCustomer(v: CustomerType) {
    if (customerType === v) {
      setCustomerType(null);
      setEventType(null);
      setDocumentType(null);
    } else {
      setCustomerType(v);
    }
  }

  function toggleEvent(v: EventType) {
    if (eventType === v) {
      setEventType(null);
      setDocumentType(null);
    } else {
      setEventType(v);
    }
  }

  function toggleDocument(v: DocumentType) {
    setDocumentType(documentType === v ? null : v);
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-background via-background to-accent/30">
      {/* Theme toggle — top right */}
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      <div className="mx-auto max-w-2xl px-4 py-12 sm:py-16">
        {/* Logo & Title */}
        <div className="mb-12 flex flex-col items-center gap-4 text-center">
          <Image
            src="/blossom-logo.png"
            alt="Blossom Pixel"
            width={80}
            height={80}
            className="rounded-2xl"
            priority
          />
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Blossom Pixel
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              ระบบออกเอกสาร — Document Generator
            </p>
          </div>
        </div>

        {/* === TIER 1: Customer Type === */}
        <section className="mb-2">
          <h2 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            ประเภทลูกค้า
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            <SelectionCard
              label="ลูกค้าบุคคลทั่วไป"
              icon={<Users className="h-7 w-7" />}
              selected={customerType === 'individual'}
              onClick={() => toggleCustomer('individual')}
            />
            <SelectionCard
              label="ลูกค้าบริษัท"
              icon={<Building2 className="h-7 w-7" />}
              selected={customerType === 'corporate'}
              onClick={() => toggleCustomer('corporate')}
            />
          </div>
        </section>

        {/* === TIER 2: Event Type (fades in when Tier 1 selected) === */}
        <section
          className={cn(
            'mb-2 transition-all duration-500 ease-out',
            customerType
              ? 'mt-8 max-h-75 opacity-100 translate-y-0'
              : 'mt-0 max-h-0 opacity-0 -translate-y-4 overflow-hidden pointer-events-none'
          )}
        >
          <h2 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            ประเภทงาน
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            <SelectionCard
              label="งานแต่งงาน"
              icon={<Heart className="h-7 w-7" />}
              selected={eventType === 'wedding'}
              onClick={() => toggleEvent('wedding')}
            />
            <SelectionCard
              label="งาน Event"
              icon={<PartyPopper className="h-7 w-7" />}
              selected={eventType === 'event'}
              onClick={() => toggleEvent('event')}
            />
            <SelectionCard
              label="งานอื่นๆ"
              icon={<Sparkles className="h-7 w-7" />}
              selected={eventType === 'others'}
              onClick={() => toggleEvent('others')}
            />
          </div>
        </section>

        {/* === TIER 3: Document Type (fades in when Tier 2 selected) === */}
        <section
          className={cn(
            'mb-2 transition-all duration-500 ease-out',
            eventType
              ? 'mt-8 max-h-75 opacity-100 translate-y-0'
              : 'mt-0 max-h-0 opacity-0 -translate-y-4 overflow-hidden pointer-events-none'
          )}
        >
          <h2 className="mb-4 text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            ประเภทเอกสาร
          </h2>
          <div className="flex flex-wrap justify-center gap-3">
            <SelectionCard
              label="ออกใบจอง"
              icon={<ClipboardList className="h-7 w-7" />}
              selected={documentType === 'booking'}
              onClick={() => toggleDocument('booking')}
            />
            <SelectionCard
              label="ออกใบเสนอราคา"
              icon={<FileText className="h-7 w-7" />}
              selected={documentType === 'quotation'}
              onClick={() => toggleDocument('quotation')}
            />
            <SelectionCard
              label="ออก Invoice"
              icon={<FileCheck className="h-7 w-7" />}
              selected={documentType === 'invoice'}
              onClick={() => toggleDocument('invoice')}
            />
            <SelectionCard
              label="ออกใบเสร็จรับเงิน"
              icon={<Receipt className="h-7 w-7" />}
              selected={documentType === 'receipt'}
              onClick={() => toggleDocument('receipt')}
            />
          </div>
        </section>

        {/* === Generate Button === */}
        <div
          className={cn(
            'mt-10 flex justify-center transition-all duration-500 ease-out',
            allSelected
              ? 'opacity-100 translate-y-0 scale-100'
              : 'opacity-0 translate-y-6 scale-95 pointer-events-none'
          )}
        >
          <Button
            size="lg"
            className="gap-2 px-8 py-6 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-shadow"
            onClick={() => router.push('/document')}
          >
            ออกเอกสาร
            <ArrowRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </main>
  );
}
