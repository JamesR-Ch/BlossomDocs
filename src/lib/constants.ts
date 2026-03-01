// =============================================================================
// Blossom Pixel — Constants & Default Values
// =============================================================================

import type {
  CommonInfo,
  ClientInfo,
  DocumentType,
  ServiceType,
  BaseServiceFields,
  PhotoboothFields,
  Video360Fields,
  BlessingFields,
  SignMeFields,
  StickerlineFields,
  AddOnFields,
  BundleFields,
  ServiceFields,
} from './types';

// -- Company Information (printed on documents) --
export const COMPANY = {
  name: 'Blossom Pixel',
  address: '198/20 หมู่ 8 ต.บางแก้ว อ.บางพลี จ.สมุทรปราการ 10540',
  addressEn: '198/20 Moo 8, Bang Kaeo, Bang Phli, Samut Prakan 10540',
  phone: '093-429-3226',
  taxId: '1119900400132',
  logo: '/blossom-logo.png',
} as const;

// -- Document number prefixes --
export const DOC_PREFIX: Record<DocumentType, string> = {
  booking: 'CF',
  quotation: 'QT',
  invoice: 'IV',
  receipt: 'RC',
};

// -- Thai labels for document types --
export const DOC_TITLE_TH: Record<DocumentType, string> = {
  booking: 'ใบจอง',
  quotation: 'ใบเสนอราคา',
  invoice: 'Invoice',
  receipt: 'ใบเสร็จรับเงิน',
};

export const DOC_TITLE_EN: Record<DocumentType, string> = {
  booking: 'Booking Confirmation',
  quotation: 'Quotation',
  invoice: 'Invoice',
  receipt: 'Receipt',
};

// -- Service display labels --
export const SERVICE_LABELS: Record<ServiceType, { th: string; en: string }> = {
  photobooth: { th: 'Photobooth', en: 'Photobooth' },
  '360video': { th: '360 Video', en: '360 Video' },
  blessing: { th: 'Blessing Video', en: 'Blessing Video' },
  stickerline: { th: 'Stickerline', en: 'Stickerline' },
  signme: { th: 'Sign Me', en: 'Sign Me' },
  addon: { th: 'Add on', en: 'Add-on' },
  bundle: { th: 'Bundle Service', en: 'Bundle Service' },
};

// -- Default form values --
export const DEFAULT_COMMON_INFO: CommonInfo = {
  eventDate: null,
  guestCount: 200,
  location: '',
  travelFee: 500.0,
  deposit: 3000.0,
  remarks: '',
};

export const DEFAULT_CLIENT_INFO: ClientInfo = {
  customerName: '',
  phone: '',
  groomName: '',
  brideName: '',
  companyName: '',
  taxId: '',
  companyAddress: '',
};

// -- Default service field factories --
const baseServiceDefaults: Omit<BaseServiceFields, 'serviceName'> = {
  hours: 3,
  minutes: 0,
  setupPoint: 'indoor',
  startTime: '18:00',
  endTime: '21:00',
  price: 9900.0,
  extraNotes: '',
};

export function createDefaultServiceFields(type: ServiceType): ServiceFields {
  const label = SERVICE_LABELS[type].th;
  switch (type) {
    case 'photobooth':
      return {
        type: 'photobooth',
        serviceName: label,
        ...baseServiceDefaults,
        photoSize: '2x6',
        customPhotoSize: '',
      } satisfies PhotoboothFields;
    case '360video':
      return {
        type: '360video',
        serviceName: label,
        ...baseServiceDefaults,
        packageType: 'standard',
      } satisfies Video360Fields;
    case 'blessing':
      return {
        type: 'blessing',
        serviceName: label,
        ...baseServiceDefaults,
      } satisfies BlessingFields;
    case 'signme':
      return {
        type: 'signme',
        serviceName: label,
        ...baseServiceDefaults,
      } satisfies SignMeFields;
    case 'stickerline':
      return {
        type: 'stickerline',
        serviceName: label,
        stickerCount: 12,
        price: 1200.0,
        extraNotes: '',
      } satisfies StickerlineFields;
    case 'addon':
      return {
        type: 'addon',
        serviceName: label,
        items: [{ name: '', price: 500.0 }],
      } satisfies AddOnFields;
    case 'bundle':
      return {
        type: 'bundle',
        serviceName: label,
        price: 12900.0,
        extraNotes: '',
      } satisfies BundleFields;
  }
}

// -- Photo size labels (TH/EN) --
export const PHOTO_SIZE_OPTIONS = [
  { value: '2x6' as const, th: '2x6', en: '2x6' },
  { value: '4x6' as const, th: '4x6', en: '4x6' },
  { value: '2x6_blessing' as const, th: '2x6 อวยพร', en: '2x6 Blessing' },
  { value: '4x6_blessing' as const, th: '4x6 อวยพร', en: '4x6 Blessing' },
  { value: 'custom' as const, th: 'Custom', en: 'Custom' },
];

// -- Document footer remarks (Booking/Quotation only) --
export const FOOTER_REMARKS_TH = [
  'กรณีที่ลูกค้าขอยกเลิกงาน ลูกค้าจะไม่ได้รับเงินมัดจำคืนทุกกรณี',
  'กรณีเกิดความเสียหายของอุปกรณ์จากการใช้บริการ ทางฝ่ายผู้ว่าจ้างจะเป็นผู้รับผิดชอบค่าเสียหายตามจริง',
  'ทาง Blossom Pixel ขออนุญาตนำภาพและวิดิโอบางส่วนในงานของลูกค้าไปใช้เผยแพร่ในช่องทางต่างๆของบริษัท เพื่อการประชาสัมพันธ์',
  'หากต้องการเพิ่มชั่วโมง มีค่าใช้จ่ายเพิ่มชั่วโมงละ 1,500 บาท',
];

export const FOOTER_REMARKS_EN = [
  'In case of event cancellation by the client, the deposit is non-refundable under all circumstances.',
  'In case of equipment damage during the service, the client shall be responsible for actual repair/replacement costs.',
  'Blossom Pixel reserves the right to use selected photos and videos from the event for promotional purposes across company channels.',
  'Additional hours are charged at 1,500 THB per hour.',
];
