// =============================================================================
// Blossom Pixel Document Generator — Type Definitions
// =============================================================================

/** Customer classification */
export type CustomerType = 'individual' | 'corporate';

/** Event classification */
export type EventType = 'wedding' | 'event' | 'others';

/** Document type determines format, prefix, and footer content */
export type DocumentType = 'booking' | 'quotation' | 'invoice' | 'receipt';

/** Available service types */
export type ServiceType =
  | 'photobooth'
  | '360video'
  | 'blessing'
  | 'stickerline'
  | 'signme'
  | 'addon'
  | 'bundle';

/** Photo size options for Photobooth service */
export type PhotoSize = '2x6' | '4x6' | '2x6_blessing' | '4x6_blessing' | 'custom';

/** Common information shared across all documents */
export interface CommonInfo {
  eventDate: Date | null;
  guestCount: number;
  location: string;
  travelFee: number;
  deposit: number;
  remarks: string;
}

/** Client information — fields vary by customer/event type */
export interface ClientInfo {
  customerName: string;
  phone: string;
  groomName: string;
  brideName: string;
  companyName: string;
  taxId: string;
  companyAddress: string;
}

/** Base fields shared by most services */
export interface BaseServiceFields {
  serviceName: string;
  hours: number;
  minutes: number;
  setupPoint: string;
  startTime: string;
  endTime: string;
  price: number;
  extraNotes: string;
}

/** Photobooth-specific extended fields */
export interface PhotoboothFields extends BaseServiceFields {
  type: 'photobooth';
  photoSize: PhotoSize;
  customPhotoSize: string;
}

/** 360 Video extended fields */
export interface Video360Fields extends BaseServiceFields {
  type: '360video';
  packageType: string;
}

/** Blessing Video uses base fields only */
export interface BlessingFields extends BaseServiceFields {
  type: 'blessing';
}

/** Sign Me uses base fields only */
export interface SignMeFields extends BaseServiceFields {
  type: 'signme';
}

/** Stickerline has its own unique field set */
export interface StickerlineFields {
  type: 'stickerline';
  serviceName: string;
  stickerCount: number;
  price: number;
  extraNotes: string;
}

/** Single add-on entry */
export interface AddOnItem {
  name: string;
  price: number;
}

/** Add-on service with multiple items */
export interface AddOnFields {
  type: 'addon';
  serviceName: string;
  items: AddOnItem[];
}

/** Bundle service — overrides pricing on all other services */
export interface BundleFields {
  type: 'bundle';
  serviceName: string;
  price: number;
  extraNotes: string;
}

/** Union type for all possible service field shapes */
export type ServiceFields =
  | PhotoboothFields
  | Video360Fields
  | BlessingFields
  | SignMeFields
  | StickerlineFields
  | AddOnFields
  | BundleFields;

/** A single service entry with a unique id */
export interface ServiceEntry {
  id: string;
  fields: ServiceFields;
}

/** Supported UI languages */
export type Language = 'th' | 'en';

/** Full application state */
export interface DocumentState {
  // Step 1 selections
  customerType: CustomerType | null;
  eventType: EventType | null;
  documentType: DocumentType | null;

  // Step 2 form data
  commonInfo: CommonInfo;
  clientInfo: ClientInfo;
  services: ServiceEntry[];

  // Step 3 settings
  language: Language;
  documentNumber: string;
}
