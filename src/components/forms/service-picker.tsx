'use client';

import { useDocumentStore } from '@/store/document-store';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { SERVICE_LABELS } from '@/lib/constants';
import type { ServiceType } from '@/lib/types';
import { cn } from '@/lib/utils';

const SERVICE_TYPES: ServiceType[] = [
  'photobooth', '360video', 'blessing', 'stickerline', 'signme', 'addon', 'bundle',
];

export function ServicePicker() {
  const { addService, services } = useDocumentStore();

  // Count how many instances of each service type exist
  const counts = new Map<ServiceType, number>();
  for (const svc of services) {
    const type = svc.fields.type as ServiceType;
    counts.set(type, (counts.get(type) || 0) + 1);
  }

  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold border-b pb-2 border-border">
        เพิ่มบริการ
      </h3>
      <div className="flex flex-wrap gap-2">
        {SERVICE_TYPES.map((type) => {
          const count = counts.get(type) || 0;
          return (
            <Button
              key={type}
              variant="outline"
              size="sm"
              className={cn(
                'relative gap-1.5 text-xs transition-all',
                count > 0 && 'border-primary/50 bg-primary/5 text-primary'
              )}
              onClick={() => addService(type)}
            >
              <Plus className="h-3.5 w-3.5" />
              {SERVICE_LABELS[type].th}

              {/* Count badge */}
              {count > 0 && (
                <span className="ml-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground px-1">
                  {count}
                </span>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
