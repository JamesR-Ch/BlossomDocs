// =============================================================================
// Blossom Pixel — Internationalization (TH/EN)
// =============================================================================

import type { Language } from "./types";

const translations = {
  // -- Document boilerplate --
  documentDate: { th: "วันที่", en: "Date" },
  documentNumber: { th: "เลขที่เอกสาร", en: "Document No." },
  customerName: { th: "ชื่อลูกค้า", en: "Customer Name" },
  companyName: { th: "ชื่อบริษัทลูกค้า", en: "Company Name" },
  phone: { th: "เบอร์โทรศัพท์", en: "Phone" },
  taxId: { th: "เลขประจำตัวผู้เสียภาษี", en: "Tax ID" },
  companyAddress: { th: "ที่อยู่บริษัทลูกค้า", en: "Company Address" },
  groomName: { th: "เจ้าบ่าว", en: "Groom" },
  brideName: { th: "เจ้าสาว", en: "Bride" },
  eventDate: { th: "วันที่จัดงาน", en: "Event Date" },
  guestCount: { th: "จำนวนแขก", en: "Number of Guests" },
  location: { th: "สถานที่", en: "Location" },
  travelFee: { th: "ค่าเดินทาง", en: "Travel Fee" },
  deposit: { th: "เงินมัดจำ", en: "Deposit" },
  remarks: { th: "หมายเหตุ", en: "Remarks" },

  // -- Table headers --
  tableNo: { th: "ลำดับ", en: "No." },
  tableItem: { th: "รายการ", en: "Item" },
  tableDetails: { th: "รายละเอียด", en: "Details" },
  tableAmount: { th: "จำนวนเงิน", en: "Amount" },

  // -- Totals --
  totalAmount: { th: "รวมทั้งสิ้น", en: "Total Amount" },
  depositAmount: { th: "เงินมัดจำ", en: "Deposit" },
  remainingAmount: { th: "ยอดคงเหลือ", en: "Remaining Balance" },
  baht: { th: "บาท", en: "THB" },

  // -- Service fields --
  serviceName: { th: "ชื่อบริการ", en: "Service Name" },
  duration: { th: "จำนวนชั่วโมง", en: "Duration" },
  hours: { th: "ชั่วโมง", en: "hours" },
  minutes: { th: "นาที", en: "minutes" },
  setupPoint: { th: "จุดตั้ง", en: "Setup Point" },
  startTime: { th: "เวลาเริ่ม", en: "Start Time" },
  endTime: { th: "ถึงเวลา", en: "End Time" },
  price: { th: "ราคา", en: "Price" },
  extraNotes: { th: "Note เพิ่มเติม", en: "Extra Notes" },
  photoSize: { th: "ขนาดรูป", en: "Photo Size" },
  customPhotoSize: { th: "ขนาดรูปกำหนดเอง", en: "Custom Photo Size" },
  packageType: { th: "Package type", en: "Package Type" },
  stickerCount: { th: "จำนวนสติ๊กเกอร์", en: "Sticker Count" },

  // -- Buttons --
  generateDocument: { th: "ออกเอกสาร", en: "Generate Document" },
  editData: { th: "แก้ไขข้อมูล", en: "Edit Data" },
  printDocument: { th: "พิมพ์เอกสาร", en: "Print Document" },
  preview: { th: "ดูตัวอย่างเอกสาร", en: "Preview Document" },
  addService: { th: "เพิ่มบริการ", en: "Add Service" },
  removeService: { th: "ลบบริการ", en: "Remove Service" },

  // -- Step 1 labels --
  customerType: { th: "ประเภทลูกค้า", en: "Customer Type" },
  individual: { th: "ลูกค้าบุคคลทั่วไป", en: "Individual" },
  corporate: { th: "ลูกค้าบริษัท", en: "Corporate" },
  eventType: { th: "ประเภทงาน", en: "Event Type" },
  wedding: { th: "งานแต่งงาน", en: "Wedding" },
  event: { th: "งาน Event", en: "Event" },
  others: { th: "งานอื่นๆ", en: "Others" },
  documentTypeLabel: { th: "ประเภทเอกสาร", en: "Document Type" },
  booking: { th: "ออกใบจอง", en: "Booking" },
  quotation: { th: "ออกใบเสนอราคา", en: "Quotation" },
  invoice: { th: "ออก Invoice", en: "Invoice" },
  receipt: { th: "ออกใบเสร็จรับเงิน", en: "Receipt" },

  // -- Footer --
  footerRemarks: { th: "หมายเหตุ", en: "Remarks" },
  signatureClient: { th: "ลูกค้า", en: "Client" },
  signatureCompany: { th: "ออกเอกสารโดย", en: "Issued by" },
  signatureDate: { th: "วันที่", en: "Date" },

  // -- Misc --
  honorific: { th: "คุณ", en: "Khun" },
  guests: { th: "ท่าน", en: "guests" },
  addOn: { th: "Add-on", en: "Add-on" },
} as const;

type TranslationKey = keyof typeof translations;

/** Get a translated string by key */
export function t(key: TranslationKey, lang: Language): string {
  return translations[key]?.[lang] ?? key;
}

/** Format a number as Thai-style currency with commas and 2 decimals */
export function formatCurrency(value: number): string {
  return value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Format a date for document display */
export function formatDate(date: Date | null, lang: Language): string {
  if (!date) return "-";
  if (lang === "th") {
    const thMonths = [
      "มกราคม",
      "กุมภาพันธ์",
      "มีนาคม",
      "เมษายน",
      "พฤษภาคม",
      "มิถุนายน",
      "กรกฎาคม",
      "สิงหาคม",
      "กันยายน",
      "ตุลาคม",
      "พฤศจิกายน",
      "ธันวาคม",
    ];
    const d = date.getDate();
    const m = thMonths[date.getMonth()];
    const y = date.getFullYear() + 543; // Buddhist Era
    return `${d} ${m} ${y}`;
  }
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Generate document number from type and date */
export function generateDocNumber(prefix: string): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${prefix}-${y}${m}${d}-001`;
}
