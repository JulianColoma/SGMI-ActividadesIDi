"use client";

import { HiOutlinePencil } from "react-icons/hi";

export default function ModalVerTrabajo({
  open,
  onClose,
  trabajo,
  onEdit,
}: {
  open: boolean;
  onClose: () => void;
  trabajo: any | null;
  onEdit: (t: any) => void;
}) {
  if (!open || !trabajo) return null;

  const expositor = trabajo.expositor_nombre ? trabajo.expositor_nombre : trabajo.expositor || '-';
  const nombreReunion = trabajo.reunion || '-';
  const ciudad = trabajo.ciudad || '-';
  const fecha = trabajo.fecha_presentacion ? new Date(trabajo.fecha_presentacion).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-';
  const titulo = trabajo.titulo || '-';

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-[#f3f3f3] w-[520px] rounded-2xl shadow-xl relative p-6">

        <button onClick={onClose} className="absolute top-4 right-4 text-2xl">✕</button>

        <h2 className="text-xl font-semibold text-[#00c9a7] mb-4">Reunión {trabajo.reunion_tipo === 'INTERNACIONAL' ? 'Internacional' : 'Nacional'}</h2>

        <div className="text-sm text-gray-800 space-y-3">
          <div><strong>Nombre de la Reunión:</strong> {nombreReunion}</div>
          <div><strong>Fecha:</strong> {fecha}</div>
          {trabajo.reunion_tipo === 'INTERNACIONAL' && trabajo.pais && (
            <div><strong>País:</strong> {trabajo.pais}</div>
          )}
          <div><strong>Ciudad:</strong> {ciudad}</div>
          <div><strong>Expositor/a:</strong> {expositor}</div>
          <div><strong>Título del Trabajo:</strong> {titulo}</div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={() => onEdit(trabajo)}
            className="px-4 py-2 rounded-md bg-[#00c9a7] text-white flex items-center gap-2"
          >
            <HiOutlinePencil />
            Editar Trabajo
          </button>
        </div>

      </div>
    </div>
  );
}
