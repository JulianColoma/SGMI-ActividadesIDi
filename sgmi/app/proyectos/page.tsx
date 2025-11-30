"use client";

import { HiOutlineUserCircle, HiOutlineSearch, HiOutlineTrash, HiOutlineEye } from "react-icons/hi";
import Sidebar from "../components/sidebar";
import NewProyecto from "../components/newproyecto";
import ModalProyectoDatos from "../components/modalProyectorsDatos";
import ModalVerProyecto from "../components/modalVerProyecto";
import UserPill from "../components/userPill";
import { withAuth } from "../withAuth";
import { useEffect, useState } from "react";
import ErrorModal from "../components/alerts/ErrorModal";
import ConfirmModal from "../components/alerts/ConfrimModal";


function ProyectosPage() {
  const [modalDatos, setModalDatos] = useState(false);
  const [modalDetalles, setModalDetalles] = useState(false);

  const [formData, setFormData] = useState({
    tipo: "",
    codigo: "",
    nombre: "",
    fecha_inicio: "",
    fecha_fin: "",
    descripcion: "",
    logros: "",
    fuente_financiamiento: "",
    dificultades: "",
    // default to grupo 1 for now so validation doesn't fail when empty
    grupo_id: 1,
  });
  // Modal de error
  const [showError, setShowError] = useState(false);
  const [errorTitle, setErrorTitle] = useState("");
  const [errorDesc, setErrorDesc] = useState("");

  // Modal confirmar eliminación (reemplaza ModalEliminar)
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

  const proyectosFiltrados = proyectos.filter((p) =>
    (p.nombre || "").toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.codigo || "").toLowerCase().includes(busqueda.toLowerCase()) ||
    (p.tipo || "").toLowerCase().includes(busqueda.toLowerCase())
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadProyectos() {
    setLoading(true);
    setError(null);
    try {
      // Nota: la ruta del API es /api/investigacion (singular) — había un typo en plural
      const token = localStorage.getItem("token");
      const res = await fetch("/api/investigacion?grupo_id=1", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (!res.ok) {
        // intenta parsear la respuesta JSON si existe
        let body: any = null;
        try { body = await res.json(); } catch { /* ignore */ }
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

  async function handleSave(dataFinal: Record<string, any>) {
    try {
      const token = localStorage.getItem("token");

      // Quick client-side validation for required fields
      if (!dataFinal.tipo || !dataFinal.nombre || !dataFinal.fecha_inicio) {
        alert('Completa los campos obligatorios: tipo, nombre y fecha de inicio.');
        return;
      }

      // Si hay editId, hacemos PUT a /api/investigacion/:id en lugar de POST
      const isEditing = !!editId;
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(isEditing ? `/api/investigacion/${editId}` : '/api/investigacion', {
        method: isEditing ? 'PUT' : 'POST',
        credentials: 'include', // send httpOnly cookie
        headers,
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

      alert(isEditing ? "Proyecto actualizado con éxito" : "Proyecto guardado con éxito");
      setModalDetalles(false);
      setEditId(null);
      loadProyectos(); // recarga la tabla
    } catch (e) {
      alert("Error al conectar con el servidor");
    }
  }

  // Eliminar investigacion (llamada al backend)
  async function handleDeleteConfirm() {
    if (!proyectoSeleccionado) return;
    try {
      const id = proyectoSeleccionado.id;
      const token = localStorage.getItem('token');
      const headers: any = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(`/api/investigacion/${id}`, { method: 'DELETE', credentials: 'include', headers });
      const json = await res.json();
      if (!res.ok || !json.success) {
        alert(json.error || json.message || `No se pudo eliminar (code ${res.status})`);
      } else {
        // refrescar lista
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
    // set edit id and prefill formData with proyecto values & open first modal
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
      grupo_id: proyecto?.grupo_id ?? 1,
    });
    // Close view modal and open the first modal to edit
    setModalVer(false);
    setShowConfirmDelete(false)
    setModalDatos(true);
  }

  return (
    <div className="min-h-screen flex bg-[#f3f4f6] font-sans">
      <Sidebar />

      <main className="flex-1 px-12 py-8 bg-white">
        {/* Título + usuario */}
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-3xl font-semibold text-gray-800 whitespace-nowrap">
            Gestión de Proyectos de I+D+i
          </h1>
          <UserPill />
        </div>

        {/* Buscar + botón agregar */}
        <div className="flex items-center justify-between mb-6">
          <div className="relative w-80">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />

            <input
              type="text"
              placeholder="Buscar proyecto"
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-[#f3f4f6] border border-[#e5e7eb] rounded-full pl-9 pr-4 py-2 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#00c9a7]"
            />
          </div>

          <button
            onClick={() => setModalDatos(true)}
            className="px-5 py-2 rounded-md text-sm font-medium text-white bg-[#00c9a7] shadow-sm hover:bg-[#00b197]"
          >
            + Añadir Proyecto
          </button>
        </div>

        {/* Tabla */}
        <div className="border border-gray-300 rounded-lg overflow-hidden w-full">
          {/* Headers */}
          <div className="grid grid-cols-4 bg-[#e5e7eb] border-b border-gray-300 text-sm font-medium text-gray-700">
            <div className="px-4 py-3 border-r border-gray-300">Nombre del Proyecto</div>
            <div className="px-4 py-3 border-r border-gray-300">Código</div>
            <div className="px-4 py-3 border-r border-gray-300">Tipo de Proyecto</div>
            <div className="px-4 py-3">Acciones</div>
          </div>

          {/* CARGANDO / ERROR / SIN DATOS */}
          {loading && (
            <div className="p-6 text-center text-sm text-gray-600">Cargando proyectos...</div>
          )}

          {error && !loading && (
            <div className="p-6 text-center text-sm text-red-600">Error: {error}</div>
          )}

          {!loading && !error && proyectos.length === 0 && (
            <div className="p-6 text-center text-sm text-gray-600">No hay proyectos registrados.</div>
          )}

          {/* Filas */}
          {proyectosFiltrados.map((p, i) => (
            <div
              key={p.id}
              className={`grid grid-cols-4 ${i % 2 === 0 ? "bg-[#f9fafb]" : "bg-[#f3f4f6]"}`}
            >
              <div className="px-4 py-4 border-r border-gray-300 text-gray-700">
                {p.nombre}
              </div>
              <div className="px-4 py-4 border-r border-gray-300 text-gray-700">
                {p.codigo}
              </div>
              <div className="px-4 py-4 border-r border-gray-300 text-gray-700">{p.tipo}</div>


              <div className="px-4 py-4 flex items-center gap-4">
                <HiOutlineEye
                  title="Ver"
                  onClick={() => {
                    setProyectoSeleccionado(p);
                    setModalVer(true);
                  }}
                  className="w-6 h-6 text-[#00c9a7] cursor-pointer hover:text-[#009e84]"
                >

                </HiOutlineEye>

                <HiOutlineTrash
                  title="Eliminar"
                  onClick={() => {
                    setProyectoSeleccionado(p);
                    setShowConfirmDelete(true);

                  }}
                  className="w-6 h-6 text-red-500 cursor-pointer hover:text-red-700"
                >

                </HiOutlineTrash>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Modal 1: Datos iniciales */}
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

      {/* Modal 2: Financiación / logros */}
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

      {/* Modal ver proyecto */}
      <ModalVerProyecto
        open={modalVer}
        proyecto={proyectoSeleccionado}
        onClose={() => { setModalVer(false); setProyectoSeleccionado(null); }}
        onEdit={(p: any) => handleEdit(p)}
      />

      {/* Modal eliminar */}
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
