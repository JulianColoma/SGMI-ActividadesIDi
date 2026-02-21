"use client";

import { useParams, useSearchParams } from "next/navigation";
import ProyectoFormPage from "@/app/components/proyectoFormPage";
import { withAuth } from "@/app/withAuth";

function EditarProyectoPage() {
  const params = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const proyectoId = Number(params?.id);
  const memoriaId = Number(searchParams.get("memoriaId"));
  const lockMemoria = searchParams.get("lockMemoria") === "1";
  const returnTo = searchParams.get("returnTo") || "/proyectos";

  if (!Number.isFinite(proyectoId) || proyectoId <= 0) {
    return <div className="p-8 text-red-600">Id de proyecto invalido.</div>;
  }

  return (
    <ProyectoFormPage
      mode="edit"
      proyectoId={proyectoId}
      forcedMemoriaId={Number.isFinite(memoriaId) && memoriaId > 0 ? memoriaId : undefined}
      lockMemoria={lockMemoria}
      returnPath={returnTo}
    />
  );
}

export default withAuth(EditarProyectoPage);

