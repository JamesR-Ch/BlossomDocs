'use client';

import { useDocumentStore } from '@/store/document-store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

export function CommonInfoForm() {
  const { commonInfo, updateCommonInfo } = useDocumentStore();

  return (
    <div className="space-y-5">
      <h3 className="text-base font-semibold border-b pb-2 border-border">
        ข้อมูลทั่วไป
      </h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Event Date */}
        <div className="space-y-1.5">
          <Label>วันที่จัดงาน</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-full justify-start text-left font-normal',
                  !commonInfo.eventDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {commonInfo.eventDate
                  ? format(commonInfo.eventDate, 'PPP', { locale: th })
                  : 'เลือกวันที่'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={commonInfo.eventDate ?? undefined}
                onSelect={(date) => updateCommonInfo({ eventDate: date ?? null })}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Guest Count */}
        <div className="space-y-1.5">
          <Label>จำนวนแขก</Label>
          <Input
            type="number"
            min={0}
            value={commonInfo.guestCount}
            onChange={(e) => updateCommonInfo({ guestCount: parseInt(e.target.value) || 0 })}
          />
        </div>

        {/* Location */}
        <div className="space-y-1.5 sm:col-span-2">
          <Label>สถานที่</Label>
          <Input
            value={commonInfo.location}
            onChange={(e) => updateCommonInfo({ location: e.target.value })}
            placeholder="ระบุสถานที่จัดงาน"
          />
        </div>

        {/* Travel Fee */}
        <div className="space-y-1.5">
          <Label>ค่าเดินทาง (บาท)</Label>
          <Input
            type="number"
            min={0}
            step={0.01}
            value={commonInfo.travelFee}
            onChange={(e) => updateCommonInfo({ travelFee: parseFloat(e.target.value) || 0 })}
          />
        </div>

        {/* Deposit */}
        <div className="space-y-1.5">
          <Label>เงินมัดจำ (บาท)</Label>
          <Input
            type="number"
            min={0}
            step={0.01}
            value={commonInfo.deposit}
            onChange={(e) => updateCommonInfo({ deposit: parseFloat(e.target.value) || 0 })}
          />
        </div>

        {/* Remarks */}
        <div className="space-y-1.5 sm:col-span-2">
          <Label>หมายเหตุ</Label>
          <Textarea
            value={commonInfo.remarks}
            onChange={(e) => updateCommonInfo({ remarks: e.target.value })}
            placeholder="หมายเหตุเพิ่มเติม (ถ้ามี)"
            rows={3}
          />
        </div>
      </div>
    </div>
  );
}
