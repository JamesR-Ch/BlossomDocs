'use client';

import { useDocumentStore } from '@/store/document-store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Trash2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PHOTO_SIZE_OPTIONS, SERVICE_LABELS } from '@/lib/constants';
import type {
  ServiceEntry,
  ServiceFields,
  PhotoboothFields,
  Video360Fields,
  StickerlineFields,
  AddOnFields,
  BundleFields,
  PhotoSize,
} from '@/lib/types';

function calcEndTime(startTime: string, hours: number, minutes: number): string {
  const [h, m] = startTime.split(':').map(Number);
  const totalMinutes = h * 60 + m + hours * 60 + minutes;
  const endH = Math.floor(totalMinutes / 60) % 24;
  const endM = totalMinutes % 60;
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;
}

interface ServiceFormProps {
  entry: ServiceEntry;
  index: number;
  bundleActive: boolean;
}

export function ServiceForm({ entry, index, bundleActive }: ServiceFormProps) {
  const { updateServiceFields, removeService } = useDocumentStore();
  const f = entry.fields;
  const isBundle = f.type === 'bundle';

  // Price fields are disabled when a bundle service exists (except for the bundle itself)
  const priceDisabled = bundleActive && !isBundle;

  function update(partial: Partial<ServiceFields>) {
    updateServiceFields(entry.id, partial);
  }

  return (
    <div
      className={cn(
        'relative rounded-lg border p-4 space-y-4 transition-all duration-300',
        isBundle
          ? 'border-primary/40 bg-primary/5'
          : priceDisabled
            ? 'border-border bg-muted/30'
            : 'border-border bg-card'
      )}
    >
      {/* Header: service label + delete button */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-primary">
          {SERVICE_LABELS[f.type].th} #{index + 1}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 text-destructive hover:text-destructive/80"
          onClick={() => removeService(entry.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Render fields based on service type */}
      {f.type === 'stickerline' ? (
        <StickerlineForm fields={f} update={update} priceDisabled={priceDisabled} />
      ) : f.type === 'addon' ? (
        <AddOnForm fields={f} update={update} entryId={entry.id} />
      ) : f.type === 'bundle' ? (
        <BundleForm fields={f} update={update} />
      ) : (
        <StandardServiceForm fields={f} update={update} priceDisabled={priceDisabled} />
      )}
    </div>
  );
}

// =============================================================================
// Standard service form (Photobooth, 360 Video, Blessing, Sign Me)
// =============================================================================
function StandardServiceForm({
  fields: f,
  update,
  priceDisabled,
}: {
  fields: Exclude<ServiceFields, StickerlineFields | AddOnFields | BundleFields>;
  update: (p: Partial<ServiceFields>) => void;
  priceDisabled: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {/* Service Name */}
      <div className="space-y-1 sm:col-span-2">
        <Label className="text-xs">ชื่อบริการ</Label>
        <Input
          value={f.serviceName}
          onChange={(e) => update({ serviceName: e.target.value })}
        />
      </div>

      {/* Duration: hours + minutes */}
      <div className="space-y-1">
        <Label className="text-xs">จำนวนชั่วโมง</Label>
        <div className="flex items-center gap-2">
          <Input
            type="number"
            min={0}
            value={f.hours === 0 ? '' : f.hours}
            onChange={(e) => {
              const hours = parseInt(e.target.value) || 0;
              update({ hours, endTime: calcEndTime(f.startTime, hours, f.minutes) });
            }}
            placeholder="0"
            className="w-20"
          />
          <span className="text-xs text-muted-foreground">ชม.</span>
          <Input
            type="number"
            min={0}
            max={59}
            value={f.minutes === 0 ? '' : f.minutes}
            onChange={(e) => {
              const minutes = parseInt(e.target.value) || 0;
              update({ minutes, endTime: calcEndTime(f.startTime, f.hours, minutes) });
            }}
            placeholder="0"
            className="w-20"
          />
          <span className="text-xs text-muted-foreground">นาที</span>
        </div>
      </div>

      {/* Setup Point */}
      <div className="space-y-1">
        <Label className="text-xs">จุดตั้ง</Label>
        <Select
          value={f.setupPoint}
          onValueChange={(v) => update({ setupPoint: v })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Indoor">Indoor</SelectItem>
            <SelectItem value="Outdoor">Outdoor</SelectItem>
            <SelectItem value="Open-air">Open-air</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Start Time */}
      <div className="space-y-1">
        <Label className="text-xs">เวลาเริ่ม</Label>
        <Input
          type="time"
          value={f.startTime}
          onChange={(e) => {
            const startTime = e.target.value;
            update({ startTime, endTime: calcEndTime(startTime, f.hours, f.minutes) });
          }}
        />
      </div>

      {/* End Time */}
      <div className="space-y-1">
        <Label className="text-xs">ถึงเวลา</Label>
        <Input
          type="time"
          value={f.endTime}
          onChange={(e) => update({ endTime: e.target.value })}
        />
      </div>

      {/* Price */}
      <div className="space-y-1">
        <Label className="text-xs">ราคา (บาท)</Label>
        <Input
          type="number"
          min={0}
          step={0.01}
          value={priceDisabled ? '' : (f.price === 0 ? '' : f.price)}
          onChange={(e) => update({ price: parseFloat(e.target.value) || 0 })}
          disabled={priceDisabled}
          className={cn(priceDisabled && 'bg-muted text-muted-foreground')}
          placeholder={priceDisabled ? 'ราคารวมใน Bundle' : '0'}
        />
      </div>

      {/* Extra Notes */}
      <div className="space-y-1">
        <Label className="text-xs">Note เพิ่มเติม</Label>
        <Input
          value={f.extraNotes}
          onChange={(e) => update({ extraNotes: e.target.value })}
          placeholder="หมายเหตุ"
        />
      </div>

      {/* === Type-specific fields === */}
      {f.type === 'photobooth' && (
        <PhotoboothExtra fields={f} update={update} />
      )}
      {f.type === '360video' && (
        <div className="space-y-1">
          <Label className="text-xs">Package type</Label>
          <Input
            value={(f as Video360Fields).packageType}
            onChange={(e) => update({ packageType: e.target.value })}
          />
        </div>
      )}
    </div>
  );
}

// Photobooth-specific: Photo Size dropdown
function PhotoboothExtra({
  fields,
  update,
}: {
  fields: PhotoboothFields;
  update: (p: Partial<ServiceFields>) => void;
}) {
  return (
    <>
      <div className="space-y-1">
        <Label className="text-xs">ขนาดรูป</Label>
        <Select
          value={fields.photoSize}
          onValueChange={(v) => update({ photoSize: v as PhotoSize })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {PHOTO_SIZE_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.th}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      {fields.photoSize === 'custom' && (
        <div className="space-y-1">
          <Label className="text-xs">ขนาดรูปกำหนดเอง</Label>
          <Input
            value={fields.customPhotoSize}
            onChange={(e) => update({ customPhotoSize: e.target.value })}
            placeholder="ระบุขนาด"
          />
        </div>
      )}
    </>
  );
}

// =============================================================================
// Stickerline form
// =============================================================================
function StickerlineForm({
  fields: f,
  update,
  priceDisabled,
}: {
  fields: StickerlineFields;
  update: (p: Partial<ServiceFields>) => void;
  priceDisabled: boolean;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="space-y-1 sm:col-span-2">
        <Label className="text-xs">ชื่อบริการ</Label>
        <Input
          value={f.serviceName}
          onChange={(e) => update({ serviceName: e.target.value })}
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">จำนวนสติ๊กเกอร์</Label>
        <Input
          type="number"
          min={0}
          value={f.stickerCount}
          onChange={(e) => update({ stickerCount: parseInt(e.target.value) || 0 })}
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">ราคา (บาท)</Label>
        <Input
          type="number"
          min={0}
          step={0.01}
          value={priceDisabled ? '' : (f.price === 0 ? '' : f.price)}
          onChange={(e) => update({ price: parseFloat(e.target.value) || 0 })}
          disabled={priceDisabled}
          className={cn(priceDisabled && 'bg-muted text-muted-foreground')}
          placeholder={priceDisabled ? 'ราคารวมใน Bundle' : '0'}
        />
      </div>
      <div className="space-y-1 sm:col-span-2">
        <Label className="text-xs">Note เพิ่มเติม</Label>
        <Input
          value={f.extraNotes}
          onChange={(e) => update({ extraNotes: e.target.value })}
          placeholder="หมายเหตุ"
        />
      </div>
    </div>
  );
}

// =============================================================================
// Add-on form (multiple line items)
// =============================================================================
function AddOnForm({
  fields: f,
  update,
  entryId,
}: {
  fields: AddOnFields;
  update: (p: Partial<ServiceFields>) => void;
  entryId: string;
}) {
  const { updateServiceFields } = useDocumentStore();

  function addItem() {
    const newItems = [...f.items, { name: '', price: 500.0 }];
    updateServiceFields(entryId, { items: newItems });
  }

  function removeItem(idx: number) {
    const newItems = f.items.filter((_, i) => i !== idx);
    if (newItems.length === 0) return; // keep at least one
    updateServiceFields(entryId, { items: newItems });
  }

  function updateItem(idx: number, partial: Partial<{ name: string; price: number }>) {
    const newItems = f.items.map((item, i) =>
      i === idx ? { ...item, ...partial } : item
    );
    updateServiceFields(entryId, { items: newItems });
  }

  return (
    <div className="space-y-3">
      <div className="space-y-1">
        <Label className="text-xs">ชื่อบริการ</Label>
        <Input
          value={f.serviceName}
          onChange={(e) => update({ serviceName: e.target.value })}
        />
      </div>

      {f.items.map((item, idx) => (
        <div key={idx} className="flex items-end gap-2">
          <div className="flex-1 space-y-1">
            <Label className="text-xs">Add-on ({idx + 1})</Label>
            <Input
              value={item.name}
              onChange={(e) => updateItem(idx, { name: e.target.value })}
              placeholder="ชื่อ Add-on"
            />
          </div>
          <div className="w-32 space-y-1">
            <Label className="text-xs">ราคา</Label>
            <Input
              type="number"
              min={0}
              step={0.01}
              value={item.price === 0 ? '' : item.price}
              onChange={(e) => updateItem(idx, { price: parseFloat(e.target.value) || 0 })}
              placeholder="0"
            />
          </div>
          {f.items.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 text-destructive"
              onClick={() => removeItem(idx)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      ))}

      <Button
        variant="outline"
        size="sm"
        className="gap-1"
        onClick={addItem}
      >
        <Plus className="h-3.5 w-3.5" />
        เพิ่ม Add-on
      </Button>
    </div>
  );
}

// =============================================================================
// Bundle Service form
// =============================================================================
function BundleForm({
  fields: f,
  update,
}: {
  fields: BundleFields;
  update: (p: Partial<ServiceFields>) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <div className="space-y-1 sm:col-span-2">
        <Label className="text-xs">ชื่อบริการ</Label>
        <Input
          value={f.serviceName}
          onChange={(e) => update({ serviceName: e.target.value })}
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs font-semibold text-primary">ราคารวม Bundle (บาท)</Label>
        <Input
          type="number"
          min={0}
          step={0.01}
          value={f.price === 0 ? '' : f.price}
          onChange={(e) => update({ price: parseFloat(e.target.value) || 0 })}
          className="border-primary/40 focus-visible:ring-primary"
          placeholder="0"
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Note เพิ่มเติม</Label>
        <Input
          value={f.extraNotes}
          onChange={(e) => update({ extraNotes: e.target.value })}
          placeholder="หมายเหตุ"
        />
      </div>
    </div>
  );
}
