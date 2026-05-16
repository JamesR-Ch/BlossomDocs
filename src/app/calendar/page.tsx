'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import { CalendarIcon, MapPin, Clock, User, FileText, Loader2, CalendarDays } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { CalendarEvent } from '@/app/api/calendar/route';

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [events, setEvents] = useState<CalendarEvent[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queriedDate, setQueriedDate] = useState<Date | null>(null);

  async function handleCheck() {
    if (!selectedDate) return;
    setLoading(true);
    setError(null);
    setEvents(null);
    setQueriedDate(selectedDate);

    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const res = await fetch(`/api/calendar?date=${dateStr}`);
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error ?? `HTTP ${res.status}`);
        return;
      }
      setEvents(data.events ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ไม่สามารถดึงข้อมูลได้');
    } finally {
      setLoading(false);
    }
  }

  const exactEvents = events?.filter((e) => !e.isTextDate) ?? [];
  const textEvents = events?.filter((e) => e.isTextDate) ?? [];

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">ปฏิทินงาน</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            เลือกวันที่เพื่อตรวจสอบงานจาก Google Sheet
          </p>
        </div>

        {/* Date picker + check button */}
        <div className="flex flex-wrap items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  'w-56 justify-start text-left font-normal',
                  !selectedDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, 'PPP', { locale: th }) : 'เลือกวันที่'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                captionLayout="dropdown"
                fromYear={2024}
                toYear={2030}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <Button onClick={handleCheck} disabled={!selectedDate || loading} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarDays className="h-4 w-4" />}
            ตรวจสอบ
          </Button>
        </div>

        {/* Results */}
        <div className="mt-8 space-y-6">
          {error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {events !== null && !loading && (
            <>
              <section className="space-y-3">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  งานในวันที่ {queriedDate ? format(queriedDate, 'PPP', { locale: th }) : ''}{exactEvents.length > 0 ? ` (${exactEvents.length})` : ''}
                </h2>
                {exactEvents.length > 0 ? (
                  exactEvents.map((ev, i) => <EventCard key={i} event={ev} />)
                ) : (
                  <p className="text-sm text-muted-foreground py-2">ไม่มีงานในวันนี้</p>
                )}
              </section>

              {textEvents.length > 0 && (
                <section>
                  <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    งานที่ยังไม่ระบุวันแน่ชัด ({textEvents.length})
                  </h2>
                  <div className="rounded-lg border divide-y overflow-hidden">
                    {textEvents.map((ev, i) => (
                      <div key={i} className="flex items-center gap-3 px-4 py-2.5 text-sm bg-card">
                        <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground font-medium">
                          {ev.date}
                        </span>
                        <span className="font-medium truncate">{ev.name}</span>
                        {ev.team && (
                          <span className="shrink-0 text-xs text-muted-foreground">{ev.team}</span>
                        )}
                        {ev.location && (
                          <span className="ml-auto shrink-0 text-xs text-muted-foreground">{ev.location}</span>
                        )}
                      </div>
                    ))}
                  </div>
                </section>
              )}

            </>
          )}
        </div>
      </div>
    </main>
  );
}

function EventCard({ event }: { event: CalendarEvent }) {
  return (
    <div className="rounded-xl border bg-card p-4 shadow-sm space-y-3">
      {event.isTextDate && (
        <Badge variant="secondary" className="text-[10px]">{event.date}</Badge>
      )}
      <div className="space-y-1.5 text-sm">
        {event.name && (
          <Row icon={<User className="h-3.5 w-3.5" />}>
            <span className="font-medium">{event.name}</span>
            {event.team && <span className="ml-2 text-xs text-muted-foreground">{event.team}</span>}
          </Row>
        )}
        {event.time && (
          <Row icon={<Clock className="h-3.5 w-3.5" />}>{event.time}</Row>
        )}
        {event.location && (
          <Row icon={<MapPin className="h-3.5 w-3.5" />}>{event.location}</Row>
        )}
        {event.note && (
          <Row icon={<FileText className="h-3.5 w-3.5" />}>
            <span className="text-muted-foreground">{event.note}</span>
          </Row>
        )}
      </div>
    </div>
  );
}

function Row({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2">
      <span className="mt-0.5 shrink-0 text-muted-foreground">{icon}</span>
      <span>{children}</span>
    </div>
  );
}
