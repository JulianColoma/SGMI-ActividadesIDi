"use client";

import Sidebar from "@/app/components/sidebar";
import { useEffect, useState } from "react";
import { Toast } from '@/app/lib/swal';
import {
  HiOutlineSearch,
  HiOutlineTrash,
} from "react-icons/hi";

import ModalNuevoUsuario from "@/app/components/modalNuevoUsuario";
import UserPill from "../components/userPill";
import { withAuth } from "../withAuth";
import ConfirmModal from "../components/alerts/ConfrimModal";
import ErrorModal from "../components/alerts/ErrorModal";

interface Usuario {
  id: number;
  nombre: string;
  email: string;
  role: string;
}

interface NuevoUsuarioData {
  nombre: string;
  email: string;
  password: string;
  role: string;
}

function UsuariosPage() {

  const [buscar, setBuscar] = useState("");
  const [showError, setShowError] = useState(false);
  const [errorTitle, setErrorTitle] = useState("");
  const [errorDesc, setErrorDesc] = useState("");

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [openNuevo, setOpenNuevo] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);


  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);

  const usuariosFiltrados = usuarios.filter((u) =>
    u.nombre.toLowerCase().includes(buscar.toLowerCase())
  );

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/usuario', { credentials: 'include' });

      const data = await res.json();

      const lista =
        (Array.isArray(data) && data) ||
        (Array.isArray(data?.data) && data.data) ||
        (Array.isArray(data?.usuarios) && data.usuarios) ||
        (Array.isArray(data?.result) && data.result) ||
        [];

      if (data?.success === false) {
        setErrorTitle("No se pudieron cargar usuarios");
        setErrorDesc(data?.error || "Error inesperado");
        setShowError(true);
      }

      setUsuarios(lista);
    } catch (error) {
      console.error("Error obteniendo usuarios:", error);
      setUsuarios([]);
      setErrorTitle("Error de conexion");
      setErrorDesc("No se pudo cargar la lista de usuarios.");
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);


  async function agregarUsuario(data: NuevoUsuarioData): Promise<void> {
    try {
      const res = await fetch('/api/usuario/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      const result = await res.json();
      if (res.ok && (result.success || res.status === 201)) {
        await Toast.fire({ icon: 'success', title: 'Usuario creado con éxito' });
        fetchData();
        setOpenNuevo(false);
      } else {
        setErrorTitle("No se pudo crear usuario");
        setErrorDesc(result.error || result.message || "Error inesperado");
        setShowError(true);
      }
    } catch (e: unknown) {
      console.error('Error creando usuario', e);
      setErrorTitle("Error de conexion");
      setErrorDesc(e instanceof Error ? e.message : "No se pudo contactar al servidor");
      setShowError(true);
    }
  }

  async function eliminarUsuario(): Promise<void> {
    await fetch(`/api/usuario/${usuarioSeleccionado?.id}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    fetchData();
    setShowConfirmDelete(false);
  }

  return (
    <div className="min-h-screen flex bg-[#f3f4f6] font-sans">

      <Sidebar />

      <main className="flex-1 px-4 py-6 md:px-12 md:py-8 bg-white overflow-y-auto h-screen w-full">

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-10 gap-4 mt-12 md:mt-0">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">Gestión de Usuarios</h1>
          <div className="self-end md:self-auto">
            <UserPill />
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">

          <div className="relative w-full md:w-80">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar usuario"
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
              className="w-full bg-[#f3f4f6] border border-[#e5e7eb] rounded-full pl-9 pr-4 py-2 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#00c9a7]"

            />
          </div>

          <button
            onClick={() => setOpenNuevo(true)}
            className="w-full md:w-auto px-5 py-2 rounded-md text-sm font-medium text-white bg-[#00c9a7] shadow-sm hover:bg-[#00b197]"
          >
            + Añadir Usuario
          </button>
        </div>

        <div className="hidden md:block border border-gray-300 rounded-lg overflow-hidden w-full overflow-x-auto">
          <div className="min-w-[800px]">
            <div className="grid grid-cols-4 bg-[#e5e7eb] border-b border-gray-300 text-sm font-medium text-gray-700">
              <div className="px-4 py-3 border-r border-gray-300">Nombre</div>
              <div className="px-4 py-3 border-r border-gray-300">Email</div>
              <div className="px-4 py-3 border-r border-gray-300">Rol</div>
              <div className="px-4 py-3 text-center">Acciones</div>
            </div>

            {isLoading ? (
              <div className="p-4 text-center text-gray-500">Cargando usuarios...</div>
            ) : (
              usuariosFiltrados.map((u, i) => (
                <div
                  key={u.id}
                  className={`grid grid-cols-4 ${i % 2 === 0 ? "bg-[#f9fafb]" : "bg-[#f3f4f6]"
                    }`}
                >
                  <div className="px-4 py-4 border-r border-gray-300 text-gray-700 truncate" title={u.nombre}>
                    {u.nombre}
                  </div>
                  <div className="px-4 py-4 border-r border-gray-300 text-gray-700 truncate" title={u.email}>
                    {u.email}
                  </div>
                  <div className="px-4 py-4 border-r border-gray-300 text-gray-700 truncate" title={u.role}>
                    {u.role}
                  </div>

                  <div className="px-4 py-4 flex justify-center gap-5">

                    <HiOutlineTrash
                      onClick={() => {
                        setUsuarioSeleccionado(u);
                        setShowConfirmDelete(true);
                      }}
                      className="w-6 h-6 text-red-500 cursor-pointer hover:text-red-700"
                    />
                  </div>
                </div>
              ))
            )}

            {!isLoading && usuariosFiltrados.length === 0 && (
              <div className="p-4 text-center text-gray-500">No se encontraron usuarios.</div>
            )}
          </div>

        </div>

        <div className="md:hidden space-y-3">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Cargando usuarios...</div>
          ) : usuariosFiltrados.length > 0 ? (
            usuariosFiltrados.map((u) => (
              <div
                key={u.id}
                className="rounded-xl border border-[#d6d9dd] bg-white shadow-sm overflow-hidden"
              >
                <div className="px-4 py-3 bg-[#f3f4f6] border-b border-[#e5e7eb]">
                  <p className="text-sm font-semibold text-gray-800 truncate" title={u.nombre}>
                    {u.nombre}
                  </p>
                </div>
                <div className="px-4 py-3 space-y-2 text-sm text-gray-700">
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-500">Email</span>
                    <span className="font-medium text-right truncate max-w-[65%]" title={u.email}>
                      {u.email}
                    </span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-gray-500">Rol</span>
                    <span className="font-medium uppercase truncate max-w-[65%]" title={u.role}>
                      {u.role}
                    </span>
                  </div>
                </div>
                <div className="px-4 py-3 bg-[#fafafa] border-t border-[#e5e7eb] flex justify-end">
                  <HiOutlineTrash
                    onClick={() => {
                      setUsuarioSeleccionado(u);
                      setShowConfirmDelete(true);
                    }}
                    className="w-6 h-6 text-red-500 cursor-pointer hover:text-red-700"
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">No se encontraron usuarios.</div>
          )}
        </div>
      </main>

      <ModalNuevoUsuario
        open={openNuevo}
        onClose={() => setOpenNuevo(false)}
        onSave={agregarUsuario}
      />

      <ConfirmModal
        open={showConfirmDelete}
        onClose={() => {
          setShowConfirmDelete(false);
          setUsuarioSeleccionado(null);
        }}
        onConfirm={async () => {
          try {
            await eliminarUsuario();
          } catch (e: unknown) {
            setErrorTitle("Error al eliminar usuario");
            setErrorDesc(e instanceof Error ? e.message : "Error desconocido");
            setShowError(true);
          } finally {
            setShowConfirmDelete(false);
            setUsuarioSeleccionado(null);
          }
        }}
        message={`¿Seguro que deseas eliminar a ${usuarioSeleccionado?.nombre || "este usuario"}?`}
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
export default withAuth(UsuariosPage);
