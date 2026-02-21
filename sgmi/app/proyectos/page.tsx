"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HiOutlineSearch, HiOutlineTrash, HiOutlineEye } from "react-icons/hi";
import Sidebar from "../components/sidebar";
import ModalVerProyecto from "../components/modalVerProyecto";
import UserPill from "../components/userPill";
import { withAuth } from "../withAuth";
import ErrorModal from "../components/alerts/ErrorModal";
import ConfirmModal from "../components/alerts/ConfrimModal";

type Proyecto = {
  id: number;
  nombre: string;
  codigo: string;
  tipo: string;
  memoria_id?: number;
};

function ProyectosPage() {
  const router = useRouter();
  const [showError, setShowError] = useState(false);
  const [errorTitle, setErrorTitle] = useState("");
  const [errorDesc, setErrorDesc] = useState("");
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [modalVer, setModalVer] = useState(false);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState<Proyecto | null>(
    null
  );

  const [cursor, setCursor] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [cursorStack, setCursorStack] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProyectos = async (opts?: { cursor?: string | null; reset?: boolean }) => {
    try {
      setError(null);
      setLoading(true);
      if (opts?.reset) {
        setPage(1);
        setCursor(null);
        setCursorStack([]);
      }

      const params = new URLSearchParams();
      if (opts?.cursor) params.set("cursor", opts.cursor);

      const res = await fetch(`/api/investigacion?${params.toString()}`, {
        method: "GET",
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || data.message || "Error al obtener proyectos");
        setProyectos([]);
        setHasMore(false);
        setNextCursor(null);
        return;
      }

      setProyectos(Array.isArray(data.items) ? data.items : []);
      setHasMore(!!data.hasMore);
      setNextCursor(data.nextCursor ?? null);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Error en la peticion";
      setError(message);
      setProyectos([]);
      setHasMore(false);
      setNextCursor(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProyectos({ reset: true });
  }, []);

  async function handleDeleteConfirm() {
    if (!proyectoSeleccionado) return;
    try {
      const res = await fetch(`/api/investigacion/${proyectoSeleccionado.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrorTitle("No se pudo eliminar");
        setErrorDesc(json.error || json.message || "Intente nuevamente");
        setShowError(true);
      } else {
        await fetchProyectos({ reset: true });
      }
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Error al eliminar";
      setErrorTitle("Error al eliminar");
      setErrorDesc(message);
      setShowError(true);
    } finally {
      setShowConfirmDelete(false);
      setProyectoSeleccionado(null);
    }
  }

  const proyectosFiltrados = proyectos.filter((p) =>
    (p.nombre || "").toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.codigo || "").toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.tipo || "").toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="min-h-screen flex bg-[#f3f4f6] font-sans">
      <Sidebar />

      <main className="flex-1 px-4 py-6 md:px-12 md:py-8 bg-white overflow-y-auto h-screen w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-10 gap-4 mt-12 md:mt-0">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 whitespace-nowrap">
            Gestion de Proyectos de I+D+i
          </h1>
          <div className="self-end md:self-auto">
            <UserPill />
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
          <div className="relative w-full md:w-80">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar proyecto"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-[#f3f4f6] border border-[#e5e7eb] rounded-full pl-9 pr-4 py-2 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#00c9a7]"
            />
          </div>

          <button
            onClick={() => router.push("/proyectos/nuevo")}
            className="w-full md:w-auto px-5 py-2 rounded-md text-sm font-medium text-white bg-[#00c9a7] shadow-sm hover:bg-[#00b197]"
          >
            + Anadir Proyecto
          </button>
        </div>

        <div className="border border-gray-300 rounded-lg overflow-hidden w-full overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-4 bg-[#e5e7eb] border-b border-gray-300 text-sm font-medium text-gray-700">
              <div className="px-4 py-3 border-r border-gray-300">Nombre del Proyecto</div>
              <div className="px-4 py-3 border-r border-gray-300">Codigo</div>
              <div className="px-4 py-3 border-r border-gray-300">Tipo de Proyecto</div>
              <div className="px-4 py-3">Acciones</div>
            </div>

            {loading && (
              <div className="p-6 text-center text-sm text-gray-600">Cargando proyectos...</div>
            )}

            {error && !loading && (
              <div className="p-6 text-center text-sm text-red-600">Error: {error}</div>
            )}

            {!loading && !error && proyectos.length === 0 && (
              <div className="p-6 text-center text-sm text-gray-600">No hay proyectos registrados.</div>
            )}

            {proyectosFiltrados.map((p, i) => (
              <div
                key={p.id}
                className={`grid grid-cols-4 ${i % 2 === 0 ? "bg-[#f9fafb]" : "bg-[#f3f4f6]"}`}
              >
                <div className="px-4 py-4 border-r border-gray-300 text-gray-700 break-words">
                  {p.nombre}
                </div>
                <div className="px-4 py-4 border-r border-gray-300 text-gray-700 break-words">
                  {p.codigo}
                </div>
                <div className="px-4 py-4 border-r border-gray-300 text-gray-700 break-words">
                  {p.tipo}
                </div>

                <div className="px-4 py-4 flex items-center gap-4">
                  <HiOutlineEye
                    title="Ver"
                    onClick={() => {
                      setProyectoSeleccionado(p);
                      setModalVer(true);
                    }}
                    className="w-6 h-6 text-[#00c9a7] cursor-pointer hover:text-[#009e84]"
                  />
                  <HiOutlineTrash
                    title="Eliminar"
                    onClick={() => {
                      setProyectoSeleccionado(p);
                      setShowConfirmDelete(true);
                    }}
                    className="w-6 h-6 text-red-500 cursor-pointer hover:text-red-700"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-center items-center gap-4 text-gray-600 text-sm">
          <button
            onClick={() => {
              const prev = cursorStack[cursorStack.length - 1] ?? null;
              const newStack = cursorStack.slice(0, -1);
              setCursorStack(newStack);
              setCursor(prev);
              setPage((p) => Math.max(1, p - 1));
              fetchProyectos({ cursor: prev });
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

          <span className="px-3 py-1 rounded bg-[#27333d] text-white">
            Pagina {page}
          </span>

          <button
            onClick={() => {
              if (!nextCursor) return;
              setCursorStack((s) => [...s, cursor ?? ""]);
              setCursor(nextCursor);
              setPage((p) => p + 1);
              fetchProyectos({ cursor: nextCursor });
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
      </main>

      <ModalVerProyecto
        open={modalVer}
        proyecto={proyectoSeleccionado}
        onClose={() => {
          setModalVer(false);
          setProyectoSeleccionado(null);
        }}
        onEdit={(p: Proyecto) => {
          setModalVer(false);
          setProyectoSeleccionado(null);
          router.push(`/proyectos/editar/${p.id}`);
        }}
      />

      <ConfirmModal
        open={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={handleDeleteConfirm}
        message={`Esta seguro de eliminar el proyecto "${proyectoSeleccionado?.nombre ?? ""}"?`}
      />
      <ErrorModal
        open={showError}
        onClose={() => setShowError(false)}
        title={errorTitle}
        description={errorDesc}
      />
    </div>
  );
}

export default withAuth(ProyectosPage);

