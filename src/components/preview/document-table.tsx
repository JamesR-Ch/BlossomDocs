'use client';

import { useDocumentStore } from '@/store/document-store';
import { t, formatCurrency } from '@/lib/i18n';
import type { ServiceEntry, AddOnFields } from '@/lib/types';
import { PHOTO_SIZE_OPTIONS } from '@/lib/constants';

export function DocumentTable() {
  const { services, commonInfo, language, hasBundleService, totalAmount } = useDocumentStore();
  const lang = language;
  const bundleActive = hasBundleService();
  const total = totalAmount();
  const remaining = total - commonInfo.deposit;

  return (
    <div className="space-y-3">
      {/* Service Table */}
      <table className="w-full text-[10px] border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-800">
            <th className="py-1.5 text-center w-8">{t('tableNo', lang)}</th>
            <th className="py-1.5 text-left pl-2">{t('tableItem', lang)}</th>
            <th className="py-1.5 text-left pl-2">{t('tableDetails', lang)}</th>
            <th className="py-1.5 text-right pr-1 w-24">{t('tableAmount', lang)}</th>
          </tr>
        </thead>
        <tbody>
          {/* Sort: bundle services always first */}
          {[...services]
            .sort((a, b) => {
              if (a.fields.type === 'bundle' && b.fields.type !== 'bundle') return -1;
              if (a.fields.type !== 'bundle' && b.fields.type === 'bundle') return 1;
              return 0;
            })
            .map((entry, idx) => (
              <ServiceRow
                key={entry.id}
                entry={entry}
                index={idx}
                lang={lang}
                bundleActive={bundleActive}
              />
            ))}

          {/* Travel fee row — hidden when fee is 0 */}
          {commonInfo.travelFee > 0 && (
            <tr className="border-b border-gray-200">
              <td className="py-1.5 text-center">
                {services.length + 1}
              </td>
              <td contentEditable suppressContentEditableWarning className="py-1.5 pl-2">
                {t('travelFee', lang)}
              </td>
              <td className="py-1.5 pl-2">-</td>
              <td contentEditable suppressContentEditableWarning className="py-1.5 text-right pr-1">
                {formatCurrency(commonInfo.travelFee)}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Totals */}
      <div className="border-t-2 border-gray-800 pt-2 text-xs space-y-1">
        <div className="flex justify-between font-bold">
          <span>{t('totalAmount', lang)}</span>
          <span contentEditable suppressContentEditableWarning>
            {formatCurrency(total)} {t('baht', lang)}
          </span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>{t('depositAmount', lang)}</span>
          <span contentEditable suppressContentEditableWarning>
            {formatCurrency(commonInfo.deposit)} {t('baht', lang)}
          </span>
        </div>
        <div className="flex justify-between font-bold text-sm border-t pt-1">
          <span>{t('remainingAmount', lang)}</span>
          <span contentEditable suppressContentEditableWarning>
            {formatCurrency(remaining)} {t('baht', lang)}
          </span>
        </div>
      </div>
    </div>
  );
}

/** Single service table row */
function ServiceRow({
  entry,
  index,
  lang,
  bundleActive,
}: {
  entry: ServiceEntry;
  index: number;
  lang: 'th' | 'en';
  bundleActive: boolean;
}) {
  const f = entry.fields;

  // Build details string
  const details = buildDetails(entry, lang);

  // Determine price display
  let priceStr = '-';
  if (f.type === 'addon') {
    const addonTotal = (f as AddOnFields).items.reduce((s, i) => s + i.price, 0);
    priceStr = bundleActive ? '-' : formatCurrency(addonTotal);
  } else if ('price' in f) {
    priceStr = bundleActive && f.type !== 'bundle' ? '-' : formatCurrency(f.price as number);
  }

  return (
    <tr className="border-b border-gray-200">
      <td className="py-1.5 text-center">{index + 1}</td>
      <td contentEditable suppressContentEditableWarning className="py-1.5 pl-2 font-medium">
        {f.serviceName}
      </td>
      <td contentEditable suppressContentEditableWarning className="py-1.5 pl-2 text-gray-600">
        {details}
      </td>
      <td contentEditable suppressContentEditableWarning className="py-1.5 text-right pr-1">
        {priceStr}
      </td>
    </tr>
  );
}

/** Build a details string from service fields */
function buildDetails(entry: ServiceEntry, lang: 'th' | 'en'): string {
  const f = entry.fields;
  const parts: string[] = [];

  if (f.type === 'stickerline') {
    parts.push(`${t('stickerCount', lang)}: ${f.stickerCount}`);
    if (f.extraNotes) parts.push(f.extraNotes);
    return parts.join(' | ');
  }

  if (f.type === 'addon') {
    return f.items.map((item, i) => `${item.name || `Add-on ${i + 1}`}: ${formatCurrency(item.price)}`).join(', ');
  }

  if (f.type === 'bundle') {
    if (f.extraNotes) parts.push(f.extraNotes);
    return parts.join(' | ') || 'Bundle package';
  }

  // Standard services
  const durStr = `${f.hours}${t('hours', lang)}${f.minutes > 0 ? ` ${f.minutes}${t('minutes', lang)}` : ''}`;
  parts.push(durStr);
  parts.push(`${f.startTime}-${f.endTime}`);
  parts.push(f.setupPoint);

  if (f.type === 'photobooth') {
    const sizeOpt = PHOTO_SIZE_OPTIONS.find((o) => o.value === f.photoSize);
    const sizeLabel = sizeOpt ? sizeOpt[lang] : f.photoSize;
    parts.push(`${t('photoSize', lang)}: ${f.photoSize === 'custom' ? f.customPhotoSize : sizeLabel}`);
  }
  if (f.type === '360video' && f.packageType) {
    parts.push(`Pkg: ${f.packageType}`);
  }
  if ('extraNotes' in f && f.extraNotes) {
    parts.push(f.extraNotes);
  }

  return parts.join(' | ');
}
