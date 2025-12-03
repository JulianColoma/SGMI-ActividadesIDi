"use client";

import { HiOutlineSearch, HiOutlineTrash, HiOutlineEye } from "react-icons/hi";
import Sidebar from "../components/sidebar";
import NewProyecto from "../components/newproyecto";
import ModalProyectoDatos from "../components/modalProyectorsDatos";
import ModalVerProyecto from "../components/modalVerProyecto";
import UserPill from "../components/userPill";
import { withAuth } from "../withAuth";
import { useEffect, useState } from "react";
import ErrorModal from "../components/alerts/ErrorModal";
import ConfirmModal from "../components/alerts/ConfrimModal";
import { Toast, ModalSwal } from '@/app/lib/swal';

const INITIAL_FORM_STATE = {
  tipo: "",
  codigo: "",
  nombre: "",
  fecha_inicio: "",
  fecha_fin: "",
  descripcion: "",
  logros: "",
  fuente_financiamiento: "",
  dificultades: "",
  memoria_id: 1, 
};

function ProyectosPage() {
  const [modalDatos, setModalDatos] = useState(false);
  const [modalDetalles, setModalDetalles] = useState(false);

  const [formData, setFormData] = useState(INITIAL_FORM_STATE);

  const [showError, setShowError] = useState(false);
  const [errorTitle, setErrorTitle] = useState("");
  const [errorDesc, setErrorDesc] = useState("");

  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [busqueda, setBusqueda] = useState("");
  const [modalVer, setModalVer] = useState(false);
  const [proyectoSeleccionado, setProyectoSeleccionado] = useState<any | null>(null);
  
  const [editId, setEditId] = useState<number | null>(null);

  type Proyecto = {
    id: number;
    nombre: string;
    codigo: string;
    tipo: string;
  };

  const [proyectos, setProyectos] = useState<Proyecto[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  async function loadProyectos() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/investigacion", {
        credentials: "include",
      });

      if (!res.ok) {
        let body: any = null;
        try { body = await res.json(); } catch { console.log('No JSON body'); }
        throw new Error(body?.error || `Error HTTP ${res.status}`);
      }

      const json = await res.json();
      if (json.success) {
        setProyectos(json.data);
      } else {
        setError(json.error || 'Respuesta inválida del servidor');
      }
    } catch (e: any) {
      console.error('loadProyectos error', e);
      setError(e?.message || 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProyectos();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [busqueda]);

  function handleNewProyecto() {
    setEditId(null); 
    setFormData(INITIAL_FORM_STATE); 
    setModalDatos(true); 
  }

  async function handleSave(dataFinal: Record<string, any>) {
    try {
      if (!dataFinal.tipo || !dataFinal.nombre || !dataFinal.fecha_inicio) {
        await Toast.fire({ icon: 'warning', title: 'Completa los campos obligatorios', text: 'Tipo, nombre y fecha de inicio son requeridos.', timer: 1600 });
        return;
      }
      
      const isEditing = !!editId;

      const res = await fetch(isEditing ? `/api/investigacion/${editId}` : '/api/investigacion', {
        method: isEditing ? 'PUT' : 'POST',
        credentials: 'include', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dataFinal),
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        const msg = json?.error || `Error en servidor (${res.status})`;
        setErrorTitle("Error al guardar proyecto");
        setErrorDesc(msg);
        setShowError(true);
        return;
      }

      await Toast.fire({ icon: 'success', title: isEditing ? 'Proyecto actualizado con éxito' : 'Proyecto guardado con éxito' });
      setModalDetalles(false);
      setEditId(null);
   
      setFormData(INITIAL_FORM_STATE); 
      loadProyectos(); 
    } catch (e) {
      await ModalSwal.fire({ icon: 'error', title: 'Error al conectar', text: 'No se pudo conectar con el servidor.' });
    }
  }

  async function handleDeleteConfirm() {
    if (!proyectoSeleccionado) return;
    try {
      const id = proyectoSeleccionado.id;
      const res = await fetch(`/api/investigacion/${id}`, { method: 'DELETE', credentials: 'include' });
      const json = await res.json();
      if (!res.ok || !json.success) {
        alert(json.error || json.message || `No se pudo eliminar (code ${res.status})`);
      } else {
        await loadProyectos();
      }
    } catch (e: any) {
      alert(e?.message || 'Error al eliminar');
    } finally {
      setShowConfirmDelete(false);
      setProyectoSeleccionado(null);
    }
  }

  function handleEdit(proyecto: any) {
    setEditId(proyecto?.id ?? null);
    setFormData({
      tipo: proyecto?.tipo ?? "",
      codigo: proyecto?.codigo ?? "",
      nombre: proyecto?.nombre ?? "",
      fecha_inicio: proyecto?.fecha_inicio ? new Date(proyecto.fecha_inicio).toISOString().slice(0, 10) : "",
      fecha_fin: proyecto?.fecha_fin ? new Date(proyecto.fecha_fin).toISOString().slice(0, 10) : "",
      descripcion: proyecto?.descripcion ?? "",
      logros: proyecto?.logros ?? "",
      fuente_financiamiento: proyecto?.fuente_financiamiento ?? "",
      dificultades: proyecto?.dificultades ?? "",
      memoria_id: proyecto?.memoria_id ?? 1,
    });
    setModalVer(false);
    setShowConfirmDelete(false)
    setModalDatos(true);
  }

  const proyectosFiltrados = proyectos.filter((p) =>
    (p.nombre || "").toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.codigo || "").toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.tipo || "").toLowerCase().includes(busqueda.toLowerCase())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProyectos = proyectosFiltrados.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(proyectosFiltrados.length / itemsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  return (
    <div className="min-h-screen flex bg-[#f3f4f6] font-sans">
      <Sidebar />

      <main className="flex-1 px-4 py-6 md:px-12 md:py-8 bg-white overflow-y-auto h-screen w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-10 gap-4 mt-12 md:mt-0">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 whitespace-nowrap">
            Gestión de Proyectos de I+D+i
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
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-[#f3f4f6] border border-[#e5e7eb] rounded-full pl-9 pr-4 py-2 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#00c9a7]"
            />
          </div>

          <button
            onClick={handleNewProyecto} 
            className="w-full md:w-auto px-5 py-2 rounded-md text-sm font-medium text-white bg-[#00c9a7] shadow-sm hover:bg-[#00b197]"
          >
            + Añadir Proyecto
          </button>
        </div>

        <div className="border border-gray-300 rounded-lg overflow-hidden w-full overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-4 bg-[#e5e7eb] border-b border-gray-300 text-sm font-medium text-gray-700">
              <div className="px-4 py-3 border-r border-gray-300">Nombre del Proyecto</div>
              <div className="px-4 py-3 border-r border-gray-300">Código</div>
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

            {currentProyectos.map((p, i) => (
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
                <div className="px-4 py-4 border-r border-gray-300 text-gray-700 break-words">{p.tipo}</div>

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
        
        {totalPages > 1 && (
          <div className="mt-6 flex justify-center items-center gap-4 text-gray-600 text-sm">
            <button
              onClick={prevPage}
              disabled={currentPage === 1}
              className={`px-3 py-1 rounded border ${
                currentPage === 1 
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              ← Anterior
            </button>
            <span className="px-3 py-1 rounded bg-[#27333d] text-white">
              {currentPage} de {totalPages}
            </span>
            <button 
              onClick={nextPage}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 rounded border ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                  : "bg-white text-gray-700 hover:bg-gray-100"
              }`}
            >
              Siguiente →
            </button>
          </div>
        )}
      </main>

      {modalDatos && (
        <ModalProyectoDatos
          open={modalDatos}
          onClose={() => setModalDatos(false)}
          onNext={(data) => {
            setFormData({ ...formData, ...data });
            setModalDatos(false);
            setModalDetalles(true);
          }}
          initialData={formData}
        />
      )}

      {modalDetalles && (
        <NewProyecto
          open={modalDetalles}
          onClose={() => setModalDetalles(false)}
          onBack={() => {
            setModalDetalles(false);
            setModalDatos(true);
          }}
          onSave={(data) => handleSave({ ...formData, ...data })}
          initialData={formData}
        />
      )}

      <ModalVerProyecto
        open={modalVer}
        proyecto={proyectoSeleccionado}
        onClose={() => { setModalVer(false); setProyectoSeleccionado(null); }}
        onEdit={(p: any) => handleEdit(p)}
      />

      <ConfirmModal
        open={showConfirmDelete}
        onClose={() => setShowConfirmDelete(false)}
        onConfirm={handleDeleteConfirm}
        message={`¿Está seguro de eliminar el proyecto "${proyectoSeleccionado?.nombre ?? ""}"?`}
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