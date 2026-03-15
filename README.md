# Blossom Pixel Document Generator

Thai/English business document generator for **Blossom Pixel** (photography & event services). Generates Booking Confirmation, Quotation, Invoice, and Receipt documents — printed as A4 PDF via native browser print.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16.1.6 (App Router, TypeScript strict, `output: "export"`) |
| Styling | Tailwind CSS v4 (oklch color system, `@theme inline`, `@custom-variant dark`) |
| Components | shadcn/ui (Radix primitives) |
| State | Zustand 5 |
| Font | Google Fonts — "Prompt" (Thai + Latin) |
| Calendar | date-fns v4 + react-day-picker v9 |
| Icons | lucide-react |
| Package manager | npm (Node v22.16.0) |

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run build   # static export → out/
npm run lint
```

---

## Application Flow (3 Steps)

### Step 1 — `/`
Progressive selection UI with fade-in tiers:
1. **Customer Type** — บุคคลทั่วไป (Individual) / บริษัท (Corporate)
2. **Event Type** — งานแต่งงาน / งาน Event / อื่นๆ
3. **Document Type** — ใบจอง / ใบเสนอราคา / Invoice / ใบเสร็จรับเงิน

### Step 2 — `/document`
Dynamic form, sections:
- **ข้อมูลทั่วไป** — event date (calendar), guest count, location, travel fee, deposit, remarks
- **ข้อมูลลูกค้า** — name/phone (individual) or company/taxId/address/WHT (corporate); wedding adds เจ้าสาว + เจ้าบ่าว
- **บริการ** — service picker (add any combination) + per-service sub-forms

### Step 3 — `/preview`
- A4 paper (210mm × 297mm) always white even in dark mode
- All text is `contentEditable` — edit inline before printing
- TH ⇄ EN language toggle
- `window.print()` → browser print dialog → save as PDF

---

## Document Types

| Type | Prefix | Footer Remarks | Deposit/Remaining |
|------|--------|---------------|-------------------|
| ใบจอง (Booking Confirmation) | CF | ✓ (5 clauses) | ✓ |
| ใบเสนอราคา (Quotation) | QT | ✓ (5 clauses) | ✓ |
| Invoice | IV | ✗ | ✗ |
| ใบเสร็จรับเงิน (Receipt) | RC | ✗ | ✗ |

---

## Services (7 types)

| Service | Special Fields | Default Price |
|---------|---------------|---------------|
| Photobooth | photoSize (2x6 / 4x6 / 2x6 อวยพร / 4x6 อวยพร / custom) | 9,900 |
| 360 Video | packageType (default: standard) | 9,900 |
| VDO Blessing | base fields only | 9,900 |
| Sign Me | base fields only | 9,900 |
| Stickerline | stickerCount (default: 12), no time/duration fields | 1,200 |
| Add-on | multiple line items (name + price each) | 500/item |
| Bundle Service | single price overrides ALL other services | 12,900 |

**Bundle rule:** When active, all other service price fields are disabled. Bundle always appears as row #1 in the document table.

**Travel fee rule:** If travelFee = 0, the row is hidden from the document entirely.

---

## Withholding Tax (ภาษีหัก ณ ที่จ่าย)

Corporate customers only. Checkbox (default: on) + rate input (default: 3%).

Calculation:
```
ยอดรวมสุทธิ (net)  = sum of all services          ← what Blossom Pixel receives
ยอดรวม (gross)     = net ÷ (1 − rate/100)
ภาษีหัก ณ ที่จ่าย  = gross − net
```

Preview sequence (corporate with WHT):
```
ยอดรวม             gross amount
ภาษีหัก ณ ที่จ่าย X%   tax withheld
ยอดรวมสุทธิ         net (what Blossom receives)
เงินมัดจำ           deposit  (hidden on Invoice/Receipt)
ยอดคงเหลือ          remaining (hidden on Invoice/Receipt)
```

---

## Business Rules

- **คุณ prefix:** auto-prepended to customer/groom/bride names; translates to "Khun" in EN
- **อวยพร photo size:** translates to "Blessing" in EN
- **Buddhist Era dates:** year + 543, Thai month names (TH mode)
- **Signature block:** "Passkamon P." shown above line on the company/issued-by side only
- **End time:** auto-calculated from startTime + hours + minutes in service forms
- **Price inputs:** show blank (not 0) when cleared — prevents leading-zero issue on re-entry

---

## Footer Remarks (TH)

1. กรณีที่ลูกค้าขอยกเลิกงาน ลูกค้าจะไม่ได้รับเงินมัดจำคืนทุกกรณี
2. กรณีเกิดความเสียหายของอุปกรณ์จากการใช้บริการ ทางฝ่ายผู้ว่าจ้างจะเป็นผู้รับผิดชอบค่าเสียหายตามจริง
3. ทาง Blossom Pixel ขออนุญาตนำภาพและวิดิโอบางส่วนในงานของลูกค้าไปใช้เผยแพร่ในช่องทางต่างๆของบริษัท เพื่อการประชาสัมพันธ์
4. เพิ่มชั่วโมง Photobooth มีค่าใช้จ่ายเพิ่มชั่วโมงละ 1,500 บาท (กรุณาแจ้งก่อนวันงานอย่างน้อย 3 วัน) หากแจ้งต่ำกว่า 3 วัน เพิ่มชั่วโมงละ 2,000 บาท
5. เพิ่มชั่วโมง 360booth = 2,000 บาท/ชั่วโมง, VDO Blessing = 1,000 บาท/ชั่วโมง และ Sign me = 1,000 บาท/ชั่วโมง

---

## Footer Remarks (EN)

1. In case of event cancellation by the client, the deposit is non-refundable under all circumstances.
2. In case of equipment damage during the service, the client shall be responsible for actual repair/replacement costs.
3. Blossom Pixel reserves the right to use selected photos and videos from the event for promotional purposes across company channels.
4. Additional Photobooth hours are charged at 1,500 THB per hour (please notify at least 3 days before the event). If notified less than 3 days in advance, the rate is 2,000 THB per hour.
5. Additional hours: 360booth = 2,000 THB/hr, VDO Blessing = 1,000 THB/hr, Sign Me = 1,000 THB/hr.

---

## Company Info (hardcoded in `constants.ts`)

```
Name:     Blossom Pixel
Address:  198/20 หมู่ 8 ต.บางแก้ว อ.บางพลี จ.สมุทรปราการ 10540
          198/20 Moo 8, Bang Kaeo, Bang Phli, Samut Prakan 10540
Phone:    093-429-3226
Tax ID:   1119900400132
Logo:     /public/blossom-logo.png
```

---

## File Structure

```
src/
├── app/
│   ├── layout.tsx                 # Root layout: Prompt font, <html suppressHydrationWarning>
│   ├── globals.css                # Tailwind v4 theme (light + dark), A4 print CSS, contentEditable styles
│   ├── page.tsx                   # STEP 1: Progressive selection
│   ├── document/
│   │   └── page.tsx               # STEP 2: Dynamic form
│   └── preview/
│       └── page.tsx               # STEP 3: A4 preview + action bar
│
├── components/
│   ├── ui/                        # shadcn/ui primitives
│   ├── selection/
│   │   └── selection-card.tsx     # Toggleable card for Step 1
│   ├── forms/
│   │   ├── common-info-form.tsx   # Event date, guests, location, travel fee, deposit, remarks
│   │   ├── client-info-form.tsx   # Individual / corporate / wedding fields + WHT checkbox
│   │   ├── service-form.tsx       # Per-service sub-forms (7 variants), auto end time
│   │   └── service-picker.tsx     # Add-service buttons with count badges
│   ├── preview/
│   │   ├── action-bar.tsx         # Edit / Print / TH-EN / Theme buttons (print-hidden)
│   │   ├── document-header.tsx    # Logo, company info, doc title, number, date, client info
│   │   ├── document-table.tsx     # Service table, bundle sorting, travel fee, totals, WHT
│   │   └── document-footer.tsx    # Conditional remarks, signature blocks
│   └── theme-toggle.tsx           # Moon/Sun toggle, hydrates from localStorage
│
├── store/
│   ├── document-store.ts          # Main Zustand store (all state + hasBundleService, totalAmount)
│   └── theme-store.ts             # Theme store: toggles .dark on <html>, persists to localStorage
│
└── lib/
    ├── types.ts                   # All TypeScript interfaces
    ├── constants.ts               # Company info, prefixes, labels, defaults, FOOTER_REMARKS
    ├── i18n.ts                    # translations map, t(), formatCurrency(), formatDate(), generateDocNumber()
    └── utils.ts                   # shadcn cn() (clsx + tailwind-merge)
```

---

## Dark Mode

- Class-based (`.dark` on `<html>`), warm indigo-tinted palette
- Toggle available on all 3 pages
- A4 paper stays white in dark mode (print requirement) — forced via CSS variable reset + `color !important` + inline style
- Persists to `localStorage` key `blossom-theme`, respects `prefers-color-scheme`

---

## GitHub

[https://github.com/JamesR-Ch/BlossomDocs](https://github.com/JamesR-Ch/BlossomDocs)
