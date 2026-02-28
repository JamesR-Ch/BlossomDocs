'use client';

import { useRouter } from 'next/navigation';
import { useDocumentStore } from '@/store/document-store';
import { CommonInfoForm } from '@/components/forms/common-info-form';
import { ClientInfoForm } from '@/components/forms/client-info-form';
import { ServiceForm } from '@/components/forms/service-form';
import { ServicePicker } from '@/components/forms/service-picker';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Eye } from 'lucide-react';
import { formatCurrency, t } from '@/lib/i18n';
import { ThemeToggle } from '@/components/theme-toggle';

export default function DocumentPage() {
  const router = useRouter();
  const { customerType, eventType, documentType, services, hasBundleService, totalAmount, commonInfo } =
    useDocumentStore();

  // Redirect to home if selections are incomplete
  if (!customerType || !eventType || !documentType) {
    if (typeof window !== 'undefined') router.replace('/');
    return null;
  }

  const bundleActive = hasBundleService();
  const total = totalAmount();
  const remaining = total - commonInfo.deposit;

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-3xl px-4 py-8">
        {/* Top navigation */}
        <div className="mb-6 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="gap-1.5"
            onClick={() => router.push('/')}
          >
            <ArrowLeft className="h-4 w-4" />
            กลับ
          </Button>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">
              {t(customerType, 'th')} — {t(eventType, 'th')} — {t(documentType, 'th')}
            </span>
            <ThemeToggle />
          </div>
        </div>

        <div className="space-y-8">
          {/* Common Info */}
          <section className="rounded-xl border bg-card p-5 shadow-sm">
            <CommonInfoForm />
          </section>

          {/* Client Info */}
          <section className="rounded-xl border bg-card p-5 shadow-sm">
            <ClientInfoForm />
          </section>

          {/* Service Picker — always at the top, sticky for easy access */}
          <section className="rounded-xl border bg-card p-5 shadow-sm">
            <ServicePicker />
          </section>

          {/* Selected Services */}
          {services.length > 0 && (
            <section className="rounded-xl border bg-card p-5 shadow-sm space-y-5">
              <h3 className="text-base font-semibold border-b pb-2 border-border">
                บริการที่เลือก ({services.length})
              </h3>

              {/* Bundle warning banner */}
              {bundleActive && (
                <div className="rounded-md bg-primary/10 border border-primary/20 px-4 py-2.5 text-sm text-primary">
                  <strong>Bundle Service</strong> — ราคาของบริการอื่นจะถูกปิดใช้งาน ระบุราคารวมที่ Bundle เท่านั้น
                </div>
              )}

              {services.map((entry, idx) => (
                <ServiceForm
                  key={entry.id}
                  entry={entry}
                  index={idx}
                  bundleActive={bundleActive}
                />
              ))}
            </section>
          )}

          {/* Total Calculation */}
          <section className="rounded-xl border bg-card p-5 shadow-sm">
            <h3 className="text-base font-semibold border-b pb-2 border-border mb-4">
              สรุปยอดรวม
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">ค่าบริการรวม + ค่าเดินทาง</span>
                <span className="font-medium">{formatCurrency(total)} บาท</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">เงินมัดจำ</span>
                <span className="font-medium">-{formatCurrency(commonInfo.deposit)} บาท</span>
              </div>
              <Separator />
              <div className="flex justify-between text-base font-bold">
                <span>ยอดคงเหลือ</span>
                <span className="text-primary">{formatCurrency(remaining)} บาท</span>
              </div>
            </div>
          </section>

          {/* Preview button */}
          <div className="flex justify-center pb-8">
            <Button
              size="lg"
              className="gap-2 px-8 py-6 text-base font-semibold shadow-lg shadow-primary/20"
              onClick={() => router.push('/preview')}
            >
              <Eye className="h-5 w-5" />
              ดูตัวอย่างเอกสาร
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}
