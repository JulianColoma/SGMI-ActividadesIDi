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
// 1. Definimos la interfaz para evitar errores de tipo
interface Usuario {
  id: number; // o string, dependiendo de tu BD
  nombre: string;
  email: string;
  role: string;
}

function UsuariosPage() {

  const [buscar, setBuscar] = useState("");
  // Modal de error
  const [showError, setShowError] = useState(false);
  const [errorTitle, setErrorTitle] = useState("");
  const [errorDesc, setErrorDesc] = useState("");

  // 2. Inicializamos SIEMPRE como array vacío para que .filter no falle al inicio
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Opcional: para saber si está cargando

  const [openNuevo, setOpenNuevo] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);


  // El usuario seleccionado puede ser null (ninguno) o un objeto Usuario
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/usuario', { credentials: 'include' });

      const data = await res.json();

      if (Array.isArray(data)) {
        setUsuarios(data);
      } else if (data && Array.isArray(data.data)) {
        setUsuarios(data.data);
      } else {
        console.error("La API no devolvió un array válido:", data);
        setUsuarios([]);
      }

    } catch (error) {
      console.error("Error obteniendo usuarios:", error);
      setUsuarios([]);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchData();
  }, []);


  async function agregarUsuario(data: any): Promise<void> {
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
        // fallback: still refresh and close
        fetchData();
        setOpenNuevo(false);
      }
    } catch (e: any) {
      console.error('Error creando usuario', e);
      fetchData();
      setOpenNuevo(false);
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

      <main className="flex-1 px-12 py-8 bg-white">

        {/* HEADER */}
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-3xl font-semibold text-gray-800">Gestión de Usuarios</h1>
          <UserPill />
        </div>

        {/* BUSCADOR + BOTÓN */}
        <div className="flex items-center justify-between mb-6">

          <div className="relative w-80">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar usuario"
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
              className="w-full bg-[#f3f4f6] border border-[#e5e7eb] rounded-full pl-9 pr-4 py-2 text-sm 
text-black placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#00c9a7]"

            />
          </div>

          <button
            onClick={() => setOpenNuevo(true)}
            className="px-5 py-2 rounded-md text-sm font-medium text-white bg-[#00c9a7] shadow-sm hover:bg-[#00b197]"
          >
            + Añadir Usuario
          </button>
        </div>

        {/* TABLA */}
        <div className="border border-gray-300 rounded-lg overflow-hidden">

          <div className="grid grid-cols-4 bg-[#e5e7eb] border-b border-gray-300 text-sm font-medium text-gray-700">
            <div className="px-4 py-3 border-r border-gray-300">Nombre</div>
            <div className="px-4 py-3 border-r border-gray-300">Email</div>
            <div className="px-4 py-3 border-r border-gray-300">Rol</div>
            <div className="px-4 py-3 text-center">Acciones</div>
          </div>

          {/* Mensaje de carga o tabla */}
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Cargando usuarios...</div>
          ) : (
            usuarios
              .filter((u) =>
                u.nombre.toLowerCase().includes(buscar.toLowerCase())
              )
              .map((u, i) => (
                <div
                  key={u.id}
                  className={`grid grid-cols-4 ${i % 2 === 0 ? "bg-[#f9fafb]" : "bg-[#f3f4f6]"
                    }`}
                >
                  <div className="px-4 py-4 border-r border-gray-300 text-gray-700">{u.nombre}</div>
                  <div className="px-4 py-4 border-r border-gray-300 text-gray-700">{u.email}</div>
                  <div className="px-4 py-4 border-r border-gray-300 text-gray-700">{u.role}</div>

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

          {/* Mensaje si no hay resultados tras cargar */}
          {!isLoading && usuarios.length === 0 && (
            <div className="p-4 text-center text-gray-500">No se encontraron usuarios.</div>
          )}

        </div>
      </main>

      {/* MODAL NUEVO USUARIO */}
      <ModalNuevoUsuario
        open={openNuevo}
        onClose={() => setOpenNuevo(false)}
        onSave={agregarUsuario}
      />

      {/* MODAL ELIMINAR */}
      <ConfirmModal
        open={showConfirmDelete}
        onClose={() => {
          setShowConfirmDelete(false);
          setUsuarioSeleccionado(null);
        }}
        onConfirm={async () => {
          try {
            await eliminarUsuario();
          } catch (e: any) {
            setErrorTitle("Error al eliminar usuario");
            setErrorDesc(e.message || "Error desconocido");
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