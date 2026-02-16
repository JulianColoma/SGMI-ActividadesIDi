"use client";

import { useState, useEffect } from "react";
import Sidebar from "../components/sidebar";
import {
  HiOutlineUserCircle,
  HiOutlineSearch,
  HiOutlineTrash,
  HiOutlineEye,
} from "react-icons/hi";
import ModalTrabajo from "../components/modalTrabajo";
import ModalVerTrabajo from "../components/modalVerTrabajo";
import UserPill from "../components/userPill";
import { withAuth } from "../withAuth";
import ErrorModal from "../components/alerts/ErrorModal";
import ConfirmModal from "../components/alerts/ConfrimModal";
import Hint from "../components/alerts/Hint";

function TrabajosPage() {
  const [showError, setShowError] = useState(false);
  const [errorTitle, setErrorTitle] = useState("");
  const [errorDesc, setErrorDesc] = useState("");
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [modalDatos, setModalDatos] = useState(false);
  const [editInitialData, setEditInitialData] = useState<any | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [trabajoSeleccionado, setTrabajoSeleccionado] = useState<any | null>(
    null
  );
  const [openVer, setOpenVer] = useState(false);
  const [verTrabajo, setVerTrabajo] = useState<any | null>(null);
  const [modoGlobal, setModoGlobal] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const [trabajos, setTrabajos] = useState<any[]>([]);
  const [loadingTrabajos, setLoadingTrabajos] = useState(false);
  const [errorTrabajos, setErrorTrabajos] = useState<string | null>(null);



  const fetchTrabajos = async (opts?: { cursor?: string | null; reset?: boolean }) => {
    try {
      setErrorTrabajos(null);
      setLoadingTrabajos(true);

      const params = new URLSearchParams();
      // Si quisieras filtrar por grupoId, acá lo agregás:
      // params.set("grupoId", String(grupoId));

      if (opts?.cursor) params.set("cursor", opts.cursor);

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
        // ✅ Ahora el backend devuelve items, hasMore, nextCursor
        setTrabajos(Array.isArray(data.items) ? data.items : []);
        setHasMore(!!data.hasMore);
        setNextCursor(data.nextCursor ?? null);

        // Reset visual de paginado si corresponde
        if (opts?.reset) {
          setPage(1);
          setCursor(null);
          setCursorStack([]);
        }
      }
    } catch (e: any) {
      setErrorTrabajos(e.message || "Error en la petición");
      setTrabajos([]);
      setHasMore(false);
      setNextCursor(null);
    } finally {
      setLoadingTrabajos(false);
    }
  };


  useEffect(() => {
    fetchTrabajos();
  }, []);



  const filtrados = trabajos.filter((t) => {
    const tipo =
      t.reunion_tipo === "INTERNACIONAL" ? "internacional" : "nacional";
    return modoGlobal ? tipo === "internacional" : tipo === "nacional";
  });

  const trabajosFinal = filtrados.filter((t) => {
    const q = busqueda.toLowerCase().trim();
    return (t.titulo || "").toLowerCase().includes(q);
  });


  const [cursor, setCursor] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);

  // Para "Anterior" guardamos los cursores usados (stack)
  const [cursorStack, setCursorStack] = useState<string[]>([]);

  // Para mostrar “página 1,2,3…” (solo visual)
  const [page, setPage] = useState(1);

  const formatDateShort = (d: any) => {
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
              Gestión de Trabajos Presentados en Reuniones
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
              className={`
                w-20 h-9 flex items-center rounded-full p-1 cursor-pointer transition-all flex-shrink-0
                ${modoGlobal ? "bg-[#00c9a7]" : "bg-gray-300"}
              `}
            >
              <div
                className={`
                  w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center overflow-hidden transition-all
                  ${modoGlobal ? "translate-x-11" : "translate-x-0"}
                `}
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
              onClick={() => setModalDatos(true)}
              className="px-5 py-2 rounded-md text-sm font-medium text-white bg-[#00c9a7] hover:bg-[#00b197] whitespace-nowrap"
            >
              + Añadir Trabajo
            </button>
          </div>
        </div>

        <div className="border border-gray-300 rounded-lg overflow-hidden w-full overflow-x-auto">
          <div className="min-w-[900px]">
            <div className="grid grid-cols-5 bg-[#e5e7eb] border-b border-gray-300 text-sm font-medium text-gray-700">
              <div className="px-4 py-3 border-r border-gray-300">Trabajo</div>
              <div className="px-4 py-3 border-r border-gray-300">
                {modoGlobal ? "País" : "Ciudad"}
              </div>
              <div className="px-4 py-3 border-r border-gray-300">Fecha</div>
              <div className="px-4 py-3 border-r border-gray-300">Reunión</div>
              <div className="px-4 py-3">Acciones</div>
            </div>

            {loadingTrabajos ? (
              <div className="text-center py-6 text-gray-500">
                Cargando trabajos...
              </div>
            ) : trabajosFinal.length > 0 ? (
              trabajosFinal.map((t, i) => (
                <div
                  key={i}
                  className={`grid grid-cols-5 ${i % 2 === 0 ? "bg-[#f9fafb]" : "bg-[#f3f4f6]"
                    }`}
                >
                  <div className="px-4 py-4 border-r border-gray-300 text-gray-700 break-words">
                    {t.titulo || "-"}
                  </div>

                  <div className="px-4 py-4 border-r border-gray-300 text-gray-700 break-words">
                    {modoGlobal ? t.pais || "-" : t.ciudad || "-"}
                  </div>

                  <div className="px-4 py-4 border-r border-gray-300 text-gray-700">
                    {formatDateShort(t.fecha_presentacion || t.fecha_creacion)}
                  </div>

                  <div className="px-4 py-4 border-r border-gray-300 text-gray-700 break-words">
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

        <div className="mt-6 flex justify-center items-center gap-4 text-gray-600 text-sm">
          <button
            onClick={() => {
              // volvemos al cursor anterior
              const prev = cursorStack[cursorStack.length - 1] ?? null;
              const newStack = cursorStack.slice(0, -1);
              setCursorStack(newStack);

              setCursor(prev);
              setPage((p) => Math.max(1, p - 1));

              fetchTrabajos({ cursor: prev });
            }}
            disabled={page === 1 || loadingTrabajos}
            className={`px-3 py-1 rounded border ${page === 1 || loadingTrabajos
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
          >
            ← Anterior
          </button>

          <span className="px-3 py-1 rounded bg-[#27333d] text-white">
            Página {page}
          </span>

          <button
            onClick={() => {
              if (!nextCursor) return;

              // guardamos el cursor actual para poder volver
              setCursorStack((s) => [...s, cursor ?? ""]);

              setCursor(nextCursor);
              setPage((p) => p + 1);

              fetchTrabajos({ cursor: nextCursor });
            }}
            disabled={!hasMore || loadingTrabajos}
            className={`px-3 py-1 rounded border ${!hasMore || loadingTrabajos
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
          >
            Siguiente →
          </button>
        </div>


        {modalDatos && (
          <ModalTrabajo
            open={modalDatos}
            modoInicial={modoGlobal ? "internacional" : "nacional"}
            initialData={editInitialData || undefined}
            editId={editId}
            onClose={() => {
              setModalDatos(false);
              setEditInitialData(null);
              setEditId(null);
            }}
            onSave={(data: any) => {
              if (data?.success) fetchTrabajos();
              else fetchTrabajos();
              setEditInitialData(null);
              setEditId(null);
            }}
          />
        )}

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
                await fetchTrabajos();
              } else {
                setErrorTitle("No se pudo eliminar");
                setErrorDesc(data.error || data.message || "Intente nuevamente");
                setShowError(true);
              }
            } catch (e: any) {
              setErrorTitle("Error en el servidor");
              setErrorDesc(e.message || "Error desconocido");
              setShowError(true);
            } finally {
              setShowConfirmDelete(false);
              setTrabajoSeleccionado(null);
            }
          }}
          message={`¿Está seguro de eliminar el trabajo "${trabajoSeleccionado?.titulo ?? ""}"?`}
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
          onEdit={(t: any) => {
            setOpenVer(false);
            setVerTrabajo(null);
            setEditInitialData(t);
            setEditId(t?.id ?? null);
            setModalDatos(true);
          }}
        />
      </main>
    </div>
  );
}

export default withAuth(TrabajosPage);