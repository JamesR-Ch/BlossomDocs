'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Download, Copy, Check, X, Filter } from 'lucide-react';
import * as XLSX from 'xlsx';
import type { OomEvent } from '@/app/api/oom/route';

// ─── Column definitions ────────────────────────────────────────────────────

const COLUMNS: { key: keyof OomEvent; label: string }[] = [
  { key: 'team',       label: 'Team'     },
  { key: 'date',       label: 'วันที่'   },
  { key: 'time',       label: 'เวลา'     },
  { key: 'size',       label: 'ขนาด'     },
  { key: 'bundle',     label: 'Bundle'   },
  { key: 'setup',      label: 'จุดตั้ง'  },
  { key: 'background', label: 'พื้นพลัง' },
  { key: 'process',    label: 'Process'  },
];

// ─── Types ─────────────────────────────────────────────────────────────────

type DateMode = 'date' | 'month' | 'year';

const DATE_MODE_LABELS: { mode: DateMode; label: string }[] = [
  { mode: 'date',  label: 'วันที่' },
  { mode: 'month', label: 'เดือน' },
  { mode: 'year',  label: 'ปี'    },
];

const THAI_MONTHS = [
  'มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน',
  'กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม',
];

// ─── Helpers ───────────────────────────────────────────────────────────────

function parseDate(raw: string): Date | null {
  const parts = raw.trim().split('/');
  if (parts.length !== 3) return null;
  const nums = parts.map(Number);
  if (nums.some(isNaN)) return null;
  const [d, m, y] = nums;
  const year = y < 100 ? 2000 + y : y;
  if (m < 1 || m > 12 || d < 1 || d > 31) return null;
  return new Date(year, m - 1, d);
}

// ─── Filter option builders ────────────────────────────────────────────────

function getDateOptions(events: OomEvent[], mode: DateMode): { value: string; label: string }[] {
  const seen = new Set<string>();
  const options: { value: string; label: string; sortKey: number }[] = [];

  for (const ev of events) {
    if (ev.isTextDate) continue;
    const d = parseDate(ev.date);
    if (!d) continue;

    let value: string;
    let label: string;
    let sortKey: number;

    if (mode === 'year') {
      value   = String(d.getFullYear());
      label   = String(d.getFullYear());
      sortKey = d.getFullYear();
    } else if (mode === 'month') {
      value   = String(d.getMonth());                 // 0-based index
      label   = `${THAI_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
      sortKey = d.getFullYear() * 100 + d.getMonth();
    } else {
      value   = ev.date;
      label   = ev.date;
      sortKey = d.getTime();
    }

    if (!seen.has(value)) {
      seen.add(value);
      options.push({ value, label, sortKey });
    }
  }

  return options.sort((a, b) => a.sortKey - b.sortKey).map(({ value, label }) => ({ value, label }));
}

function getColumnOptions(events: OomEvent[], col: keyof OomEvent): string[] {
  const seen = new Set<string>();
  for (const ev of events) {
    const v = ((ev[col] as string) ?? '').trim();
    if (v) seen.add(v);
  }
  return [...seen].sort();
}

// ─── Filter logic ──────────────────────────────────────────────────────────

function applyFilters(
  events:    OomEvent[],
  colFilters: Record<string, string>,
  dateMode:  DateMode,
): OomEvent[] {
  return events.filter((ev) => {
    for (const col of COLUMNS) {
      const filterVal = colFilters[col.key];
      if (!filterVal) continue; // no filter on this column

      if (col.key === 'date') {
        if (ev.isTextDate) continue; // text dates always pass date filter
        const d = parseDate(ev.date);
        if (!d) return false;
        if (dateMode === 'year'  && String(d.getFullYear()) !== filterVal) return false;
        if (dateMode === 'month' && String(d.getMonth())    !== filterVal) return false;
        if (dateMode === 'date'  && ev.date                 !== filterVal) return false;
      } else {
        const cellVal = ((ev[col.key] as string) ?? '').trim();
        if (cellVal !== filterVal) return false;
      }
    }
    return true;
  });
}

// ─── Export helpers ────────────────────────────────────────────────────────

function eventsToRows(events: OomEvent[]) {
  return events.map((ev) => COLUMNS.map((col) => (ev[col.key] as string) ?? ''));
}

function exportXlsx(events: OomEvent[]) {
  const headers = COLUMNS.map((c) => c.label);
  const rows    = eventsToRows(events);

  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);

  ws['!cols'] = COLUMNS.map((col) => {
    const maxLen = Math.max(
      col.label.length * 2,
      ...events.map((ev) => ((ev[col.key] as string) ?? '').length),
    );
    return { wch: Math.min(Math.max(maxLen, 8), 40) };
  });

  // Freeze header row
  ws['!freeze'] = { xSplit: 0, ySplit: 1 };

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'งานอุ๋ม');
  XLSX.writeFile(wb, 'งานอุ๋ม.xlsx');
}

function buildTsv(events: OomEvent[]): string {
  const headers = COLUMNS.map((c) => c.label).join('\t');
  const rows    = eventsToRows(events).map((row) =>
    row.map((cell) => cell.replace(/\t/g, ' ').replace(/\n/g, ' ')).join('\t'),
  );
  return [headers, ...rows].join('\n');
}

// ─── Component ─────────────────────────────────────────────────────────────

export default function OomPage() {
  const [events,     setEvents]     = useState<OomEvent[] | null>(null);
  const [error,      setError]      = useState<string | null>(null);
  const [copied,     setCopied]     = useState(false);
  const [colFilters, setColFilters] = useState<Record<string, string>>({});
  const [dateMode,   setDateMode]   = useState<DateMode>('date');

  useEffect(() => {
    fetch('/api/oom')
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setEvents(data.events ?? []);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'ไม่สามารถดึงข้อมูลได้'));
  }, []);

  const filtered = useMemo(
    () => (events ? applyFilters(events, colFilters, dateMode) : []),
    [events, colFilters, dateMode],
  );

  const activeFilterCount = Object.values(colFilters).filter(Boolean).length;

  function setFilter(col: string, value: string) {
    setColFilters((prev) => ({ ...prev, [col]: value }));
  }

  function clearFilters() {
    setColFilters({});
  }

  function handleDateModeChange(mode: DateMode) {
    setDateMode(mode);
    setFilter('date', ''); // reset date filter when mode changes
  }

  const handleCopy = useCallback(async () => {
    if (!events) return;
    await navigator.clipboard.writeText(buildTsv(filtered));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [events, filtered]);

  // Precompute options
  const dateOptions   = useMemo(() => events ? getDateOptions(events, dateMode)                 : [], [events, dateMode]);
  const columnOptions = useMemo(() => {
    const map: Partial<Record<keyof OomEvent, string[]>> = {};
    if (!events) return map;
    for (const col of COLUMNS) {
      if (col.key !== 'date') map[col.key] = getColumnOptions(events, col.key);
    }
    return map;
  }, [events]);

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-10">

        {/* Page header */}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">งานอุ๋ม</h1>
            <p className="mt-1 text-sm text-muted-foreground">ตั้งแต่เดือนเมษายน 2026 เป็นต้นไป</p>
          </div>
          {events && (
            <div className="flex items-center gap-2">
              {activeFilterCount > 0 && (
                <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground" onClick={clearFilters}>
                  <X className="h-3.5 w-3.5" />
                  ล้างตัวกรอง ({activeFilterCount})
                </Button>
              )}
              <Button variant="outline" size="sm" className="gap-1.5" onClick={handleCopy}>
                {copied
                  ? <><Check className="h-4 w-4 text-green-500" />Copied!</>
                  : <><Copy  className="h-4 w-4" />Copy</>}
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5" onClick={() => exportXlsx(filtered)}>
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          )}
        </div>

        {/* Status */}
        {!events && !error && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            กำลังโหลดข้อมูล...
          </div>
        )}
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* Table */}
        {events && (
          <>
            <div className="overflow-x-auto rounded-xl border shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  {/* Column labels */}
                  <tr className="border-b bg-muted/50">
                    {COLUMNS.map((col) => (
                      <th key={col.key} className="px-3 py-3 text-left font-semibold text-muted-foreground whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          {col.key === 'date' && colFilters['date'] && (
                            <Filter className="h-3 w-3 text-primary" />
                          )}
                          {col.key !== 'date' && colFilters[col.key] && (
                            <Filter className="h-3 w-3 text-primary" />
                          )}
                          {col.label}
                        </div>
                      </th>
                    ))}
                  </tr>

                  {/* Filter row */}
                  <tr className="border-b bg-background">
                    {COLUMNS.map((col) => (
                      <td key={col.key} className="px-2 py-2">
                        {col.key === 'date' ? (
                          <div className="flex flex-col gap-1.5 min-w-35">
                            {/* Date mode toggle */}
                            <div className="flex rounded-md border overflow-hidden text-[11px] font-medium">
                              {DATE_MODE_LABELS.map(({ mode, label }) => (
                                <button
                                  key={mode}
                                  onClick={() => handleDateModeChange(mode)}
                                  className={`flex-1 py-0.5 transition-colors ${
                                    dateMode === mode
                                      ? 'bg-primary text-primary-foreground'
                                      : 'text-muted-foreground hover:bg-accent'
                                  }`}
                                >
                                  {label}
                                </button>
                              ))}
                            </div>
                            {/* Date value dropdown */}
                            <select
                              value={colFilters['date'] ?? ''}
                              onChange={(e) => setFilter('date', e.target.value)}
                              className="w-full rounded-md border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            >
                              <option value="">ทั้งหมด</option>
                              {dateOptions.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          </div>
                        ) : (
                          <select
                            value={colFilters[col.key] ?? ''}
                            onChange={(e) => setFilter(col.key, e.target.value)}
                            className="w-full min-w-22.5 rounded-md border bg-background px-2 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                          >
                            <option value="">ทั้งหมด</option>
                            {(columnOptions[col.key] ?? []).map((v) => (
                              <option key={v} value={v}>{v || '(ว่าง)'}</option>
                            ))}
                          </select>
                        )}
                      </td>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={COLUMNS.length} className="px-4 py-10 text-center text-muted-foreground">
                        ไม่มีข้อมูลที่ตรงกับตัวกรอง
                      </td>
                    </tr>
                  ) : (
                    filtered.map((ev, i) => (
                      <tr
                        key={i}
                        className={
                          ev.isTextDate
                            ? 'bg-muted/30 text-muted-foreground italic'
                            : 'bg-card hover:bg-accent/40 transition-colors'
                        }
                      >
                        {COLUMNS.map((col) => (
                          <td key={col.key} className="whitespace-nowrap px-3 py-2.5">
                            {col.key === 'date' && ev.isTextDate ? (
                              <Badge variant="secondary" className="text-[10px] font-normal not-italic">
                                {ev.date}
                              </Badge>
                            ) : (
                              (ev[col.key] as string) || (
                                <span className="text-muted-foreground/30 not-italic">—</span>
                              )
                            )}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Row count + legend */}
            <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                แสดง {filtered.length} จาก {events.length} รายการ
              </span>
              {events.some((e) => e.isTextDate) && (
                <span>* แถวตัวเอียง = ยังไม่ระบุวันแน่ชัด</span>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
