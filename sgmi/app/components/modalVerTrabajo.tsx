"use client";

import { HiOutlineX } from "react-icons/hi";

export default function ModalVerTrabajo({
  open,
  onClose,
  trabajo,
  onEdit,
  hiddeGroup=false
}: {
  open: boolean;
  onClose: () => void;
  trabajo: any | null;
  onEdit: (t: any) => void;
  hiddeGroup?: boolean;
}) {
  if (!open || !trabajo) return null;

  const expositor = trabajo.expositor_nombre ? trabajo.expositor_nombre : trabajo.expositor || '-';
  const nombreReunion = trabajo.reunion || '-';
  const ciudad = trabajo.ciudad || '-';
  const fecha = trabajo.fecha_presentacion ? new Date(trabajo.fecha_presentacion).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-';
  const titulo = trabajo.titulo || '-';
  
  // Nuevos campos
  const grupo = trabajo.grupo_nombre || '-';
  const memoria = trabajo.memoria_anio ? `Año ${trabajo.memoria_anio}` : '-';

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white w-[850px] rounded-2xl p-10 relative shadow-2xl">

        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-3xl text-gray-700 hover:text-black">
          <HiOutlineX />
        </button>

        <h2 className="text-2xl font-semibold text-[#00c9a7] mb-8">Reunión {trabajo.reunion_tipo === 'INTERNACIONAL' ? 'Internacional' : 'Nacional'}</h2>

        <div className="grid grid-cols-2 gap-10 text-[15px] text-gray-800 leading-relaxed">
            {/* Columna 1: Datos del Evento */}
            <div className="space-y-3">
                <div><strong>Nombre de la Reunión:</strong> {nombreReunion}</div>
                <div><strong>Fecha:</strong> {fecha}</div>
                {trabajo.reunion_tipo === 'INTERNACIONAL' && trabajo.pais && (
                <div><strong>País:</strong> {trabajo.pais}</div>
                )}
                <div><strong>Ciudad:</strong> {ciudad}</div>
            </div>

            {/* Columna 2: Datos del Trabajo y Pertenencia */}
            <div className="space-y-3">
                <div><strong>Expositor/a:</strong> {expositor}</div>
                <div><strong>Título del Trabajo:</strong> {titulo}</div>
                
                {/* Nuevos campos agregados aquí para balancear el diseño */}
                {!hiddeGroup && <div><strong>Grupo:</strong> {grupo}</div>}
                {!hiddeGroup && <div><strong>Memoria:</strong> {memoria}</div>}
            </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={() => onEdit(trabajo)}
            className="px-8 py-3 bg-[#00c9a7] text-white rounded-md text-sm font-medium hover:bg-[#00b197]"
          >
            Editar Trabajo
          </button>
        </div>

      </div>
    </div>
  );
}