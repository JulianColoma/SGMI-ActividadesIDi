"use client";

import { useSearchParams } from "next/navigation";
import ProyectoFormPage from "@/app/components/proyectoFormPage";
import { withAuth } from "@/app/withAuth";

function NuevoProyectoPage() {
  const searchParams = useSearchParams();
  const memoriaId = Number(searchParams.get("memoriaId"));
  const lockMemoria = searchParams.get("lockMemoria") === "1";
  const returnTo = searchParams.get("returnTo") || "/proyectos";

  return (
    <ProyectoFormPage
      mode="create"
      forcedMemoriaId={Number.isFinite(memoriaId) && memoriaId > 0 ? memoriaId : undefined}
      lockMemoria={lockMemoria}
      returnPath={returnTo}
    />
  );
}

export default withAuth(NuevoProyectoPage);

