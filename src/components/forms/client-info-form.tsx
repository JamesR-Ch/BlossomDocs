'use client';

import { useDocumentStore } from '@/store/document-store';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function ClientInfoForm() {
  const { customerType, eventType, clientInfo, updateClientInfo } = useDocumentStore();

  const isCorporate = customerType === 'corporate';
  const isWedding = eventType === 'wedding';

  return (
    <div className="space-y-5">
      <h3 className="text-base font-semibold border-b pb-2 border-border">
        {isCorporate ? 'ข้อมูลบริษัทลูกค้า' : 'ข้อมูลลูกค้า'}
      </h3>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Corporate fields */}
        {isCorporate ? (
          <>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>ชื่อบริษัทลูกค้า</Label>
              <Input
                value={clientInfo.companyName}
                onChange={(e) => updateClientInfo({ companyName: e.target.value })}
                placeholder="ชื่อบริษัท"
              />
            </div>
            <div className="space-y-1.5">
              <Label>เลขประจำตัวผู้เสียภาษี</Label>
              <Input
                value={clientInfo.taxId}
                onChange={(e) => updateClientInfo({ taxId: e.target.value })}
                placeholder="0-0000-00000-00-0"
              />
            </div>
            <div className="space-y-1.5">
              <Label>เบอร์โทรศัพท์</Label>
              <Input
                value={clientInfo.phone}
                onChange={(e) => updateClientInfo({ phone: e.target.value })}
                placeholder="0XX-XXX-XXXX"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>ที่อยู่บริษัทลูกค้า</Label>
              <Input
                value={clientInfo.companyAddress}
                onChange={(e) => updateClientInfo({ companyAddress: e.target.value })}
                placeholder="ที่อยู่บริษัท"
              />
            </div>
          </>
        ) : (
          <>
            {/* Individual fields */}
            <div className="space-y-1.5">
              <Label>ชื่อลูกค้า</Label>
              <Input
                value={clientInfo.customerName}
                onChange={(e) => updateClientInfo({ customerName: e.target.value })}
                placeholder="ชื่อ-นามสกุล"
              />
            </div>
            <div className="space-y-1.5">
              <Label>เบอร์โทรศัพท์</Label>
              <Input
                value={clientInfo.phone}
                onChange={(e) => updateClientInfo({ phone: e.target.value })}
                placeholder="0XX-XXX-XXXX"
              />
            </div>

            {/* Wedding-specific: Groom & Bride */}
            {isWedding && (
              <>
                <div className="space-y-1.5">
                  <Label>เจ้าบ่าว</Label>
                  <Input
                    value={clientInfo.groomName}
                    onChange={(e) => updateClientInfo({ groomName: e.target.value })}
                    placeholder="ชื่อเจ้าบ่าว"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>เจ้าสาว</Label>
                  <Input
                    value={clientInfo.brideName}
                    onChange={(e) => updateClientInfo({ brideName: e.target.value })}
                    placeholder="ชื่อเจ้าสาว"
                  />
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
