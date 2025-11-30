"use client";

import Sidebar from "@/app/components/sidebar";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react"; 
import { HiOutlineEye, HiOutlineTrash } from "react-icons/hi";
import UserPill from "../components/userPill";
import { withAuth } from "../withAuth";
import ModalAddMemoria from "@/app/components/modalMemoria";

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

  // --- Estados para el Modal ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [grupoSeleccionadoId, setGrupoSeleccionadoId] = useState<number | null>(null);

  // FETCH INICIAL
  const fetchDatos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/grupo', { credentials: 'include' }); 
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

  // --- Función para abrir el modal ---
  const handleOpenModal = (grupoId: number) => {
    setGrupoSeleccionadoId(grupoId);
    setIsModalOpen(true);
  };

  // --- Lógica de Guardado (Igual que agregarUsuario) ---
  const handleSaveMemoria = async (data: { anio: number; contenido: string }) => {
    if (!grupoSeleccionadoId) return;

    try {
      // Hacemos el POST aquí, igual que en UsuariosPage
      const res = await fetch("/api/memoria", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grupo_id: grupoSeleccionadoId,
          anio: data.anio,
          contenido: data.contenido
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert("Error al guardar: " + (errorData.error || "Desconocido"));
        return;
      }

      // Éxito: Cerrar modal y recargar datos
      setIsModalOpen(false);
      setGrupoSeleccionadoId(null);
      await fetchDatos(); 

    } catch (error) {
      console.error(error);
      alert("Error de conexión al guardar la memoria.");
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
        <UserPill/>
      </div>

        <input
          placeholder="Buscar grupo..."
          className="w-80 bg-gray-100 border border-gray-300 rounded-full px-4 py-2 mb-8 outline-none focus:ring-2 focus:ring-[#00c9a7]"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />

        {loading && <p className="text-gray-500">Cargando memorias...</p>}

        {!loading && gruposFiltrados.map((grupo) => (
          <div key={grupo.id} className="mb-10">
            
            <div className="bg-[#d3d3d3] px-4 py-3 rounded-t-lg font-semibold flex justify-start items-center">
              <span>{grupo.nombre}</span>
             
            </div>

            {grupo.memorias && grupo.memorias.length > 0 ? (
              grupo.memorias.map((mem) => (
                <div
                  key={mem.id}
                  className="bg-white px-4 py-3 border-b flex justify-between items-center hover:bg-gray-50 transition-colors"
                >
                  <span className="text-gray-700">Memoria Anual {mem.anio}</span>

                  <div className="flex gap-4">
                    <HiOutlineEye
                      className="w-6 h-6 text-[#00c9a7] cursor-pointer hover:scale-110 transition-transform"
                      onClick={() => router.push(`/memorias/${mem.id}`)}
                      title="Ver detalles"
                    />

                    <HiOutlineTrash 
                      className="w-6 h-6 text-red-500 cursor-pointer hover:scale-110 transition-transform" 
                      title="Eliminar memoria"
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
                onClick={() => handleOpenModal(grupo.id)}
              >
                + Agregar Memoria
              </button>
            </div>
          </div>
        ))}
      </main>

      {/* Renderizado del Modal */}
      <ModalAddMemoria
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveMemoria}
      />
    </div>
  );
}

export default withAuth(MemoriasPage);