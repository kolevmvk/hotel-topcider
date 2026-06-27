"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import MyRoomPanel from "@/components/MyRoomPanel";
import PageHeader from "@/components/PageHeader";

export default function SobaPage() {
  return (
    <ProtectedRoute allowedRoles={["stanar", "gost"]}>
      <div className="mx-auto max-w-2xl">
        <PageHeader
          label="Smeštaj"
          title="Moja soba"
          description="Pregled inventara, potvrda prijema i predaje sobe"
          icon="bed"
        />
        <MyRoomPanel />
      </div>
    </ProtectedRoute>
  );
}
