'use client';

import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Loader2, Download, Copy, Check, X, ChevronDown, Filter,
  Pin, PinOff, EyeOff, Eye,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import type { OomEvent } from '@/app/api/oom/route';

// ─── Types ─────────────────────────────────────────────────────────────────

type OomRow   = OomEvent & { _id: number };
type DateMode = 'date' | 'month' | 'year';

// ─── Column definitions ────────────────────────────────────────────────────
// cellClass controls visibility per breakpoint:
//   default (iPhone ≤ 639px) → 3 cols visible
//   sm  640px+ (small tablet) → +2 cols
//   lg 1024px+ (iPad Pro 12.9" portrait & Full HD) → all cols

const COLUMNS: { key: keyof OomEvent; label: string; cellClass: string }[] = [
  { key: 'team',       label: 'Team',     cellClass: '' },
  { key: 'date',       label: 'วันที่',   cellClass: '' },
  { key: 'time',       label: 'เวลา',     cellClass: '' },
  { key: 'size',       label: 'ขนาด',     cellClass: '' },
  { key: 'bundle',     label: 'Bundle',   cellClass: '' },
  { key: 'setup',      label: 'จุดตั้ง',  cellClass: '' },
  { key: 'background', label: 'พื้นหลัง', cellClass: '' },
  { key: 'process',    label: 'Process',  cellClass: '' },
];

const COL_SPAN = COLUMNS.length + 2; // +checkbox +actions

// ─── Constants ─────────────────────────────────────────────────────────────

const DATE_MODES: { mode: DateMode; label: string }[] = [
  { mode: 'date',  label: 'วันที่' },
  { mode: 'month', label: 'เดือน' },
  { mode: 'year',  label: 'ปี'    },
];

const THAI_MONTHS = [
  'มกราคม','กุมภาพันธ์','มีนาคม','เมษายน','พฤษภาคม','มิถุนายน',
  'กรกฎาคม','สิงหาคม','กันยายน','ตุลาคม','พฤศจิกายน','ธันวาคม',
];

// ─── Date helpers ───────────────────────────────────────────────────────────

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

function getDateOptions(rows: OomRow[], mode: DateMode): { value: string; label: string }[] {
  const seen = new Set<string>();
  const opts: { value: string; label: string; sortKey: number }[] = [];
  for (const ev of rows) {
    if (ev.isTextDate) continue;
    const d = parseDate(ev.date);
    if (!d) continue;
    let value: string, label: string, sortKey: number;
    if (mode === 'year') {
      value = label = String(d.getFullYear()); sortKey = d.getFullYear();
    } else if (mode === 'month') {
      value = String(d.getMonth());
      label = `${THAI_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
      sortKey = d.getFullYear() * 100 + d.getMonth();
    } else {
      value = label = ev.date; sortKey = d.getTime();
    }
    if (!seen.has(value)) { seen.add(value); opts.push({ value, label, sortKey }); }
  }
  return opts.sort((a, b) => a.sortKey - b.sortKey).map(({ value, label }) => ({ value, label }));
}

function getColumnOptions(rows: OomRow[], col: keyof OomEvent): string[] {
  const seen = new Set<string>();
  for (const ev of rows) {
    const v = ((ev[col] as string) ?? '').trim();
    if (v) seen.add(v);
  }
  return [...seen].sort();
}

// ─── Filter logic ──────────────────────────────────────────────────────────

function applyFilters(rows: OomRow[], colFilters: Record<string, string[]>, dateMode: DateMode): OomRow[] {
  return rows.filter((ev) => {
    for (const col of COLUMNS) {
      const selected = colFilters[col.key];
      if (!selected || selected.length === 0) continue;
      if (col.key === 'date') {
        if (ev.isTextDate) continue;
        const d = parseDate(ev.date);
        if (!d) return false;
        const val = dateMode === 'year' ? String(d.getFullYear()) : dateMode === 'month' ? String(d.getMonth()) : ev.date;
        if (!selected.includes(val)) return false;
      } else {
        const cell = ((ev[col.key] as string) ?? '').trim();
        if (!selected.includes(cell)) return false;
      }
    }
    return true;
  });
}

// ─── Export helpers ────────────────────────────────────────────────────────

function rowsToArrays(rows: OomRow[]) {
  return rows.map((ev) => COLUMNS.map((col) => (ev[col.key] as string) ?? ''));
}

function exportXlsx(rows: OomRow[]) {
  const ws = XLSX.utils.aoa_to_sheet([COLUMNS.map((c) => c.label), ...rowsToArrays(rows)]);
  ws['!cols'] = COLUMNS.map((col) => ({
    wch: Math.min(Math.max(col.label.length * 2, ...rows.map((ev) => ((ev[col.key] as string) ?? '').length), 8), 40),
  }));
  ws['!freeze'] = { xSplit: 0, ySplit: 1 };
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'งานอุ๋ม');
  XLSX.writeFile(wb, 'งานอุ๋ม.xlsx');
}

function buildTsv(rows: OomRow[]): string {
  const headers = COLUMNS.map((c) => c.label).join('\t');
  const body    = rowsToArrays(rows).map((r) => r.map((c) => c.replace(/\t/g, ' ').replace(/\n/g, ' ')).join('\t'));
  return [headers, ...body].join('\n');
}

// ─── Sub-components ────────────────────────────────────────────────────────

function RowCheckbox({ checked, indeterminate }: { checked: boolean; indeterminate?: boolean }) {
  return (
    <div className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border-2 transition-all ${
      checked || indeterminate ? 'border-primary bg-primary' : 'border-border bg-background'
    }`}>
      {indeterminate
        ? <span className="block h-0.5 w-2 rounded-full bg-primary-foreground" />
        : checked && <Check className="h-2.5 w-2.5 text-primary-foreground stroke-3" />}
    </div>
  );
}

interface FilterPillProps {
  label: string; selected: string[]; options: { value: string; label: string }[];
  onChange: (v: string[]) => void; onClear: () => void;
  isDate?: boolean; dateMode?: DateMode; onDateModeChange?: (m: DateMode) => void;
}

function FilterPill({ label, selected, options, onChange, onClear, isDate, dateMode, onDateModeChange }: FilterPillProps) {
  const [search, setSearch] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const active  = selected.length > 0;
  const visible = options.filter((o) => o.label.toLowerCase().includes(search.toLowerCase()));

  function toggle(value: string) {
    onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
  }

  return (
    <Popover onOpenChange={(open) => { if (open) setTimeout(() => searchRef.current?.focus(), 50); }}>
      <PopoverTrigger asChild>
        <button className={`inline-flex shrink-0 items-center gap-1 sm:gap-1.5 rounded-full border px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs sm:text-sm font-medium transition-all outline-none ${
          active ? 'border-primary bg-primary/10 text-primary shadow-sm' : 'border-border bg-background text-muted-foreground hover:border-foreground/30 hover:text-foreground'
        }`}>
          <Filter className="h-3 w-3" />
          {label}
          {active && <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">{selected.length}</span>}
          <ChevronDown className="h-3 w-3 opacity-50" />
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-60 sm:w-64 p-0 shadow-lg">
        {isDate && dateMode && onDateModeChange && (
          <div className="border-b p-2">
            <div className="flex rounded-lg border overflow-hidden text-xs font-medium">
              {DATE_MODES.map(({ mode, label: ml }) => (
                <button key={mode} onClick={() => { onDateModeChange(mode); onChange([]); }}
                  className={`flex-1 py-1.5 transition-colors ${dateMode === mode ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'}`}>{ml}</button>
              ))}
            </div>
          </div>
        )}
        {options.length > 6 && (
          <div className="border-b px-3 py-2">
            <input ref={searchRef} value={search} onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหา..." className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground" />
          </div>
        )}
        <div className="flex items-center justify-between border-b px-3 py-1.5">
          <button onClick={() => onChange(selected.length === options.length ? [] : options.map((o) => o.value))}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            {selected.length === options.length ? 'ยกเลิกทั้งหมด' : 'เลือกทั้งหมด'}
          </button>
          {active && (
            <button onClick={onClear} className="flex items-center gap-0.5 text-xs text-destructive/70 hover:text-destructive transition-colors">
              <X className="h-3 w-3" />ล้าง
            </button>
          )}
        </div>
        <div className="max-h-56 overflow-y-auto py-1">
          {visible.length === 0
            ? <p className="px-3 py-4 text-center text-xs text-muted-foreground">ไม่พบตัวเลือก</p>
            : visible.map((opt) => (
              <button key={opt.value} onClick={() => toggle(opt.value)}
                className="flex w-full items-center gap-2.5 px-3 py-2 text-sm hover:bg-accent transition-colors text-left">
                <RowCheckbox checked={selected.includes(opt.value)} />
                <span className="truncate">{opt.label}</span>
              </button>
            ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

// ─── Row component ─────────────────────────────────────────────────────────

interface TableRowProps {
  ev: OomRow; isFrozen: boolean; isSelected: boolean;
  onSelect: () => void; onFreeze: () => void; onHide: () => void;
}

function OomTableRow({ ev, isFrozen, isSelected, onSelect, onFreeze, onHide }: TableRowProps) {
  return (
    <tr onClick={onSelect} className={`group cursor-pointer transition-colors ${
      isSelected
        ? 'bg-primary/8 hover:bg-primary/12'
        : isFrozen
        ? 'bg-amber-50/40 dark:bg-amber-950/20 hover:bg-amber-50/70 dark:hover:bg-amber-950/30'
        : ev.isTextDate
        ? 'bg-muted/30 italic text-muted-foreground hover:bg-muted/50'
        : 'bg-card hover:bg-accent/40'
    }`}>
      {/* Checkbox */}
      <td className="w-7 sm:w-8 px-1.5 sm:px-2 py-2 sm:py-2.5">
        <div className={`transition-opacity ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
          <RowCheckbox checked={isSelected} />
        </div>
      </td>

      {/* Data cells — use each column's cellClass for responsive visibility */}
      {COLUMNS.map((col) => (
        <td key={col.key} className={`${col.cellClass} whitespace-nowrap px-2 py-2 text-xs sm:px-3 sm:py-2.5 sm:text-sm`}>
          {col.key === 'date' && ev.isTextDate ? (
            <Badge variant="secondary" className="text-[10px] font-normal not-italic">{ev.date}</Badge>
          ) : (
            (ev[col.key] as string) || <span className="text-muted-foreground/30 not-italic">—</span>
          )}
        </td>
      ))}

      {/* Action buttons */}
      <td className="w-12 sm:w-16 px-1 sm:px-2 py-2 sm:py-2.5" onClick={(e) => e.stopPropagation()}>
        <div className="invisible flex items-center justify-end gap-0.5 sm:gap-1 group-hover:visible">
          <button title={isFrozen ? 'เลิกปักหมุด' : 'ปักหมุด'} onClick={onFreeze}
            className={`rounded p-1 sm:p-1 transition-colors hover:bg-accent ${isFrozen ? 'text-amber-500' : 'text-muted-foreground'}`}>
            {isFrozen ? <PinOff className="h-3 w-3 sm:h-3.5 sm:w-3.5" /> : <Pin className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
          </button>
          <button title="ซ่อนแถว" onClick={onHide}
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
            <EyeOff className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────

export default function OomPage() {
  const [rows,        setRows]        = useState<OomRow[] | null>(null);
  const [error,       setError]       = useState<string | null>(null);
  const [copied,      setCopied]      = useState(false);
  const [colFilters,  setColFilters]  = useState<Record<string, string[]>>({});
  const [dateMode,    setDateMode]    = useState<DateMode>('date');
  const [frozenIds,   setFrozenIds]   = useState<Set<number>>(new Set());
  const [hiddenIds,   setHiddenIds]   = useState<Set<number>>(new Set());
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showHidden,  setShowHidden]  = useState(false);

  useEffect(() => {
    fetch('/api/oom')
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setRows((data.events ?? []).map((ev: OomEvent, i: number) => ({ ...ev, _id: i })));
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'ไม่สามารถดึงข้อมูลได้'));
  }, []);

  // ── Derived ───────────────────────────────────────────────────────────────

  const filtered = useMemo(
    () => (rows ? applyFilters(rows, colFilters, dateMode) : []),
    [rows, colFilters, dateMode],
  );

  const frozenRows  = useMemo(() => (rows ?? []).filter((r) =>  frozenIds.has(r._id)), [rows, frozenIds]);
  const visibleRows = useMemo(() => filtered.filter((r) => !frozenIds.has(r._id) && !hiddenIds.has(r._id)), [filtered, frozenIds, hiddenIds]);
  const hiddenList  = useMemo(() => (rows ?? []).filter((r) =>  hiddenIds.has(r._id)), [rows, hiddenIds]);
  const exportRows  = useMemo(() => [...frozenRows, ...visibleRows], [frozenRows, visibleRows]);

  const activeFilterCount  = Object.values(colFilters).filter((v) => v.length > 0).length;
  const selectionCount     = selectedIds.size;
  const allVisibleSelected = selectionCount > 0 && [...selectedIds].every((id) =>
    frozenRows.some((r) => r._id === id) || visibleRows.some((r) => r._id === id),
  );
  const selectedAllFrozen = selectionCount > 0 && [...selectedIds].every((id) => frozenIds.has(id));

  // ── Actions ───────────────────────────────────────────────────────────────

  function toggleSelect(id: number) {
    setSelectedIds((p) => { const s = new Set(p); s.has(id) ? s.delete(id) : s.add(id); return s; });
  }
  function toggleSelectAll() {
    const all = [...frozenRows, ...visibleRows].map((r) => r._id);
    setSelectedIds((p) => p.size === all.length ? new Set() : new Set(all));
  }
  function clearSelection() { setSelectedIds(new Set()); }

  function toggleFreezeRow(id: number) {
    setFrozenIds((p) => { const s = new Set(p); s.has(id) ? s.delete(id) : s.add(id); return s; });
    setSelectedIds((p) => { const s = new Set(p); s.delete(id); return s; });
  }
  function hideRow(id: number) {
    setHiddenIds((p) => new Set(p).add(id));
    setFrozenIds((p) => { const s = new Set(p); s.delete(id); return s; });
    setSelectedIds((p) => { const s = new Set(p); s.delete(id); return s; });
  }
  function restoreRow(id: number) {
    setHiddenIds((p) => { const s = new Set(p); s.delete(id); return s; });
  }
  function freezeSelected() {
    const allFrozen = [...selectedIds].every((id) => frozenIds.has(id));
    setFrozenIds((p) => {
      const s = new Set(p);
      allFrozen ? selectedIds.forEach((id) => s.delete(id)) : selectedIds.forEach((id) => s.add(id));
      return s;
    });
    clearSelection();
  }
  function hideSelected() {
    setHiddenIds((p) => { const s = new Set(p); selectedIds.forEach((id) => s.add(id)); return s; });
    setFrozenIds((p) => { const s = new Set(p); selectedIds.forEach((id) => s.delete(id)); return s; });
    clearSelection();
  }

  function setFilter(col: string, values: string[]) { setColFilters((p) => ({ ...p, [col]: values })); }
  function clearFilter(col: string)                  { setColFilters((p) => ({ ...p, [col]: [] })); }
  function clearAllFilters()                          { setColFilters({}); }

  const handleCopy = useCallback(async () => {
    if (!rows) return;
    await navigator.clipboard.writeText(buildTsv(exportRows));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [rows, exportRows]);

  const dateOptions   = useMemo(() => (rows ? getDateOptions(rows, dateMode) : []), [rows, dateMode]);
  const columnOptions = useMemo(() => {
    const map: Partial<Record<keyof OomEvent, { value: string; label: string }[]>> = {};
    if (!rows) return map;
    for (const col of COLUMNS) {
      if (col.key !== 'date') map[col.key] = getColumnOptions(rows, col.key).map((v) => ({ value: v, label: v }));
    }
    return map;
  }, [rows]);

  // ── Render ────────────────────────────────────────────────────────────────

  const allSelectableCount = frozenRows.length + visibleRows.length;
  const headerCheckState: 'none' | 'some' | 'all' =
    selectionCount === 0 ? 'none' : selectionCount === allSelectableCount ? 'all' : 'some';

  return (
    <main className="min-h-screen bg-background pb-24 sm:pb-28">
      {/* Responsive container: full-width on mobile → capped on tablet → wider on desktop */}
      <div className="mx-auto w-full max-w-full px-3 py-6 sm:px-5 sm:py-8 lg:max-w-6xl lg:px-6 lg:py-10 2xl:max-w-7xl">

        {/* ── Page header ── */}
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3 sm:mb-6 sm:gap-4">
          <div>
            <h1 className="text-xl font-bold sm:text-2xl">งานอุ๋ม</h1>
            <p className="mt-0.5 text-xs text-muted-foreground sm:mt-1 sm:text-sm">ตั้งแต่เดือนเมษายน 2026 เป็นต้นไป</p>
          </div>
          {rows && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1.5 text-xs sm:text-sm" onClick={handleCopy}>
                {copied ? <><Check className="h-3.5 w-3.5 text-green-500 sm:h-4 sm:w-4" />Copied!</> : <><Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />Copy</>}
              </Button>
              <Button variant="outline" size="sm" className="gap-1.5 text-xs sm:text-sm" onClick={() => exportXlsx(exportRows)}>
                <Download className="h-3.5 w-3.5 sm:h-4 sm:w-4" />Export
              </Button>
            </div>
          )}
        </div>

        {/* ── Loading / Error ── */}
        {!rows && !error && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />กำลังโหลดข้อมูล...
          </div>
        )}
        {error && (
          <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</div>
        )}

        {rows && (
          <>
            {/* ── Filter bar — horizontal scroll on mobile, wrap on sm+ ── */}
            <div className="mb-4 flex gap-2 overflow-x-auto pb-1.5 [&::-webkit-scrollbar]:hidden sm:flex-wrap sm:overflow-visible sm:pb-0">
              {COLUMNS.map((col) => (
                <FilterPill key={col.key} label={col.label}
                  selected={colFilters[col.key] ?? []}
                  options={col.key === 'date' ? dateOptions : (columnOptions[col.key] ?? [])}
                  onChange={(vals) => setFilter(col.key, vals)}
                  onClear={() => clearFilter(col.key)}
                  isDate={col.key === 'date'} dateMode={dateMode}
                  onDateModeChange={col.key === 'date' ? setDateMode : undefined}
                />
              ))}
              {activeFilterCount > 0 && (
                <button onClick={clearAllFilters}
                  className="inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-xs sm:py-1.5 sm:text-sm text-muted-foreground hover:text-destructive transition-colors">
                  <X className="h-3.5 w-3.5" />ล้างทั้งหมด
                </button>
              )}
            </div>

            {/* ── Stats row ── */}
            <div className="mb-2 sm:mb-3 flex flex-wrap items-center justify-between gap-1 text-xs text-muted-foreground">
              <span>
                แสดง <span className="font-medium text-foreground">{frozenRows.length + visibleRows.length}</span> จาก {rows.length} รายการ
                {frozenIds.size > 0 && <span className="ml-2 text-amber-500">· ปักหมุด {frozenIds.size}</span>}
                {hiddenIds.size > 0 && <span className="ml-2 opacity-60">· ซ่อน {hiddenIds.size}</span>}
                {activeFilterCount > 0 && <span className="ml-2">· กรอง {activeFilterCount} คอลัมน์</span>}
              </span>
            </div>

            {/* ── Table ── */}
            <div className="overflow-auto max-h-[58vh] rounded-xl border shadow-sm sm:max-h-[calc(100vh-240px)] lg:max-h-[calc(100vh-260px)]">
              <table className="w-full">
                <thead className="sticky top-0 z-10">
                  <tr className="border-b bg-muted">
                    {/* Select-all */}
                    <th className="w-7 sm:w-8 bg-muted px-1.5 sm:px-2 py-2.5 sm:py-3 cursor-pointer" onClick={toggleSelectAll}>
                      <RowCheckbox checked={headerCheckState === 'all'} indeterminate={headerCheckState === 'some'} />
                    </th>
                    {COLUMNS.map((col) => {
                      const active = (colFilters[col.key] ?? []).length > 0;
                      return (
                        <th key={col.key}
                          className={`${col.cellClass} bg-muted px-2 py-2.5 sm:px-3 sm:py-3 text-left text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                          {col.label}
                          {active && <Badge variant="secondary" className="ml-1 sm:ml-1.5 text-[10px] px-1.5 py-0">{(colFilters[col.key] ?? []).length}</Badge>}
                        </th>
                      );
                    })}
                    <th className="w-12 sm:w-16 bg-muted px-1 sm:px-2 py-2.5 sm:py-3" />
                  </tr>
                </thead>

                {/* ── Frozen section ── */}
                {frozenRows.length > 0 && (
                  <tbody>
                    <tr className="bg-amber-50/60 dark:bg-amber-950/30">
                      <td colSpan={COL_SPAN} className="px-3 sm:px-4 py-1.5">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400">
                            <Pin className="h-3 w-3" />ปักหมุด ({frozenRows.length})
                          </span>
                          <button onClick={() => setFrozenIds(new Set())}
                            className="text-[11px] text-amber-500 hover:text-amber-700 transition-colors">ล้างทั้งหมด</button>
                        </div>
                      </td>
                    </tr>
                    {frozenRows.map((ev) => (
                      <OomTableRow key={ev._id} ev={ev} isFrozen
                        isSelected={selectedIds.has(ev._id)}
                        onSelect={() => toggleSelect(ev._id)}
                        onFreeze={() => toggleFreezeRow(ev._id)}
                        onHide={() => hideRow(ev._id)}
                      />
                    ))}
                    {visibleRows.length > 0 && (
                      <tr>
                        <td colSpan={COL_SPAN} className="px-4 py-0">
                          <div className="flex items-center gap-3 py-2">
                            <div className="h-px flex-1 bg-border" />
                            <span className="text-[11px] text-muted-foreground/60">รายการทั้งหมด</span>
                            <div className="h-px flex-1 bg-border" />
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                )}

                {/* ── Main rows ── */}
                <tbody className="divide-y">
                  {visibleRows.length === 0 && frozenRows.length === 0 ? (
                    <tr>
                      <td colSpan={COL_SPAN} className="px-4 py-16 text-center text-muted-foreground">
                        <Filter className="mx-auto mb-2 h-8 w-8 opacity-20" />
                        ไม่มีข้อมูลที่ตรงกับตัวกรอง
                      </td>
                    </tr>
                  ) : (
                    visibleRows.map((ev) => (
                      <OomTableRow key={ev._id} ev={ev} isFrozen={false}
                        isSelected={selectedIds.has(ev._id)}
                        onSelect={() => toggleSelect(ev._id)}
                        onFreeze={() => toggleFreezeRow(ev._id)}
                        onHide={() => hideRow(ev._id)}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Hidden rows recovery ── */}
            {hiddenIds.size > 0 && (
              <div className="mt-3">
                <button onClick={() => setShowHidden((v) => !v)}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors">
                  <Eye className="h-3.5 w-3.5" />
                  {showHidden ? 'ซ่อน' : 'แสดง'} {hiddenIds.size} แถวที่ซ่อน
                  <ChevronDown className={`h-3 w-3 transition-transform ${showHidden ? 'rotate-180' : ''}`} />
                </button>
                {showHidden && (
                  <div className="mt-2 overflow-x-auto rounded-xl border border-dashed opacity-60">
                    <table className="w-full">
                      <tbody className="divide-y">
                        {hiddenList.map((ev) => (
                          <tr key={ev._id} className="bg-muted/20 italic text-muted-foreground">
                            <td className="w-7 sm:w-8 px-1.5 sm:px-2 py-2 sm:py-2.5" />
                            {COLUMNS.map((col) => (
                              <td key={col.key} className={`${col.cellClass} whitespace-nowrap px-2 py-2 text-xs sm:px-3 sm:py-2.5 sm:text-sm`}>
                                {col.key === 'date' && ev.isTextDate
                                  ? <Badge variant="secondary" className="text-[10px] font-normal not-italic">{ev.date}</Badge>
                                  : (ev[col.key] as string) || <span className="text-muted-foreground/30 not-italic">—</span>}
                              </td>
                            ))}
                            <td className="w-12 sm:w-16 px-1 sm:px-2 py-2 sm:py-2.5">
                              <button onClick={() => restoreRow(ev._id)} title="คืนค่า"
                                className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                                <Eye className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {rows.some((e) => e.isTextDate) && (
              <p className="mt-3 text-right text-xs text-muted-foreground">* แถวตัวเอียง = ยังไม่ระบุวันแน่ชัด</p>
            )}
          </>
        )}
      </div>

      {/* ── Floating action toolbar ──
           Mobile (< sm): near-full-width bar pinned to bottom
           sm+: centered floating pill  */}
      <div className={`fixed z-50 transition-all duration-300 ease-out
        bottom-3 left-3 right-3
        sm:bottom-6 sm:left-1/2 sm:right-auto sm:-translate-x-1/2
        ${selectionCount > 0 && allVisibleSelected
          ? 'translate-y-0 opacity-100 scale-100'
          : 'translate-y-4 opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className="flex w-full items-center justify-between gap-2 rounded-2xl border bg-popover px-3 py-2.5 shadow-xl shadow-black/10 backdrop-blur-sm sm:w-auto sm:justify-start sm:gap-2 sm:px-4">
          <span className="text-xs font-medium text-foreground sm:text-sm sm:mr-1">
            {selectionCount} แถวที่เลือก
          </span>
          <div className="h-4 w-px bg-border" />
          <button onClick={freezeSelected}
            className="flex items-center gap-1 sm:gap-1.5 rounded-lg px-2 py-1.5 sm:px-3 text-xs sm:text-sm font-medium transition-colors hover:bg-amber-50 hover:text-amber-600 dark:hover:bg-amber-950/40">
            {selectedAllFrozen ? <PinOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <Pin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
            <span className="hidden xs:inline sm:inline">{selectedAllFrozen ? 'เลิกปักหมุด' : 'ปักหมุด'}</span>
          </button>
          <button onClick={hideSelected}
            className="flex items-center gap-1 sm:gap-1.5 rounded-lg px-2 py-1.5 sm:px-3 text-xs sm:text-sm font-medium transition-colors hover:bg-accent">
            <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            <span className="hidden xs:inline sm:inline">ซ่อน</span>
          </button>
          <div className="h-4 w-px bg-border" />
          <button onClick={clearSelection}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
            <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </button>
        </div>
      </div>
    </main>
  );
}
