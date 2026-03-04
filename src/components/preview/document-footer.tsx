"use client";

import { useDocumentStore } from "@/store/document-store";
import { FOOTER_REMARKS_TH, FOOTER_REMARKS_EN } from "@/lib/constants";
import { t } from "@/lib/i18n";

export function DocumentFooter() {
  const { documentType, language, commonInfo } = useDocumentStore();
  const lang = language;

  const showRemarks =
    documentType === "booking" || documentType === "quotation";
  const remarks = lang === "th" ? FOOTER_REMARKS_TH : FOOTER_REMARKS_EN;

  return (
    <div className="space-y-6 text-[10px]">
      {/* User remarks from the form */}
      {commonInfo.remarks && (
        <div>
          <p className="font-semibold text-gray-700 mb-1">
            {t("remarks", lang)}:
          </p>
          <p
            contentEditable
            suppressContentEditableWarning
            className="text-gray-600 leading-relaxed"
          >
            {commonInfo.remarks}
          </p>
        </div>
      )}

      {/* Standard footer remarks (Booking / Quotation only) */}
      {showRemarks && (
        <div>
          <p contentEditable suppressContentEditableWarning className="font-bold text-gray-800 mb-1.5">
            {t("footerRemarks", lang)}
          </p>
          <div className="space-y-1 text-gray-600 leading-relaxed">
            {remarks.map((text, i) => (
              <div key={i} className="flex gap-1.5">
                <span
                  contentEditable
                  suppressContentEditableWarning
                  className="shrink-0"
                >
                  {i + 1}.
                </span>
                <span contentEditable suppressContentEditableWarning>
                  {text}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Signature block */}
      <div className="pt-6 flex justify-between">
        <SignatureBlock label={t("signatureClient", lang)} />
        <SignatureBlock
          label={t("signatureCompany", lang)}
          issuedBy="Passkamon P."
        />
      </div>
    </div>
  );
}

function SignatureBlock({ label, issuedBy }: { label: string; issuedBy?: string }) {
  return (
    <div className="text-center w-40 flex flex-col items-center">
      {/* Fixed-height name area so both blocks align regardless of issuedBy */}
      <div className="h-10 flex items-end justify-center pb-1">
        {issuedBy && (
          <p
            contentEditable
            suppressContentEditableWarning
            className="text-[10px] font-medium text-gray-700"
          >
            {issuedBy}
          </p>
        )}
      </div>
      <div className="border-b border-gray-400 w-full" />
      <p
        contentEditable
        suppressContentEditableWarning
        className="text-[10px] text-gray-600 mt-1.5"
      >
        ({label})
      </p>
    </div>
  );
}
