"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import ProblemForm from "@/components/ProblemForm";
import PageHeader from "@/components/PageHeader";

export default function PrijavaPage() {
  return (
    <ProtectedRoute allowedRoles={["stanar", "gost"]}>
      <div className="mx-auto max-w-xl">
        <PageHeader
          label="Evidentiranje"
          title="Prijava problema"
          description="Opišite kvar ili problem u smeštaju — prijava se automatski evidentira"
          icon="report"
        />
        <ProblemForm />
      </div>
    </ProtectedRoute>
  );
}
