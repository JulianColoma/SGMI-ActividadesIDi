"use client";

import Sidebar from "@/app/components/sidebar";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  HiOutlineEye,
  HiOutlineTrash,
  HiOutlineSearch,
  HiChevronLeft,
  HiChevronRight,
} from "react-icons/hi";
import UserPill from "../components/userPill";
import { withAuth } from "../withAuth";
import ModalAddMemoria from "@/app/components/modalMemoria";
import ModalAddGrupo from "@/app/components/modalGrupo";
import ErrorModal from "@/app/components/alerts/ErrorModal";
import { Toast } from "@/app/lib/swal";
import ConfirmModal from "@/app/components/alerts/ConfrimModal";

interface Memoria {
  id: number;
  anio: number;
  grupo_id: number;
  contenido?: string;
}

interface GrupoItem {
  id: number;
  nombre: string;
}

interface GrupoMemoriaState {
  items: Memoria[];
  loading: boolean;
  cursor: string | null;
  nextCursor: string | null;
  hasMore: boolean;
  cursorStack: string[];
  page: number;
}

function MemoriasPage() {
  const router = useRouter();

  const [grupos, setGrupos] = useState<GrupoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  const [cursor, setCursor] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [page, setPage] = useState(1);

  const [memoriasByGrupo, setMemoriasByGrupo] = useState<Record<number, GrupoMemoriaState>>({});

  const [isModalMemoriaOpen, setIsModalMemoriaOpen] = useState(false);
  const [grupoSeleccionadoId, setGrupoSeleccionadoId] = useState<number | null>(null);
  const [isModalGrupoOpen, setIsModalGrupoOpen] = useState(false);

  const [errorOpen, setErrorOpen] = useState(false);
  const [errorTitle, setErrorTitle] = useState("");
  const [errorDesc, setErrorDesc] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState<null | (() => void)>(null);

 const showError = (title: string, desc: any) => {
  let finalDesc = desc;
  if (Array.isArray(desc)) {
    finalDesc = desc.map(d => d.message || JSON.stringify(d)).join(", ");
  } else if (typeof desc === 'object' && desc !== null) {
    finalDesc = desc.message || JSON.stringify(desc);
  }
  setErrorTitle(title);
  setErrorDesc(String(finalDesc));
  setErrorOpen(true);
};


  const fetchMemoriasGrupo = async (
    grupoId: number,
    opts?: { cursor?: string | null; reset?: boolean }
  ) => {
    setMemoriasByGrupo((prev) => {
      const curr = prev[grupoId];
      return {
        ...prev,
        [grupoId]: {
          items: curr?.items ?? [],
          loading: true,
          cursor: opts?.reset ? null : (opts?.cursor ?? curr?.cursor ?? null),
          nextCursor: curr?.nextCursor ?? null,
          hasMore: curr?.hasMore ?? false,
          cursorStack: opts?.reset ? [] : (curr?.cursorStack ?? []),
          page: opts?.reset ? 1 : (curr?.page ?? 1),
        },
      };
    });

    try {
      const params = new URLSearchParams();
      params.set("grupoId", String(grupoId));
      if (opts?.cursor) params.set("cursor", opts.cursor);

      const res = await fetch(`/api/memoria?${params.toString()}`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setMemoriasByGrupo((prev) => ({
          ...prev,
          [grupoId]: {
            ...(prev[grupoId] ?? {
              items: [],
              cursor: null,
              nextCursor: null,
              hasMore: false,
              cursorStack: [],
              page: 1,
            }),
            loading: false,
            items: [],
            hasMore: false,
            nextCursor: null,
          },
        }));
        return;
      }

      setMemoriasByGrupo((prev) => ({
        ...prev,
        [grupoId]: {
          ...(prev[grupoId] ?? {
            cursor: null,
            cursorStack: [],
            page: 1,
          }),
          items: Array.isArray(data.items) ? data.items : [],
          loading: false,
          hasMore: !!data.hasMore,
          nextCursor: data.nextCursor ?? null,
          cursor: opts?.reset ? null : (opts?.cursor ?? prev[grupoId]?.cursor ?? null),
          cursorStack: opts?.reset ? [] : (prev[grupoId]?.cursorStack ?? []),
          page: opts?.reset ? 1 : (prev[grupoId]?.page ?? 1),
        },
      }));
    } catch {
      setMemoriasByGrupo((prev) => ({
        ...prev,
        [grupoId]: {
          ...(prev[grupoId] ?? {
            items: [],
            cursor: null,
            nextCursor: null,
            hasMore: false,
            cursorStack: [],
            page: 1,
          }),
          loading: false,
        },
      }));
    }
  };

  const fetchGrupos = async (opts?: { cursor?: string | null; reset?: boolean; q?: string }) => {
    try {
      setLoading(true);

      const params = new URLSearchParams();
      params.set("paginado", "1");
      if (opts?.cursor) params.set("cursor", opts.cursor);
      if (opts?.q?.trim()) params.set("q", opts.q.trim());

      const response = await fetch(`/api/grupo?${params.toString()}`, { credentials: "include" });
      if (!response.ok) throw new Error("Error al cargar grupos");

      const res = await response.json();
      if (!res.success) throw new Error(res.error || "Error al cargar grupos");

      const items: GrupoItem[] = Array.isArray(res.items) ? res.items : [];
      setGrupos(items);
      setHasMore(!!res.hasMore);
      setNextCursor(res.nextCursor ?? null);

      if (opts?.reset) {
        setPage(1);
        setCursor(null);
        setCursorStack([]);
      }

      setMemoriasByGrupo({});
      await Promise.all(items.map((g) => fetchMemoriasGrupo(g.id, { reset: true })));
    } catch (error) {
      console.error("Error fetching memorias:", error);
      setGrupos([]);
      setHasMore(false);
      setNextCursor(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchGrupos({ reset: true, q: busqueda });
    }, 300);
    return () => clearTimeout(timer);
  }, [busqueda]);

  const deleteGrupo = async (grupoId: number) => {
    try {
      const res = await fetch(`/api/grupo/${grupoId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.json();
        showError("Error al eliminar grupo", err.error || "No se pudo eliminar el grupo.");
        return;
      }

      await fetchGrupos({ cursor, q: busqueda });
    } catch {
      showError("Error de conexion", "No se pudo contactar al servidor.");
    }
  };

  const handleDeleteGrupo = (grupoId: number) => {
    setConfirmMessage(
      "Estas seguro de que deseas eliminar este grupo y todas sus memorias? Esta accion no se puede deshacer."
    );
    setConfirmAction(() => () => deleteGrupo(grupoId));
    setConfirmOpen(true);
  };

  const handleSaveGrupo = async (data: { nombre: string }) => {
    try {
      const res = await fetch("/api/grupo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: data.nombre }),
      });

      if (!res.ok) {
        const err = await res.json();
        showError("Error al crear grupo", err.error || "No se pudo crear el grupo.");
        return;
      }

      try {
        await Toast.fire({ icon: "success", title: "Grupo creado con exito" });
      } catch {}
      setIsModalGrupoOpen(false);
      await fetchGrupos({ cursor, q: busqueda });
    } catch {
      showError("Error de conexion", "No se pudo contactar al servidor.");
    }
  };

  const handleOpenModalMemoria = (grupoId: number) => {
    setGrupoSeleccionadoId(grupoId);
    setIsModalMemoriaOpen(true);
  };

  const deleteMemoria = async (memoriaId: number, grupoId: number) => {
    try {
      const res = await fetch(`/api/memoria/${memoriaId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.json();
        showError("Error al eliminar memoria", err.error || "No se pudo eliminar la memoria.");
        return;
      }

      const groupState = memoriasByGrupo[grupoId];
      await fetchMemoriasGrupo(grupoId, { cursor: groupState?.cursor ?? null });
    } catch {
      showError("Error de conexion", "No se pudo contactar al servidor.");
    }
  };

  const handleDeleteMemoria = (memoriaId: number, grupoId: number) => {
    setConfirmMessage(
      "Estas seguro de que deseas eliminar esta memoria con sus Trabajos y Proyectos? Esta accion no se puede deshacer."
    );
    setConfirmAction(() => () => deleteMemoria(memoriaId, grupoId));
    setConfirmOpen(true);
  };

  const handleSaveMemoria = async (data: { anio: number; contenido: string }) => {
    if (!grupoSeleccionadoId) return;

    try {
      const res = await fetch("/api/memoria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grupo_id: grupoSeleccionadoId,
          anio: data.anio,
          contenido: data.contenido,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        showError("Error al guardar memoria", err.error || "No se pudo guardar.");
        return;
      }

      try {
        await Toast.fire({ icon: "success", title: "Memoria creada con exito" });
      } catch {}
      setIsModalMemoriaOpen(false);
      setGrupoSeleccionadoId(null);
      await fetchMemoriasGrupo(grupoSeleccionadoId, { reset: true });
    } catch {
      showError("Error de conexion", "No se pudo contactar al servidor.");
    }
  };

  return (
    <div className="min-h-screen flex bg-[#f3f4f6] font-sans">
      <Sidebar />

      <main className="flex-1 px-4 py-6 md:px-12 md:py-8 bg-white overflow-y-auto h-screen">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8 gap-4 mt-12 md:mt-0">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">Gestion de memorias</h1>
          <div className="self-end md:self-auto">
            <UserPill />
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <div className="relative w-full md:w-80">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />

            <input
              type="text"
              placeholder="Buscar grupo"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-[#f3f4f6] border border-[#e5e7eb] rounded-full pl-9 pr-4 py-2 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#00c9a7]"
            />
          </div>

          <button
            onClick={() => setIsModalGrupoOpen(true)}
            className="w-full md:w-auto px-5 py-2 rounded-md text-sm font-medium text-white bg-[#00c9a7] shadow-sm hover:bg-[#00b197]"
          >
            + Anadir Grupo
          </button>
        </div>

        {loading && <p className="text-gray-500 text-center py-4">Cargando grupos...</p>}

        {!loading &&
          grupos.map((grupo) => {
            const memState = memoriasByGrupo[grupo.id] ?? {
              items: [],
              loading: true,
              cursor: null,
              nextCursor: null,
              hasMore: false,
              cursorStack: [],
              page: 1,
            };

            return (
              <div key={grupo.id} className="mb-6 md:mb-10">
                <div className="bg-[#d3d3d3] px-4 py-3 rounded-t-lg font-semibold flex justify-between items-center">
                  <span
                    className="text-sm md:text-base truncate max-w-[85%]"
                    title={grupo.nombre}
                  >
                    {grupo.nombre}
                  </span>
                  <span>
                    <HiOutlineTrash
                      className="w-5 h-5 md:w-6 md:h-6 text-grey-500 cursor-pointer hover:scale-110 transition-transform ml-2"
                      title="Eliminar grupo"
                      onClick={() => handleDeleteGrupo(grupo.id)}
                    />
                  </span>
                </div>

                {memState.loading ? (
                  <div className="bg-white px-4 py-3 border-b text-gray-500 text-sm md:text-base">
                    Cargando memorias...
                  </div>
                ) : memState.items.length > 0 ? (
                  memState.items.map((mem) => (
                    <div
                      key={mem.id}
                      className="bg-white px-4 py-3 border-b flex justify-between items-center hover:bg-gray-50 transition-colors"
                    >
                      <span className="text-gray-700 text-sm md:text-base">Memoria Anual {mem.anio}</span>

                      <div className="flex gap-4">
                        <HiOutlineEye
                          className="w-5 h-5 md:w-6 md:h-6 text-[#00c9a7] cursor-pointer hover:text-[#009e84]"
                          onClick={() => router.push(`/memorias/${mem.id}`)}
                          title="Ver detalles"
                        />

                        <HiOutlineTrash
                          className="w-5 h-5 md:w-6 md:h-6 text-red-500 cursor-pointer hover:text-red-700"
                          title="Eliminar memoria"
                          onClick={() => handleDeleteMemoria(mem.id, grupo.id)}
                        />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white px-4 py-3 border-b text-gray-400 italic text-sm md:text-base">
                    No hay memorias cargadas para este grupo.
                  </div>
                )}

                <div className="bg-[#ededed] px-4 py-3 rounded-b-lg flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <button
                    className="bg-[#00c9a7] text-white px-3 py-1 rounded-md text-sm hover:bg-[#00b092] transition-colors w-full md:w-auto"
                    onClick={() => handleOpenModalMemoria(grupo.id)}
                  >
                    + Agregar Memoria
                  </button>

                  <div className="flex items-center justify-center md:justify-end gap-2 text-sm">
                    <button
                      onClick={() => {
                        const prev = memState.cursorStack[memState.cursorStack.length - 1] ?? null;
                        const newStack = memState.cursorStack.slice(0, -1);
                        setMemoriasByGrupo((prevState) => ({
                          ...prevState,
                          [grupo.id]: {
                            ...memState,
                            cursorStack: newStack,
                            cursor: prev,
                            page: Math.max(1, memState.page - 1),
                          },
                        }));
                        fetchMemoriasGrupo(grupo.id, { cursor: prev });
                      }}
                      disabled={memState.page === 1 || memState.loading}
                      className={`w-9 h-9 rounded-full border flex items-center justify-center transition ${
                        memState.page === 1 || memState.loading
                          ? "bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100 shadow-sm"
                      }`}
                      aria-label="Pagina anterior de memorias"
                    >
                      <HiChevronLeft className="w-5 h-5" />
                    </button>

                    <span className="min-w-9 h-9 px-2 rounded-full bg-[#27333d] text-white flex items-center justify-center font-semibold shadow-sm">
                      {memState.page}
                    </span>

                    <button
                      onClick={() => {
                        if (!memState.nextCursor) return;
                        setMemoriasByGrupo((prevState) => ({
                          ...prevState,
                          [grupo.id]: {
                            ...memState,
                            cursorStack: [...memState.cursorStack, memState.cursor ?? ""],
                            cursor: memState.nextCursor,
                            page: memState.page + 1,
                          },
                        }));
                        fetchMemoriasGrupo(grupo.id, { cursor: memState.nextCursor });
                      }}
                      disabled={!memState.hasMore || memState.loading}
                      className={`w-9 h-9 rounded-full border flex items-center justify-center transition ${
                        !memState.hasMore || memState.loading
                          ? "bg-gray-100 text-gray-300 border-gray-200 cursor-not-allowed"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100 shadow-sm"
                      }`}
                      aria-label="Pagina siguiente de memorias"
                    >
                      <HiChevronRight className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

        {!loading && (
          <div className="mt-2 mb-8 flex justify-center items-center gap-4 text-gray-600 text-sm">
            <button
              onClick={() => {
                const prev = cursorStack[cursorStack.length - 1] ?? null;
                const newStack = cursorStack.slice(0, -1);
                setCursorStack(newStack);
                setCursor(prev);
                setPage((p) => Math.max(1, p - 1));
                fetchGrupos({ cursor: prev, q: busqueda });
              }}
              disabled={page === 1 || loading}
              className={`px-3 py-1 rounded border ${
                page === 1 || loading
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Anterior
            </button>

            <span className="px-3 py-1 rounded bg-[#27333d] text-white">Pagina {page}</span>

            <button
              onClick={() => {
                if (!nextCursor) return;
                setCursorStack((s) => [...s, cursor ?? ""]);
                setCursor(nextCursor);
                setPage((p) => p + 1);
                fetchGrupos({ cursor: nextCursor, q: busqueda });
              }}
              disabled={!hasMore || loading}
              className={`px-3 py-1 rounded border ${
                !hasMore || loading
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Siguiente
            </button>
          </div>
        )}
      </main>

      <ModalAddMemoria
        open={isModalMemoriaOpen}
        onClose={() => setIsModalMemoriaOpen(false)}
        onSave={handleSaveMemoria}
      />

      <ModalAddGrupo open={isModalGrupoOpen} onClose={() => setIsModalGrupoOpen(false)} onSave={handleSaveGrupo} />

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

export default withAuth(MemoriasPage);
