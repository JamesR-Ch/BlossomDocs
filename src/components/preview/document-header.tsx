"use client";

import Image from "next/image";
import { useDocumentStore } from "@/store/document-store";
import { COMPANY, DOC_TITLE_TH, DOC_TITLE_EN } from "@/lib/constants";
import { t, formatDate } from "@/lib/i18n";

export function DocumentHeader() {
  const {
    language,
    documentType,
    documentNumber,
    setDocumentNumber,
    commonInfo,
    clientInfo,
    customerType,
    eventType,
  } = useDocumentStore();

  const lang = language;
  const docTitle =
    lang === "th" ? DOC_TITLE_TH[documentType!] : DOC_TITLE_EN[documentType!];
  const isCorporate = customerType === "corporate";
  const isWedding = eventType === "wedding";

  return (
    <div className="space-y-4">
      {/* Top row: Logo + Company info */}
      <div className="flex items-start justify-between">
        {/* Logo */}
        <div className="flex-shrink-0">
          <Image
            src={COMPANY.logo}
            alt="Blossom Pixel"
            width={70}
            height={70}
            className="rounded-lg"
          />
        </div>

        {/* Company info (right-aligned) */}
        <div className="text-right text-[10px] leading-relaxed text-gray-600">
          <p className="font-semibold text-xs text-gray-800">{COMPANY.name}</p>
          <p>{lang === "th" ? COMPANY.address : COMPANY.addressEn}</p>
          <p>
            {t("phone", lang)} {COMPANY.phone} &nbsp; Tax ID : {COMPANY.taxId}
          </p>
        </div>
      </div>

      {/* Document title */}
      <div className="text-center">
        <h1
          contentEditable
          suppressContentEditableWarning
          className="text-lg font-bold"
        >
          {docTitle}
        </h1>
      </div>

      {/* Document number & date row */}
      <div className="flex justify-between text-xs">
        <div className="flex items-baseline gap-1">
          <span className="text-gray-500">{t("documentNumber", lang)}:</span>
          <span
            contentEditable
            suppressContentEditableWarning
            className="font-medium"
            onBlur={(e) => setDocumentNumber(e.currentTarget.textContent || "")}
          >
            {documentNumber}
          </span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-gray-500">{t("documentDate", lang)}:</span>
          <span
            contentEditable
            suppressContentEditableWarning
            className="font-medium"
          >
            {formatDate(new Date(), lang)}
          </span>
        </div>
      </div>

      {/* Client info section */}
      <div className="border-t pt-3 text-xs space-y-1.5">
        {isCorporate ? (
          <>
            <InfoRow
              label={t("companyName", lang)}
              value={clientInfo.companyName}
            />
            <InfoRow label={t("taxId", lang)} value={clientInfo.taxId} />
            <InfoRow
              label={t("companyAddress", lang)}
              value={clientInfo.companyAddress}
            />
            <InfoRow label={t("phone", lang)} value={clientInfo.phone} />
          </>
        ) : (
          <>
            <InfoRow
              label={t("customerName", lang)}
              value={
                clientInfo.customerName
                  ? `${t("honorific", lang)} ${clientInfo.customerName}`
                  : "-"
              }
            />
            <InfoRow label={t("phone", lang)} value={clientInfo.phone} />
            {isWedding && (
              <>
                <InfoRow
                  label={t("groomName", lang)}
                  value={
                    clientInfo.groomName
                      ? `${t("honorific", lang)} ${clientInfo.groomName}`
                      : "-"
                  }
                />
                <InfoRow
                  label={t("brideName", lang)}
                  value={
                    clientInfo.brideName
                      ? `${t("honorific", lang)} ${clientInfo.brideName}`
                      : "-"
                  }
                />
              </>
            )}
          </>
        )}
        <InfoRow
          label={t("eventDate", lang)}
          value={formatDate(commonInfo.eventDate, lang)}
        />
        <InfoRow
          label={t("guestCount", lang)}
          value={`${commonInfo.guestCount} ${t("guests", lang)}`}
        />
        <InfoRow
          label={t("location", lang)}
          value={commonInfo.location || "-"}
        />
      </div>
    </div>
  );
}

/** Editable info row */
function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <span className="text-gray-500 w-36 flex-shrink-0">{label}:</span>
      <span
        contentEditable
        suppressContentEditableWarning
        className="font-medium flex-1"
      >
        {value || "-"}
      </span>
    </div>
  );
}
