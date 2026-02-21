"use client";

import { useSearchParams } from "next/navigation";
import TrabajoFormPage from "@/app/components/trabajoFormPage";
import { withAuth } from "@/app/withAuth";

function NuevoTrabajoPage() {
  const searchParams = useSearchParams();
  const memoriaId = Number(searchParams.get("memoriaId"));
  const lockMemoria = searchParams.get("lockMemoria") === "1";
  const returnTo = searchParams.get("returnTo") || "/trabajos";
  const modoRaw = searchParams.get("modo");
  const modoInicial =
    modoRaw === "internacional" || modoRaw === "nacional" ? modoRaw : undefined;

  return (
    <TrabajoFormPage
      mode="create"
      forcedMemoriaId={Number.isFinite(memoriaId) && memoriaId > 0 ? memoriaId : undefined}
      lockMemoria={lockMemoria}
      modoInicial={modoInicial}
      returnPath={returnTo}
    />
  );
}

export default withAuth(NuevoTrabajoPage);
