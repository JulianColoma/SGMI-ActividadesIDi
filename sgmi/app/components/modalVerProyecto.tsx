"use client";

import { HiOutlineX } from "react-icons/hi";

export default function ModalVerProyecto({ open, proyecto, onClose, onEdit, hiddeGroup=false }: any) {
  if (!open || !proyecto) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white w-[850px] rounded-2xl p-10 relative shadow-2xl">

        {/* BOTÓN DE CERRAR */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-3xl text-gray-700 hover:text-black"
        >
          <HiOutlineX />
        </button>

        {/* TÍTULO */}
        <h2 className="text-2xl font-semibold text-[#00c9a7] mb-8">
          Proyecto de I+D+i
        </h2>

        {/* CONTENIDO 2 COLUMNAS */}
        <div className="grid grid-cols-2 gap-10 text-[15px] text-gray-800 leading-relaxed">

          {/* COLUMNA 1 */}
          <div className="space-y-3">
            <p><strong>Nombre del Proyecto:</strong> {proyecto.nombre}</p>
            <p><strong>Código:</strong> {proyecto.codigo}</p>
            
            {/* NUEVOS CAMPOS (vienen planos desde el SQL) */}
            {!hiddeGroup && <p><strong>Grupo:</strong> {proyecto.grupo_nombre || "—"}</p>}
            {!hiddeGroup && <p><strong>Memoria:</strong> {proyecto.memoria_anio ? `Año ${proyecto.memoria_anio}` : "—"}</p>}
            

            <p><strong>Tipo de Proyecto:</strong> {proyecto.tipo}</p>
            <p><strong>Fecha de Inicio:</strong> {proyecto.fecha_inicio || "—"}</p>
            <p><strong>Fecha de Fin:</strong> {proyecto.fecha_fin || "—"}</p>
            <p><strong>Fuente de Financiamiento:</strong> {proyecto.fuente_financiamiento || "—"}</p>
          </div>

          {/* COLUMNA 2 */}
          <div className="space-y-3">
            <p><strong>Descripción:</strong> {proyecto.descripcion || "—"}</p>
            <p><strong>Dificultades:</strong> {proyecto.dificultades || "—"}</p>
            <p><strong>Logros:</strong> {proyecto.logros || "—"}</p>
          </div>

        </div>

        {/* BOTÓN EDITAR */}
        <div className="flex justify-end mt-10">
          <button
            onClick={() => onEdit ? onEdit(proyecto) : alert("TODO: abrir modal de edición")}
            className="px-8 py-3 bg-[#00c9a7] text-white rounded-md text-sm font-medium hover:bg-[#00b197]"
          >
            Editar Proyecto
          </button>
        </div>

      </div>
    </div>
  );
}