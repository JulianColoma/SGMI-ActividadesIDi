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

function TrabajosPage() {
  const [showError, setShowError] = useState(false);
  const [errorTitle, setErrorTitle] = useState("");
  const [errorDesc, setErrorDesc] = useState("");
  // Modal confirmar eliminación (reemplaza ModalEliminar)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [modalDatos, setModalDatos] = useState(false);
  const [editInitialData, setEditInitialData] = useState<any | null>(null);
  const [editId, setEditId] = useState<number | null>(null);
  const [trabajoSeleccionado, setTrabajoSeleccionado] = useState<any | null>(
    null
  );
  const [openVer, setOpenVer] = useState(false);
  const [verTrabajo, setVerTrabajo] = useState<any | null>(null);
  const [modoGlobal, setModoGlobal] = useState(false); // false=nacional 🇦🇷 / true=global 🌍
  const [busqueda, setBusqueda] = useState("");

  // Estado de trabajos traídos desde la API
  const [trabajos, setTrabajos] = useState<any[]>([]);
  const [loadingTrabajos, setLoadingTrabajos] = useState(false);
  const [errorTrabajos, setErrorTrabajos] = useState<string | null>(null);

  const fetchTrabajos = async () => {
    try {
      setErrorTrabajos(null);
      setLoadingTrabajos(true);
      const res = await fetch("/api/trabajo", {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorTrabajos(
          data.error || data.message || "Error al obtener trabajos"
        );
        setTrabajos([]);
      } else {
        setTrabajos(Array.isArray(data.data) ? data.data : []);
      }
    } catch (e: any) {
      setErrorTrabajos(e.message || "Error en la petición");
      setTrabajos([]);
    } finally {
      setLoadingTrabajos(false);
    }
  };

  useEffect(() => {
    fetchTrabajos();
  }, []);

  // Filtrado por modo (nacional/internacional) y búsqueda
  const filtrados = trabajos.filter((t) => {
    // Usar el campo `reunion_tipo` que trae la consulta ('NACIONAL'|'INTERNACIONAL')
    const tipo =
      t.reunion_tipo === "INTERNACIONAL" ? "internacional" : "nacional";
    return modoGlobal ? tipo === "internacional" : tipo === "nacional";
  });

  const trabajosFinal = filtrados.filter((t) => {
    const q = busqueda.toLowerCase().trim();
    return (t.titulo || "").toLowerCase().includes(q);
  });


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

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 px-12 py-8 bg-white">
        {/* HEADER SUPERIOR */}
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-3xl font-semibold text-gray-800">
            Gestión de Trabajos Presentados en Reuniones
          </h1>

          <UserPill />
        </div>

        {/* BUSCADOR + TOGGLE + BOTÓN */}
        <div className="flex items-center justify-between mb-6">
          {/* BUSCADOR */}
          <div className="relative w-80">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar trabajo"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full bg-[#f3f4f6] border border-[#e5e7eb] rounded-full pl-9 pr-4 py-2 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#00c9a7]"
            />
          </div>

          {/* TOGGLE BONITO */}
          <div className="flex items-center gap-4">
            <div
              onClick={() => setModoGlobal(!modoGlobal)}
              className={`
                w-20 h-9 flex items-center rounded-full p-1 cursor-pointer transition-all
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
                    alt="Argentina"
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

            {/* Botón de añadir */}
            <button
              onClick={() => setModalDatos(true)}
              className="px-5 py-2 rounded-md text-sm font-medium text-white bg-[#00c9a7] hover:bg-[#00b197]"
            >
              + Añadir Trabajo
            </button>
          </div>
        </div>

        {/* TABLA */}
        <div className="border border-gray-300 rounded-lg overflow-hidden">
          {/* ENCABEZADOS */}
          <div className="grid grid-cols-5 bg-[#e5e7eb] border-b border-gray-300 text-sm font-medium text-gray-700">
            <div className="px-4 py-3 border-r border-gray-300">Trabajo</div>
            <div className="px-4 py-3 border-r border-gray-300">
              {modoGlobal ? "País" : "Ciudad"}
            </div>
            <div className="px-4 py-3 border-r border-gray-300">Fecha</div>
            <div className="px-4 py-3 border-r border-gray-300">Reunión</div>
            <div className="px-4 py-3">Acciones</div>
          </div>

          {/* FILAS */}
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
                <div className="px-4 py-4 border-r border-gray-300 text-gray-700">
                  {t.titulo || "-"}
                </div>

                <div className="px-4 py-4 border-r border-gray-300 text-gray-700">
                  {modoGlobal ? t.pais || "-" : t.ciudad || "-"}
                </div>

                <div className="px-4 py-4 border-r border-gray-300 text-gray-700">
                  {formatDateShort(t.fecha_presentacion || t.fecha_creacion)}
                </div>

                <div className="px-4 py-4 border-r border-gray-300 text-gray-700">
                  {t.reunion || t.reunion_id || "-"}
                </div>

                {/* ACCIONES */}
                <div className="px-4 py-4 flex items-center gap-4">
                  {/* Ver */}
                  <HiOutlineEye
                    onClick={() => {
                      setVerTrabajo(t);
                      setOpenVer(true);
                    }}
                    className="w-6 h-6 text-[#00c9a7] cursor-pointer hover:text-[#009e84]"
                  />

                  {/* Eliminar (icono igual que en Usuarios) */}
                  <HiOutlineTrash
                    onClick={() => {
                      setTrabajoSeleccionado(t);
                      setShowConfirmDelete(true);
                    }}
                    className="w-6 h-6 text-red-500 cursor-pointer hover:text-red-700"
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

        {/* PAGINACIÓN */}
        <div className="mt-6 flex justify-center items-center gap-4 text-gray-600 text-sm">
          <button className="px-2 py-1 hover:bg-gray-100 rounded">←</button>
          <span className="px-3 py-1 rounded bg-[#27333d] text-white">1</span>
          <button className="px-2 py-1 hover:bg-gray-100 rounded">→</button>
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
              // si la creación/edición fue exitosa, refrescar la lista
              if (data?.success) fetchTrabajos();
              else fetchTrabajos();
              setEditInitialData(null);
              setEditId(null);
            }}
          />
        )}

        {/* Modal eliminar */}
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


        {/* Modal ver trabajo */}
        <ModalVerTrabajo
          open={openVer}
          trabajo={verTrabajo}
          onClose={() => {
            setOpenVer(false);
            setVerTrabajo(null);
          }}
          onEdit={(t: any) => {
            // abrir modal de edición prellenado
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
