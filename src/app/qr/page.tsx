"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import QRCodePanel from "@/components/QRCodePanel";
import PageHeader from "@/components/PageHeader";

export default function QRPage() {
  return (
    <ProtectedRoute>
      <div>
        <PageHeader
          label="Pristup"
          title="QR kod aplikacije"
          description="Za skeniranje i brz pristup aplikaciji sa mobilnog uređaja"
          icon="qr"
        />
        <QRCodePanel />
      </div>
    </ProtectedRoute>
  );
}
