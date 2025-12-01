"use client";

import Sidebar from "@/app/components/sidebar";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { HiOutlineEye, HiOutlineTrash, HiOutlineSearch } from "react-icons/hi";
import UserPill from "../components/userPill";
import { withAuth } from "../withAuth";
// Importamos ambos modales
import ModalAddMemoria from "@/app/components/modalMemoria";
import ModalAddGrupo from "@/app/components/modalGrupo";
import ErrorModal from "@/app/components/alerts/ErrorModal";
import ConfirmModal from "@/app/components/alerts/ConfrimModal";

interface Memoria {
  id: number;
  anio: number;
  grupo_id: number;
  contenido?: string;
}

interface Grupo {
  id: number;
  nombre: string;
  memorias: Memoria[];
}

function MemoriasPage() {
  const router = useRouter();

  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  // Estado para Modal Memoria
  const [isModalMemoriaOpen, setIsModalMemoriaOpen] = useState(false);
  const [grupoSeleccionadoId, setGrupoSeleccionadoId] = useState<number | null>(null);

  // Estado para Modal Grupo (NUEVO)
  const [isModalGrupoOpen, setIsModalGrupoOpen] = useState(false);

  //Estados Alert
  const [errorOpen, setErrorOpen] = useState(false);
  const [errorTitle, setErrorTitle] = useState("");
  const [errorDesc, setErrorDesc] = useState("");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState<null | (() => void)>(null);


  const fetchDatos = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/grupo", { credentials: "include" });
      if (!response.ok) throw new Error("Error al cargar grupos");

      const res = await response.json();
      setGrupos(res.data || []);
    } catch (error) {
      console.error("Error fetching memorias:", error);
      setGrupos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatos();
  }, []);

  // --- Handlers para Grupos ---
  const deleteGrupo = async (grupoId: number) => {
    try {
      const res = await fetch(`/api/grupo/${grupoId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.json();
        setErrorTitle("Error al eliminar grupo");
        setErrorDesc(err.error || "No se pudo eliminar el grupo.");
        setErrorOpen(true);
        return;
      }

      await fetchDatos();
    } catch {
      setErrorTitle("Error de conexión");
      setErrorDesc("No se pudo contactar al servidor.");
      setErrorOpen(true);
    }
  };

  const handleDeleteGrupo = (grupoId: number) => {
    setConfirmMessage("¿Deseas eliminar este grupo y todas sus memorias?");
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
        setErrorTitle("Error al crear grupo");
        setErrorDesc(err.error || "No se pudo crear el grupo.");
        setErrorOpen(true);
        return;
      }

      setIsModalGrupoOpen(false);
      await fetchDatos();
    } catch {
      setErrorTitle("Error de conexión");
      setErrorDesc("No se pudo contactar al servidor.");
      setErrorOpen(true);
    }
  };

  // --- Handlers para Memorias ---

  const handleOpenModalMemoria = (grupoId: number) => {
    setGrupoSeleccionadoId(grupoId);
    setIsModalMemoriaOpen(true);
  };

  const deleteMemoria = async (memoriaId: number) => {
    try {
      const res = await fetch(`/api/memoria/${memoriaId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const err = await res.json();
        setErrorTitle("Error al eliminar memoria");
        setErrorDesc(err.error || "No se pudo eliminar la memoria.");
        setErrorOpen(true);
        return;
      }

      await fetchDatos();
    } catch {
      setErrorTitle("Error de conexión");
      setErrorDesc("No se pudo contactar al servidor.");
      setErrorOpen(true);
    }
  };

  // abrir confirmación
  const handleDeleteMemoria = (memoriaId: number) => {
    setConfirmMessage("¿Deseas eliminar esta memoria?");
    setConfirmAction(() => () => deleteMemoria(memoriaId));
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
        setErrorTitle("Error al guardar memoria");
        setErrorDesc(err.error || "No se pudo guardar.");
        setErrorOpen(true);
        return;
      }

      setIsModalMemoriaOpen(false);
      setGrupoSeleccionadoId(null);
      await fetchDatos();
    } catch {
      setErrorTitle("Error de conexión");
      setErrorDesc("No se pudo contactar al servidor.");
      setErrorOpen(true);
    }
  };

  // Filtrado
  const gruposFiltrados = grupos.filter((grupo) =>
    grupo.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="min-h-screen flex bg-[#f3f4f6] font-sans">
      <Sidebar />

      <main className="flex-1 px-12 py-8 bg-white">
        <div className="flex align-center justify-between">
          <h1 className="text-3xl font-semibold text-gray-800 mb-8">
            Gestión de memorias
          </h1>
          <UserPill />
        </div>
        <div className="flex items-center justify-between mb-6">
          <div className="relative w-80">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />

            <input
              type="text"
              placeholder="Buscar grupo"
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-[#f3f4f6] border border-[#e5e7eb] rounded-full pl-9 pr-4 py-2 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#00c9a7]"
            />
          </div>

          <button
            onClick={() => setIsModalGrupoOpen(true)}
            className="px-5 py-2 rounded-md text-sm font-medium text-white bg-[#00c9a7] shadow-sm hover:bg-[#00b197]"
          >
            + Añadir Grupo
          </button>
        </div>

        {loading && <p className="text-gray-500">Cargando memorias...</p>}

        {!loading &&
          gruposFiltrados.map((grupo) => (
            <div key={grupo.id} className="mb-10">
              <div className="bg-[#d3d3d3] px-4 py-3 rounded-t-lg font-semibold flex justify-between items-center">
                <span>{grupo.nombre}</span>
                <span>
                  <HiOutlineTrash
                    className="w-6 h-6 text-grey-500 cursor-pointer hover:scale-110 transition-transform"
                    title="Eliminar grupo"
                    onClick={() => handleDeleteGrupo(grupo.id)}
                  />
                </span>
              </div>

              {grupo.memorias && grupo.memorias.length > 0 ? (
                grupo.memorias.map((mem) => (
                  <div
                    key={mem.id}
                    className="bg-white px-4 py-3 border-b flex justify-between items-center hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-gray-700">
                      Memoria Anual {mem.anio}
                    </span>

                    <div className="flex gap-4">
                      <HiOutlineEye
                        className="w-6 h-6 text-[#00c9a7] cursor-pointer hover:text-[#009e84]"
                        onClick={() => router.push(`/memorias/${mem.id}`)}
                        title="Ver detalles"
                      />

                      <HiOutlineTrash
                        className="w-6 h-6 text-red-500 cursor-pointer hover:text-red-700"
                        title="Eliminar memoria"
                        onClick={() => handleDeleteMemoria(mem.id)}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="bg-white px-4 py-3 border-b text-gray-400 italic">
                  No hay memorias cargadas para este grupo.
                </div>
              )}

              <div className="bg-[#ededed] px-4 py-3 rounded-b-lg">
                <button
                  className="bg-[#00c9a7] text-white px-3 py-1 rounded-md text-sm hover:bg-[#00b092] transition-colors"
                  onClick={() => handleOpenModalMemoria(grupo.id)}
                >
                  + Agregar Memoria
                </button>
              </div>
            </div>
          ))}
      </main>

      {/* Modal para Agregar Memoria */}
      <ModalAddMemoria
        open={isModalMemoriaOpen}
        onClose={() => setIsModalMemoriaOpen(false)}
        onSave={handleSaveMemoria}
      />

      {/* Modal para Agregar Grupo */}
      <ModalAddGrupo
        open={isModalGrupoOpen}
        onClose={() => setIsModalGrupoOpen(false)}
        onSave={handleSaveGrupo}
      />
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