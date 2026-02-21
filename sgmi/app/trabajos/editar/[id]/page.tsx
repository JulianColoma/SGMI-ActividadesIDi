"use client";

import { useParams, useSearchParams } from "next/navigation";
import TrabajoFormPage from "@/app/components/trabajoFormPage";
import { withAuth } from "@/app/withAuth";

function EditarTrabajoPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const trabajoId = Number(params?.id);
  const memoriaId = Number(searchParams.get("memoriaId"));
  const lockMemoria = searchParams.get("lockMemoria") === "1";
  const returnTo = searchParams.get("returnTo") || "/trabajos";

  if (!Number.isFinite(trabajoId) || trabajoId <= 0) {
    return <div className="p-8 text-red-600">Id de trabajo invalido.</div>;
  }

  return (
    <TrabajoFormPage
      mode="edit"
      trabajoId={trabajoId}
      forcedMemoriaId={Number.isFinite(memoriaId) && memoriaId > 0 ? memoriaId : undefined}
      lockMemoria={lockMemoria}
      returnPath={returnTo}
    />
  );
}

export default withAuth(EditarTrabajoPage);
