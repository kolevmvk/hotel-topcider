"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import RoomsManagementPanel from "@/components/RoomsManagementPanel";
import PageHeader from "@/components/PageHeader";
import { useAuth } from "@/components/AuthProvider";

export default function SobePage() {
  const { isUpravnik } = useAuth();

  return (
    <ProtectedRoute staffOnly>
      <div>
        <PageHeader
          label="Smeštaj"
          title={isUpravnik ? "Upravljanje sobama" : "Pregled soba"}
          description={
            isUpravnik
              ? "Definišite sobe, inventar, stanje, očitanja i namenu"
              : "Pregled soba, dodela gostima i potvrda prijema/predaje"
          }
          icon="bed"
        />
        <RoomsManagementPanel />
      </div>
    </ProtectedRoute>
  );
}
