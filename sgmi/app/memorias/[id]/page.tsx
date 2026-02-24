"use client";

import Sidebar from "@/app/components/sidebar";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { HiOutlineEye, HiOutlineSearch, HiOutlineTrash } from "react-icons/hi";
import ModalVerTrabajo from "@/app/components/modalVerTrabajo";
import ModalVerProyecto from "@/app/components/modalVerProyecto";
import UserPill from "@/app/components/userPill";
import { withAuth } from "@/app/withAuth";
import ConfirmModal from "@/app/components/alerts/ConfrimModal";
import ErrorModal from "@/app/components/alerts/ErrorModal";

function MemoriaDetallePage() {
  const { id } = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const memoriaId = Number(id);

  const [memoria, setMemoria] = useState<any>(null);
  const [loadingMemoria, setLoadingMemoria] = useState(true);
  const [tab, setTab] = useState<"trabajos" | "proyectos">("trabajos");

  const [trabajos, setTrabajos] = useState<any[]>([]);
  const [loadingTrabajos, setLoadingTrabajos] = useState(false);
  const [cursorTrabajos, setCursorTrabajos] = useState<string | null>(null);
  const [nextCursorTrabajos, setNextCursorTrabajos] = useState<string | null>(null);
  const [hasMoreTrabajos, setHasMoreTrabajos] = useState(false);
  const [cursorStackTrabajos, setCursorStackTrabajos] = useState<string[]>([]);
  const [pageTrabajos, setPageTrabajos] = useState(1);

  const [proyectos, setProyectos] = useState<any[]>([]);
  const [loadingProyectos, setLoadingProyectos] = useState(false);
  const [cursorProyectos, setCursorProyectos] = useState<string | null>(null);
  const [nextCursorProyectos, setNextCursorProyectos] = useState<string | null>(null);
  const [hasMoreProyectos, setHasMoreProyectos] = useState(false);
  const [cursorStackProyectos, setCursorStackProyectos] = useState<string[]>([]);
  const [pageProyectos, setPageProyectos] = useState(1);

  const [busquedaProyecto, setBusquedaProyecto] = useState("");
  const [busquedaTrabajo, setBusquedaTrabajo] = useState("");
  const [modoGlobal, setModoGlobal] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState<null | (() => void)>(null);
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorTitle, setErrorTitle] = useState("");
  const [errorDesc, setErrorDesc] = useState("");
  const [verTrabajo, setVerTrabajo] = useState<any | null>(null);
  const [verProyecto, setVerProyecto] = useState<any | null>(null);

  const showError = (title: string, desc: string) => {
    setErrorTitle(title);
    setErrorDesc(desc);
    setErrorOpen(true);
  };

  const fetchMemoria = async () => {
    if (!Number.isFinite(memoriaId)) return;
    try {
      setLoadingMemoria(true);
      const res = await fetch(`/api/memoria/${memoriaId}`);
      const data = await res.json();
      if (data.success && data.data) {
        setMemoria(data.data);
      } else {
        showError("Error cargando memoria", data.error || "No se pudo cargar la memoria.");
      }
    } catch {
      showError("Error de conexion", "No se pudo contactar al servidor.");
    } finally {
      setLoadingMemoria(false);
    }
  };

  const fetchTrabajos = async (opts?: { cursor?: string | null; reset?: boolean; q?: string }) => {
    if (!Number.isFinite(memoriaId)) return;
    try {
      setLoadingTrabajos(true);

      if (opts?.reset) {
        setPageTrabajos(1);
        setCursorTrabajos(null);
        setCursorStackTrabajos([]);
      }

      const params = new URLSearchParams();
      params.set("memoriaId", String(memoriaId));
      if (opts?.cursor) params.set("cursor", opts.cursor);
      if (opts?.q?.trim()) params.set("q", opts.q.trim());
      params.set("modo", modoGlobal ? "internacional" : "nacional");

      const res = await fetch(`/api/trabajo?${params.toString()}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setTrabajos([]);
        setHasMoreTrabajos(false);
        setNextCursorTrabajos(null);
        showError("Error al obtener trabajos", data.error || data.message || "Intente nuevamente.");
        return;
      }

      setTrabajos(Array.isArray(data.items) ? data.items : []);
      setHasMoreTrabajos(!!data.hasMore);
      setNextCursorTrabajos(data.nextCursor ?? null);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Error de red";
      setTrabajos([]);
      setHasMoreTrabajos(false);
      setNextCursorTrabajos(null);
      showError("Error al obtener trabajos", message);
    } finally {
      setLoadingTrabajos(false);
    }
  };

  const fetchProyectos = async (opts?: { cursor?: string | null; reset?: boolean; q?: string }) => {
    if (!Number.isFinite(memoriaId)) return;
    try {
      setLoadingProyectos(true);

      if (opts?.reset) {
        setPageProyectos(1);
        setCursorProyectos(null);
        setCursorStackProyectos([]);
      }

      const params = new URLSearchParams();
      params.set("memoriaId", String(memoriaId));
      if (opts?.cursor) params.set("cursor", opts.cursor);
      if (opts?.q?.trim()) params.set("q", opts.q.trim());

      const res = await fetch(`/api/investigacion?${params.toString()}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setProyectos([]);
        setHasMoreProyectos(false);
        setNextCursorProyectos(null);
        showError("Error al obtener proyectos", data.error || data.message || "Intente nuevamente.");
        return;
      }

      setProyectos(Array.isArray(data.items) ? data.items : []);
      setHasMoreProyectos(!!data.hasMore);
      setNextCursorProyectos(data.nextCursor ?? null);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Error de red";
      setProyectos([]);
      setHasMoreProyectos(false);
      setNextCursorProyectos(null);
      showError("Error al obtener proyectos", message);
    } finally {
      setLoadingProyectos(false);
    }
  };

  useEffect(() => {
    fetchMemoria();
  }, [id]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTrabajos({ reset: true, q: busquedaTrabajo });
    }, 350);
    return () => clearTimeout(timer);
  }, [id, busquedaTrabajo, modoGlobal]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProyectos({ reset: true, q: busquedaProyecto });
    }, 350);
    return () => clearTimeout(timer);
  }, [id, busquedaProyecto]);

  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "trabajos" || tabParam === "proyectos") {
      setTab(tabParam);
    }
  }, [searchParams]);

  const handleOpenCreateTrabajo = () => {
    if (!Number.isFinite(memoriaId)) return;
    const modo = modoGlobal ? "internacional" : "nacional";
    const returnTo = encodeURIComponent(`/memorias/${memoriaId}?tab=trabajos`);
    router.push(
      `/trabajos/nuevo?memoriaId=${memoriaId}&lockMemoria=1&modo=${modo}&returnTo=${returnTo}`
    );
  };

  const handleEditTrabajo = (trabajo: any) => {
    setVerTrabajo(null);
    if (!trabajo?.id || !Number.isFinite(memoriaId)) return;
    const returnTo = encodeURIComponent(`/memorias/${memoriaId}?tab=trabajos`);
    router.push(
      `/trabajos/editar/${trabajo.id}?memoriaId=${memoriaId}&lockMemoria=1&returnTo=${returnTo}`
    );
  };

  const deleteTrabajo = async (trabajoId: number) => {
    try {
      const res = await fetch(`/api/trabajo/${trabajoId}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) {
        showError("Error al eliminar", data.error || "No se pudo eliminar el trabajo.");
        return;
      }
      setMemoria((prev: any) => {
        if (!prev || !Array.isArray(prev.trabajos)) return prev;
        return {
          ...prev,
          trabajos: prev.trabajos.filter((t: any) => t?.id !== trabajoId),
        };
      });
      await fetchTrabajos({ cursor: cursorTrabajos, q: busquedaTrabajo });
    } catch {
      showError("Error de conexion", "No se pudo contactar al servidor.");
    }
  };

  const handleDeleteTrabajo = (trabajoId: number) => {
    setConfirmMessage("Deseas eliminar este trabajo?");
    setConfirmAction(() => () => deleteTrabajo(trabajoId));
    setConfirmOpen(true);
  };

  const handleOpenCreateProyecto = () => {
    if (!Number.isFinite(memoriaId)) return;
    const returnTo = encodeURIComponent(`/memorias/${memoriaId}?tab=proyectos`);
    router.push(`/proyectos/nuevo?memoriaId=${memoriaId}&lockMemoria=1&returnTo=${returnTo}`);
  };

  const handleEditProyecto = (proyecto: any) => {
    setVerProyecto(null);
    if (!proyecto?.id || !Number.isFinite(memoriaId)) return;
    const returnTo = encodeURIComponent(`/memorias/${memoriaId}?tab=proyectos`);
    router.push(
      `/proyectos/editar/${proyecto.id}?memoriaId=${memoriaId}&lockMemoria=1&returnTo=${returnTo}`
    );
  };

  const deleteProyecto = async (proyectoId: number) => {
    try {
      const res = await fetch(`/api/investigacion/${proyectoId}`, { method: "DELETE" });
      const data = await res.json();

      if (!data.success) {
        showError("Error al eliminar", data.error || "No se pudo eliminar el proyecto.");
        return;
      }
      setMemoria((prev: any) => {
        if (!prev || !Array.isArray(prev.proyectos)) return prev;
        return {
          ...prev,
          proyectos: prev.proyectos.filter((p: any) => p?.id !== proyectoId),
        };
      });

      await fetchProyectos({ cursor: cursorProyectos, q: busquedaProyecto });
    } catch {
      showError("Error de conexion", "No se pudo contactar al servidor.");
    }
  };

  const handleDeleteProyecto = (proyectoId: number) => {
    setConfirmMessage("Deseas eliminar este proyecto?");
    setConfirmAction(() => () => deleteProyecto(proyectoId));
    setConfirmOpen(true);
  };

  const trabajosFiltrados = trabajos;

  const proyectosFiltrados = proyectos;
  const totalTrabajos = Array.isArray(memoria?.trabajos) ? memoria.trabajos.length : trabajos.length;
  const totalProyectos = Array.isArray(memoria?.proyectos) ? memoria.proyectos.length : proyectos.length;

  const formatDate = (dateString: string) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? "-" : d.toLocaleDateString("es-AR");
  };

  if (loadingMemoria && !memoria) {
    return <div className="min-h-screen flex items-center justify-center">Cargando memoria...</div>;
  }

  return (
    <div className="min-h-screen flex bg-[#f3f4f6] font-sans">
      <Sidebar />

      <main className="flex-1 px-4 py-6 md:px-12 md:py-8 bg-white overflow-y-auto h-screen w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 mt-12 md:mt-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
              Memoria Anual {memoria?.anio}
            </h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">
              {memoria?.contenido || "Sin descripcion disponible."}
            </p>
          </div>

          <div className="self-end md:self-auto">
            <UserPill />
          </div>
        </div>

        <div className="flex gap-4 md:gap-8 border-b border-gray-300 mb-8 overflow-x-auto">
          <button
            onClick={() => setTab("trabajos")}
            className={`pb-3 text-sm font-semibold transition whitespace-nowrap ${
              tab === "trabajos"
                ? "text-[#00c9a7] border-b-2 border-[#00c9a7]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Trabajos presentados ({totalTrabajos})
          </button>

          <button
            onClick={() => setTab("proyectos")}
            className={`pb-3 text-sm font-semibold transition whitespace-nowrap ${
              tab === "proyectos"
                ? "text-[#00c9a7] border-b-2 border-[#00c9a7]"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Proyectos vinculados ({totalProyectos})
          </button>
        </div>

        {tab === "trabajos" && (
          <>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
              <div className="relative w-full md:w-80">
                <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar trabajo..."
                  value={busquedaTrabajo}
                  onChange={(e) => setBusquedaTrabajo(e.target.value)}
                  className="w-full bg-[#f3f4f6] border border-[#e5e7eb] rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#00c9a7]"
                />
              </div>

              <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
                <div
                  className={`w-20 h-9 flex items-center rounded-full p-1 cursor-pointer transition-all flex-shrink-0 ${
                    modoGlobal ? "bg-[#00c9a7]" : "bg-gray-300"
                  }`}
                  onClick={() => setModoGlobal(!modoGlobal)}
                >
                  <div
                    className={`w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center overflow-hidden transition-all ${
                      modoGlobal ? "translate-x-11" : "translate-x-0"
                    }`}
                  >
                    {modoGlobal ? (
                      <img
                        src="/earth.png"
                        alt="Internacional"
                        className="w-full h-full object-cover rounded-full"
                      />
                    ) : (
                      <img
                        src="/arg.png"
                        alt="Argentina"
                        className="w-full h-full object-cover rounded-full"
                      />
                    )}
                  </div>
                </div>

                <button
                  onClick={handleOpenCreateTrabajo}
                  className="px-5 py-2 rounded-md text-sm font-medium text-white bg-[#00c9a7] hover:bg-[#00b197] whitespace-nowrap"
                >
                  + Anadir Trabajo
                </button>
              </div>
            </div>

            <div className="hidden md:block border border-gray-300 rounded-lg overflow-hidden overflow-x-auto">
              <div className="min-w-[900px]">
                <div className="grid grid-cols-5 bg-[#e5e7eb] border-b border-gray-300 text-sm font-medium text-gray-700">
                  <div className="px-4 py-3 border-r border-gray-300">Trabajo</div>
                  <div className="px-4 py-3 border-r border-gray-300">{modoGlobal ? "Pais" : "Ciudad"}</div>
                  <div className="px-4 py-3 border-r border-gray-300">Fecha</div>
                  <div className="px-4 py-3 border-r border-gray-300">Reunion</div>
                  <div className="px-4 py-3 text-center">Acciones</div>
                </div>

                {loadingTrabajos ? (
                  <div className="p-6 text-center text-gray-500">Cargando trabajos...</div>
                ) : trabajosFiltrados.length > 0 ? (
                  trabajosFiltrados.map((t, i) => (
                    <div
                      key={t.id || i}
                      className={`grid grid-cols-5 ${i % 2 === 0 ? "bg-[#f9fafb]" : "bg-[#f3f4f6]"}`}
                    >
                      <div className="px-4 py-4 border-r border-gray-300 text-sm truncate min-w-0" title={t.titulo}>
                        {t.titulo}
                      </div>
                      <div
                        className="px-4 py-4 border-r border-gray-300 text-sm truncate min-w-0"
                        title={modoGlobal ? t.pais : t.ciudad}
                      >
                        {modoGlobal ? t.pais : t.ciudad}
                      </div>
                      <div className="px-4 py-4 border-r border-gray-300 text-sm">
                        {formatDate(t.fecha_presentacion)}
                      </div>
                      <div className="px-4 py-4 border-r border-gray-300 text-sm truncate min-w-0" title={t.reunion}>
                        {t.reunion}
                      </div>
                      <div className="px-4 py-4 flex justify-center gap-5">
                        <HiOutlineEye
                          className="w-5 h-5 text-[#00c9a7] cursor-pointer hover:scale-110"
                          onClick={() => setVerTrabajo(t)}
                          title="Ver detalle"
                        />
                        <HiOutlineTrash
                          className="w-5 h-5 text-red-500 cursor-pointer hover:scale-110"
                          onClick={() => handleDeleteTrabajo(t.id)}
                          title="Eliminar trabajo"
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500">No se encontraron trabajos.</div>
                )}
              </div>
            </div>

            <div className="md:hidden space-y-3">
              {loadingTrabajos ? (
                <div className="p-6 text-center text-gray-500">Cargando trabajos...</div>
              ) : trabajosFiltrados.length > 0 ? (
                trabajosFiltrados.map((t, i) => (
                  <div
                    key={t.id || i}
                    className="rounded-xl border border-[#d6d9dd] bg-white shadow-sm overflow-hidden"
                  >
                    <div className="px-4 py-3 bg-[#f3f4f6] border-b border-[#e5e7eb]">
                      <p className="text-sm font-semibold text-gray-800 truncate" title={t.titulo}>
                        {t.titulo || "-"}
                      </p>
                    </div>
                    <div className="px-4 py-3 space-y-2 text-sm text-gray-700">
                      <div className="flex justify-between gap-3">
                        <span className="text-gray-500">{modoGlobal ? "Pais" : "Ciudad"}</span>
                        <span
                          className="font-medium text-right truncate max-w-[60%]"
                          title={modoGlobal ? t.pais : t.ciudad}
                        >
                          {modoGlobal ? t.pais || "-" : t.ciudad || "-"}
                        </span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-gray-500">Fecha</span>
                        <span className="font-medium">{formatDate(t.fecha_presentacion)}</span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-gray-500">Reunion</span>
                        <span className="font-medium text-right truncate max-w-[60%]" title={t.reunion}>
                          {t.reunion || "-"}
                        </span>
                      </div>
                    </div>
                    <div className="px-4 py-3 bg-[#fafafa] border-t border-[#e5e7eb] flex justify-end gap-4">
                      <HiOutlineEye
                        className="w-5 h-5 text-[#00c9a7] cursor-pointer hover:scale-110"
                        onClick={() => setVerTrabajo(t)}
                        title="Ver detalle"
                      />
                      <HiOutlineTrash
                        className="w-5 h-5 text-red-500 cursor-pointer hover:scale-110"
                        onClick={() => handleDeleteTrabajo(t.id)}
                        title="Eliminar trabajo"
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">No se encontraron trabajos.</div>
              )}
            </div>

            <div className="mt-6 flex justify-center items-center gap-4 text-gray-600 text-sm">
              <button
                onClick={() => {
                  const prev = cursorStackTrabajos[cursorStackTrabajos.length - 1] ?? null;
                  const newStack = cursorStackTrabajos.slice(0, -1);
                  setCursorStackTrabajos(newStack);
                  setCursorTrabajos(prev);
                  setPageTrabajos((p) => Math.max(1, p - 1));
                  fetchTrabajos({ cursor: prev, q: busquedaTrabajo });
                }}
                disabled={pageTrabajos === 1 || loadingTrabajos}
                className={`px-3 py-1 rounded border ${
                  pageTrabajos === 1 || loadingTrabajos
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                Anterior
              </button>

              <span className="px-3 py-1 rounded bg-[#27333d] text-white">Pagina {pageTrabajos}</span>

              <button
                onClick={() => {
                  if (!nextCursorTrabajos) return;
                  setCursorStackTrabajos((s) => [...s, cursorTrabajos ?? ""]);
                  setCursorTrabajos(nextCursorTrabajos);
                  setPageTrabajos((p) => p + 1);
                  fetchTrabajos({ cursor: nextCursorTrabajos, q: busquedaTrabajo });
                }}
                disabled={!hasMoreTrabajos || loadingTrabajos}
                className={`px-3 py-1 rounded border ${
                  !hasMoreTrabajos || loadingTrabajos
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                Siguiente
              </button>
            </div>
          </>
        )}

        {tab === "proyectos" && (
          <>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
              <div className="relative w-full md:w-80">
                <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Buscar proyecto"
                  value={busquedaProyecto}
                  onChange={(e) => setBusquedaProyecto(e.target.value)}
                  className="w-full bg-[#f3f4f6] border border-[#e5e7eb] rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#00c9a7]"
                />
              </div>
              <button
                onClick={handleOpenCreateProyecto}
                className="w-full md:w-auto px-5 py-2 rounded-md text-sm font-medium text-white bg-[#00c9a7] hover:bg-[#00b197]"
              >
                + Anadir Proyecto
              </button>
            </div>

            <div className="hidden md:block border border-gray-300 rounded-lg overflow-hidden overflow-x-auto">
              <div className="min-w-[700px]">
                <div className="grid grid-cols-4 bg-[#e5e7eb] border-b border-gray-300 text-sm font-medium text-gray-700">
                  <div className="px-4 py-3 border-r border-gray-300">Nombre del Proyecto</div>
                  <div className="px-4 py-3 border-r border-gray-300">Codigo</div>
                  <div className="px-4 py-3 border-r border-gray-300">Tipo de Proyecto</div>
                  <div className="px-4 py-3 text-center">Acciones</div>
                </div>

                {loadingProyectos ? (
                  <div className="p-6 text-center text-gray-500">Cargando proyectos...</div>
                ) : proyectosFiltrados.length > 0 ? (
                  proyectosFiltrados.map((p, i) => (
                    <div
                      key={p.id || i}
                      className={`grid grid-cols-4 ${i % 2 === 0 ? "bg-[#f9fafb]" : "bg-[#f3f4f6]"}`}
                    >
                      <div className="px-4 py-4 border-r border-gray-300 text-sm truncate min-w-0" title={p.nombre}>
                        {p.nombre}
                      </div>
                      <div className="px-4 py-4 border-r border-gray-300 text-sm truncate min-w-0" title={p.codigo}>
                        {p.codigo}
                      </div>
                      <div className="px-4 py-4 border-r border-gray-300 text-sm truncate min-w-0" title={p.tipo}>
                        {p.tipo}
                      </div>
                      <div className="px-4 py-4 flex justify-center gap-5">
                        <HiOutlineEye
                          className="w-5 h-5 text-[#00c9a7] cursor-pointer hover:scale-110"
                          onClick={() => setVerProyecto(p)}
                          title="Ver detalle"
                        />
                        <HiOutlineTrash
                          className="w-5 h-5 text-red-500 cursor-pointer hover:scale-110"
                          onClick={() => handleDeleteProyecto(p.id)}
                          title="Eliminar proyecto"
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500">No se encontraron proyectos.</div>
                )}
              </div>
            </div>

            <div className="md:hidden space-y-3">
              {loadingProyectos ? (
                <div className="p-6 text-center text-gray-500">Cargando proyectos...</div>
              ) : proyectosFiltrados.length > 0 ? (
                proyectosFiltrados.map((p, i) => (
                  <div
                    key={p.id || i}
                    className="rounded-xl border border-[#d6d9dd] bg-white shadow-sm overflow-hidden"
                  >
                    <div className="px-4 py-3 bg-[#f3f4f6] border-b border-[#e5e7eb]">
                      <p className="text-sm font-semibold text-gray-800 truncate" title={p.nombre}>
                        {p.nombre || "-"}
                      </p>
                    </div>
                    <div className="px-4 py-3 space-y-2 text-sm text-gray-700">
                      <div className="flex justify-between gap-3">
                        <span className="text-gray-500">Codigo</span>
                        <span className="font-medium text-right truncate max-w-[60%]" title={p.codigo}>
                          {p.codigo || "-"}
                        </span>
                      </div>
                      <div className="flex justify-between gap-3">
                        <span className="text-gray-500">Tipo</span>
                        <span className="font-medium text-right truncate max-w-[60%]" title={p.tipo}>
                          {p.tipo || "-"}
                        </span>
                      </div>
                    </div>
                    <div className="px-4 py-3 bg-[#fafafa] border-t border-[#e5e7eb] flex justify-end gap-4">
                      <HiOutlineEye
                        className="w-5 h-5 text-[#00c9a7] cursor-pointer hover:scale-110"
                        onClick={() => setVerProyecto(p)}
                        title="Ver detalle"
                      />
                      <HiOutlineTrash
                        className="w-5 h-5 text-red-500 cursor-pointer hover:scale-110"
                        onClick={() => handleDeleteProyecto(p.id)}
                        title="Eliminar proyecto"
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500">No se encontraron proyectos.</div>
              )}
            </div>

            <div className="mt-6 flex justify-center items-center gap-4 text-gray-600 text-sm">
              <button
                onClick={() => {
                  const prev = cursorStackProyectos[cursorStackProyectos.length - 1] ?? null;
                  const newStack = cursorStackProyectos.slice(0, -1);
                  setCursorStackProyectos(newStack);
                  setCursorProyectos(prev);
                  setPageProyectos((p) => Math.max(1, p - 1));
                  fetchProyectos({ cursor: prev, q: busquedaProyecto });
                }}
                disabled={pageProyectos === 1 || loadingProyectos}
                className={`px-3 py-1 rounded border ${
                  pageProyectos === 1 || loadingProyectos
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                Anterior
              </button>

              <span className="px-3 py-1 rounded bg-[#27333d] text-white">Pagina {pageProyectos}</span>

              <button
                onClick={() => {
                  if (!nextCursorProyectos) return;
                  setCursorStackProyectos((s) => [...s, cursorProyectos ?? ""]);
                  setCursorProyectos(nextCursorProyectos);
                  setPageProyectos((p) => p + 1);
                  fetchProyectos({ cursor: nextCursorProyectos, q: busquedaProyecto });
                }}
                disabled={!hasMoreProyectos || loadingProyectos}
                className={`px-3 py-1 rounded border ${
                  !hasMoreProyectos || loadingProyectos
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                Siguiente
              </button>
            </div>
          </>
        )}
      </main>

      {verTrabajo && (
        <ModalVerTrabajo
          open={!!verTrabajo}
          trabajo={verTrabajo}
          onClose={() => setVerTrabajo(null)}
          onEdit={(t) => handleEditTrabajo(t)}
        />
      )}

      {verProyecto && (
        <ModalVerProyecto
          open={!!verProyecto}
          proyecto={verProyecto}
          onClose={() => setVerProyecto(null)}
          onEdit={(p: any) => handleEditProyecto(p)}
        />
      )}

      <ConfirmModal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => {
          if (confirmAction) confirmAction();
          setConfirmOpen(false);
        }}
        message={confirmMessage}
      />

      <ErrorModal
        open={errorOpen}
        onClose={() => setErrorOpen(false)}
        title={errorTitle}
        description={errorDesc}
      />
    </div>
  );
}

export default withAuth(MemoriaDetallePage);
