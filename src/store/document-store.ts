// =============================================================================
// Blossom Pixel — Zustand Document Store
// =============================================================================

import { create } from 'zustand';
import type {
  CustomerType,
  EventType,
  DocumentType,
  CommonInfo,
  ClientInfo,
  ServiceEntry,
  ServiceFields,
  Language,
} from '@/lib/types';
import {
  DEFAULT_COMMON_INFO,
  DEFAULT_CLIENT_INFO,
  DOC_PREFIX,
  createDefaultServiceFields,
} from '@/lib/constants';
import type { ServiceType } from '@/lib/types';
import { generateDocNumber } from '@/lib/i18n';

interface DocumentStore {
  // -- Step 1: Selections --
  customerType: CustomerType | null;
  eventType: EventType | null;
  documentType: DocumentType | null;
  setCustomerType: (v: CustomerType | null) => void;
  setEventType: (v: EventType | null) => void;
  setDocumentType: (v: DocumentType | null) => void;

  // -- Step 2: Form data --
  commonInfo: CommonInfo;
  clientInfo: ClientInfo;
  services: ServiceEntry[];
  updateCommonInfo: (partial: Partial<CommonInfo>) => void;
  updateClientInfo: (partial: Partial<ClientInfo>) => void;
  addService: (type: ServiceType) => void;
  removeService: (id: string) => void;
  updateServiceFields: (id: string, fields: Partial<ServiceFields>) => void;

  // -- Step 3: Preview --
  language: Language;
  documentNumber: string;
  setLanguage: (lang: Language) => void;
  setDocumentNumber: (num: string) => void;

  // -- Computed --
  hasBundleService: () => boolean;
  totalAmount: () => number;

  // -- Reset --
  resetAll: () => void;
}

let serviceCounter = 0;

export const useDocumentStore = create<DocumentStore>((set, get) => ({
  // Step 1
  customerType: null,
  eventType: null,
  documentType: null,
  setCustomerType: (v) => set({ customerType: v }),
  setEventType: (v) => set({ eventType: v }),
  setDocumentType: (v) => {
    const prefix = v ? DOC_PREFIX[v] : 'CF';
    set({ documentType: v, documentNumber: generateDocNumber(prefix) });
  },

  // Step 2
  commonInfo: { ...DEFAULT_COMMON_INFO },
  clientInfo: { ...DEFAULT_CLIENT_INFO },
  services: [],
  updateCommonInfo: (partial) =>
    set((s) => ({ commonInfo: { ...s.commonInfo, ...partial } })),
  updateClientInfo: (partial) =>
    set((s) => ({ clientInfo: { ...s.clientInfo, ...partial } })),

  addService: (type) => {
    const id = `svc-${++serviceCounter}-${Date.now()}`;
    const fields = createDefaultServiceFields(type);
    set((s) => ({ services: [...s.services, { id, fields }] }));
  },

  removeService: (id) =>
    set((s) => ({ services: s.services.filter((svc) => svc.id !== id) })),

  updateServiceFields: (id, partial) =>
    set((s) => ({
      services: s.services.map((svc) =>
        svc.id === id
          ? { ...svc, fields: { ...svc.fields, ...partial } as ServiceFields }
          : svc
      ),
    })),

  // Step 3
  language: 'th',
  documentNumber: generateDocNumber('CF'),
  setLanguage: (lang) => set({ language: lang }),
  setDocumentNumber: (num) => set({ documentNumber: num }),

  // Computed helpers
  hasBundleService: () => get().services.some((s) => s.fields.type === 'bundle'),

  totalAmount: () => {
    const state = get();
    const hasBundle = state.services.some((s) => s.fields.type === 'bundle');

    if (hasBundle) {
      // Only sum bundle service price(s) + travel fee
      const bundleTotal = state.services
        .filter((s) => s.fields.type === 'bundle')
        .reduce((sum, s) => sum + (s.fields as { price: number }).price, 0);
      return bundleTotal + state.commonInfo.travelFee;
    }

    // Sum all service prices + travel fee
    let total = state.commonInfo.travelFee;
    for (const svc of state.services) {
      const f = svc.fields;
      if (f.type === 'addon') {
        total += f.items.reduce((sum, item) => sum + item.price, 0);
      } else {
        total += (f as { price: number }).price;
      }
    }
    return total;
  },

  resetAll: () =>
    set({
      customerType: null,
      eventType: null,
      documentType: null,
      commonInfo: { ...DEFAULT_COMMON_INFO },
      clientInfo: { ...DEFAULT_CLIENT_INFO },
      services: [],
      language: 'th',
      documentNumber: generateDocNumber('CF'),
    }),
}));
