"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HiOutlineEye, HiOutlineSearch, HiOutlineTrash } from "react-icons/hi";
import Sidebar from "../components/sidebar";
import ModalVerTrabajo from "../components/modalVerTrabajo";
import UserPill from "../components/userPill";
import { withAuth } from "../withAuth";
import ErrorModal from "../components/alerts/ErrorModal";
import ConfirmModal from "../components/alerts/ConfrimModal";

interface TrabajoItem {
  id?: number;
  titulo?: string;
  pais?: string;
  ciudad?: string;
  reunion?: string;
  reunion_id?: number | string;
  reunion_tipo?: string;
  fecha_presentacion?: string;
  fecha_creacion?: string;
}

function TrabajosPage() {
  const router = useRouter();

  const [showError, setShowError] = useState(false);
  const [errorTitle, setErrorTitle] = useState("");
  const [errorDesc, setErrorDesc] = useState("");
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [trabajoSeleccionado, setTrabajoSeleccionado] = useState<TrabajoItem | null>(
    null
  );
  const [openVer, setOpenVer] = useState(false);
  const [verTrabajo, setVerTrabajo] = useState<TrabajoItem | null>(null);
  const [modoGlobal, setModoGlobal] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const [trabajos, setTrabajos] = useState<TrabajoItem[]>([]);
  const [loadingTrabajos, setLoadingTrabajos] = useState(false);
  const [errorTrabajos, setErrorTrabajos] = useState<string | null>(null);

  const [cursor, setCursor] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const fetchTrabajos = async (opts?: { cursor?: string | null; reset?: boolean; q?: string }) => {
    try {
      setErrorTrabajos(null);
      setLoadingTrabajos(true);

      const params = new URLSearchParams();
      if (opts?.cursor) params.set("cursor", opts.cursor);
      if (opts?.q?.trim()) params.set("q", opts.q.trim());

      const res = await fetch(`/api/trabajo?${params.toString()}`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorTrabajos(data.error || data.message || "Error al obtener trabajos");
        setTrabajos([]);
        setHasMore(false);
        setNextCursor(null);
      } else {
        setTrabajos(Array.isArray(data.items) ? data.items : []);
        setHasMore(!!data.hasMore);
        setNextCursor(data.nextCursor ?? null);

        if (opts?.reset) {
          setPage(1);
          setCursor(null);
          setCursorStack([]);
        }
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Error en la peticion";
      setErrorTrabajos(message);
      setTrabajos([]);
      setHasMore(false);
      setNextCursor(null);
    } finally {
      setLoadingTrabajos(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTrabajos({ reset: true, q: busqueda });
    }, 350);
    return () => clearTimeout(timer);
  }, [busqueda]);

  const filtrados = trabajos.filter((t) => {
    const tipo =
      t.reunion_tipo === "INTERNACIONAL" ? "internacional" : "nacional";
    return modoGlobal ? tipo === "internacional" : tipo === "nacional";
  });

  const trabajosFinal = filtrados;

  const formatDateShort = (d?: string) => {
    if (!d) return "-";
    const date = new Date(d);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen flex bg-[#f3f4f6] font-sans">
      <Sidebar />

      <main className="flex-1 px-4 py-6 md:px-12 md:py-8 bg-white overflow-y-auto h-screen w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-10 gap-4 mt-12 md:mt-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
              Gestion de Trabajos Presentados en Reuniones
            </h1>
          </div>

          <div className="self-end md:self-auto">
            <UserPill />
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <div className="relative w-full md:w-80">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar trabajo"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-[#f3f4f6] border border-[#e5e7eb] rounded-full pl-9 pr-4 py-2 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#00c9a7]"
            />
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
            <div
              onClick={() => setModoGlobal(!modoGlobal)}
              className={`w-20 h-9 flex items-center rounded-full p-1 cursor-pointer transition-all flex-shrink-0 ${
                modoGlobal ? "bg-[#00c9a7]" : "bg-gray-300"
              }`}
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
                    alt="Nacional"
                    className="w-full h-full object-cover rounded-full"
                  />
                )}
              </div>
            </div>

            <button
              onClick={() => router.push("/trabajos/nuevo")}
              className="px-5 py-2 rounded-md text-sm font-medium text-white bg-[#00c9a7] hover:bg-[#00b197] whitespace-nowrap"
            >
              + Anadir Trabajo
            </button>
          </div>
        </div>

        {errorTrabajos && (
          <div className="mb-4 text-red-600 text-sm">{errorTrabajos}</div>
        )}

        <div className="hidden md:block border border-gray-300 rounded-lg overflow-hidden w-full overflow-x-auto">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-5 bg-[#e5e7eb] border-b border-gray-300 text-sm font-medium text-gray-700">
              <div className="px-4 py-3 border-r border-gray-300">Trabajo</div>
              <div className="px-4 py-3 border-r border-gray-300">
                {modoGlobal ? "Pais" : "Ciudad"}
              </div>
              <div className="px-4 py-3 border-r border-gray-300">Fecha</div>
              <div className="px-4 py-3 border-r border-gray-300">Reunion</div>
              <div className="px-4 py-3">Acciones</div>
            </div>

            {loadingTrabajos ? (
              <div className="text-center py-6 text-gray-500">Cargando trabajos...</div>
            ) : trabajosFinal.length > 0 ? (
              trabajosFinal.map((t, i) => (
                <div
                  key={t.id ?? i}
                  className={`grid grid-cols-5 ${i % 2 === 0 ? "bg-[#f9fafb]" : "bg-[#f3f4f6]"}`}
                >
                  <div
                    className="px-4 py-4 border-r border-gray-300 text-gray-700 truncate"
                    title={t.titulo || "-"}
                  >
                    {t.titulo || "-"}
                  </div>

                  <div
                    className="px-4 py-4 border-r border-gray-300 text-gray-700 truncate"
                    title={modoGlobal ? t.pais || "-" : t.ciudad || "-"}
                  >
                    {modoGlobal ? t.pais || "-" : t.ciudad || "-"}
                  </div>

                  <div className="px-4 py-4 border-r border-gray-300 text-gray-700">
                    {formatDateShort(t.fecha_presentacion || t.fecha_creacion)}
                  </div>

                  <div
                    className="px-4 py-4 border-r border-gray-300 text-gray-700 truncate"
                    title={String(t.reunion || t.reunion_id || "-")}
                  >
                    {t.reunion || t.reunion_id || "-"}
                  </div>

                  <div className="px-4 py-4 flex items-center gap-4">
                    <HiOutlineEye
                      onClick={() => {
                        setVerTrabajo(t);
                        setOpenVer(true);
                      }}
                      className="w-6 h-6 text-[#00c9a7] cursor-pointer hover:text-[#009e84]"
                      title="Ver detalles"
                    />

                    <HiOutlineTrash
                      onClick={() => {
                        setTrabajoSeleccionado(t);
                        setShowConfirmDelete(true);
                      }}
                      className="w-6 h-6 text-red-500 cursor-pointer hover:text-red-700"
                      title="Eliminar"
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-500">
                No hay trabajos para mostrar
              </div>
            )}
          </div>
        </div>

        <div className="md:hidden space-y-3">
          {loadingTrabajos ? (
            <div className="text-center py-6 text-gray-500">Cargando trabajos...</div>
          ) : trabajosFinal.length > 0 ? (
            trabajosFinal.map((t, i) => (
              <div
                key={t.id ?? i}
                className="rounded-xl border border-[#d6d9dd] bg-white shadow-sm overflow-hidden"
              >
                <div className="px-4 py-3 bg-[#f3f4f6] border-b border-[#e5e7eb]">
                  <p className="text-sm font-semibold text-gray-800 truncate" title={t.titulo || "-"}>
                    {t.titulo || "-"}
                  </p>
                </div>
                <div className="px-4 py-3 space-y-2 text-sm text-gray-700">
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-500">{modoGlobal ? "Pais" : "Ciudad"}</span>
                    <span
                      className="font-medium text-right truncate max-w-[60%]"
                      title={modoGlobal ? t.pais || "-" : t.ciudad || "-"}
                    >
                      {modoGlobal ? t.pais || "-" : t.ciudad || "-"}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-500">Fecha</span>
                    <span className="font-medium">{formatDateShort(t.fecha_presentacion || t.fecha_creacion)}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-500">Reunion</span>
                    <span
                      className="font-medium text-right truncate max-w-[60%]"
                      title={String(t.reunion || t.reunion_id || "-")}
                    >
                      {t.reunion || t.reunion_id || "-"}
                    </span>
                  </div>
                </div>
                <div className="px-4 py-3 bg-[#fafafa] border-t border-[#e5e7eb] flex justify-end gap-4">
                  <HiOutlineEye
                    onClick={() => {
                      setVerTrabajo(t);
                      setOpenVer(true);
                    }}
                    className="w-6 h-6 text-[#00c9a7] cursor-pointer hover:text-[#009e84]"
                    title="Ver detalles"
                  />
                  <HiOutlineTrash
                    onClick={() => {
                      setTrabajoSeleccionado(t);
                      setShowConfirmDelete(true);
                    }}
                    className="w-6 h-6 text-red-500 cursor-pointer hover:text-red-700"
                    title="Eliminar"
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-6 text-gray-500">No hay trabajos para mostrar</div>
          )}
        </div>

        <div className="mt-6 flex justify-center items-center gap-4 text-gray-600 text-sm">
          <button
            onClick={() => {
              const prev = cursorStack[cursorStack.length - 1] ?? null;
              const newStack = cursorStack.slice(0, -1);
              setCursorStack(newStack);
              setCursor(prev);
              setPage((p) => Math.max(1, p - 1));
              fetchTrabajos({ cursor: prev, q: busqueda });
            }}
            disabled={page === 1 || loadingTrabajos}
            className={`px-3 py-1 rounded border ${
              page === 1 || loadingTrabajos
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Anterior
          </button>

          <span className="px-3 py-1 rounded bg-[#27333d] text-white">
            Pagina {page}
          </span>

          <button
            onClick={() => {
              if (!nextCursor) return;
              setCursorStack((s) => [...s, cursor ?? ""]);
              setCursor(nextCursor);
              setPage((p) => p + 1);
              fetchTrabajos({ cursor: nextCursor, q: busqueda });
            }}
            disabled={!hasMore || loadingTrabajos}
            className={`px-3 py-1 rounded border ${
              !hasMore || loadingTrabajos
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-100"
            }`}
          >
            Siguiente
          </button>
        </div>

        <ConfirmModal
          open={showConfirmDelete}
          onClose={() => {
            setShowConfirmDelete(false);
            setTrabajoSeleccionado(null);
          }}
          onConfirm={async () => {
            if (!trabajoSeleccionado?.id) {
              setShowConfirmDelete(false);
              return;
            }

            try {
              const res = await fetch(`/api/trabajo/${trabajoSeleccionado.id}`, {
                method: "DELETE",
                credentials: "include",
              });

              const data = await res.json();

              if (res.ok && data.success) {
                await fetchTrabajos({ cursor, q: busqueda });
              } else {
                setErrorTitle("No se pudo eliminar");
                setErrorDesc(data.error || data.message || "Intente nuevamente");
                setShowError(true);
              }
            } catch (e: unknown) {
              const message = e instanceof Error ? e.message : "Error desconocido";
              setErrorTitle("Error en el servidor");
              setErrorDesc(message);
              setShowError(true);
            } finally {
              setShowConfirmDelete(false);
              setTrabajoSeleccionado(null);
            }
          }}
          message={`Estas seguro de eliminar el trabajo "${trabajoSeleccionado?.titulo ?? ""}"?`}
        />

        <ErrorModal
          open={showError}
          onClose={() => setShowError(false)}
          title={errorTitle}
          description={errorDesc}
        />

        <ModalVerTrabajo
          open={openVer}
          trabajo={verTrabajo}
          onClose={() => {
            setOpenVer(false);
            setVerTrabajo(null);
          }}
          onEdit={(t) => {
            setOpenVer(false);
            setVerTrabajo(null);
            if (t?.id) router.push(`/trabajos/editar/${t.id}`);
          }}
        />
      </main>
    </div>
  );
}

export default withAuth(TrabajosPage);
