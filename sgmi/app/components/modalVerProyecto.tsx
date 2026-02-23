"use client";

import { HiOutlineX } from "react-icons/hi";

type ProyectoView = {
  [key: string]: unknown;
  nombre?: string;
  codigo?: string;
  grupo_nombre?: string;
  memoria_anio?: number;
  tipo?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  fuente_financiamiento?: string;
  descripcion?: string;
  dificultades?: string;
  logros?: string;
};

export default function ModalVerProyecto({
  open,
  proyecto,
  onClose,
  onEdit,
  hiddeGroup = false,
}: {
  open: boolean;
  proyecto: ProyectoView | null;
  onClose: () => void;
  onEdit?: (p: ProyectoView) => void;
  hiddeGroup?: boolean;
}) {
  if (!open || !proyecto) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white w-full max-w-3xl rounded-2xl p-5 sm:p-6 md:p-10 relative shadow-2xl max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-6 sm:right-6 text-2xl sm:text-3xl text-gray-700 hover:text-black"
        >
          <HiOutlineX />
        </button>

        <h2 className="text-xl sm:text-2xl font-semibold text-[#00c9a7] mb-5 sm:mb-8 pr-8">
          Proyecto de I+D+i
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-10 text-sm sm:text-[15px] text-gray-800 leading-relaxed">
          <div className="space-y-3 break-words">
            <p>
              <strong>Nombre del Proyecto:</strong> <span className="break-words">{proyecto.nombre}</span>
            </p>
            <p>
              <strong>Codigo:</strong> <span className="break-words">{proyecto.codigo || "-"}</span>
            </p>
            {!hiddeGroup && (
              <p>
                <strong>Grupo:</strong> <span className="break-words">{proyecto.grupo_nombre || "-"}</span>
              </p>
            )}
            {!hiddeGroup && (
              <p>
                <strong>Memoria:</strong>{" "}
                <span className="break-words">
                  {proyecto.memoria_anio ? `Ano ${proyecto.memoria_anio}` : "-"}
                </span>
              </p>
            )}
            <p>
              <strong>Tipo de Proyecto:</strong> <span className="break-words">{proyecto.tipo || "-"}</span>
            </p>
            <p>
              <strong>Fecha de Inicio:</strong> <span className="break-words">{proyecto.fecha_inicio || "-"}</span>
            </p>
            <p>
              <strong>Fecha de Fin:</strong> <span className="break-words">{proyecto.fecha_fin || "-"}</span>
            </p>
            <p>
              <strong>Fuente de Financiamiento:</strong>{" "}
              <span className="break-words">{proyecto.fuente_financiamiento || "-"}</span>
            </p>
          </div>

          <div className="space-y-3 break-words">
            <p>
              <strong>Descripcion:</strong> <span className="break-words">{proyecto.descripcion || "-"}</span>
            </p>
            <p>
              <strong>Dificultades:</strong> <span className="break-words">{proyecto.dificultades || "-"}</span>
            </p>
            <p>
              <strong>Logros:</strong> <span className="break-words">{proyecto.logros || "-"}</span>
            </p>
          </div>
        </div>

        <div className="flex justify-end mt-6 sm:mt-10">
          <button
            onClick={() => (onEdit ? onEdit(proyecto) : null)}
            className="w-full sm:w-auto px-5 sm:px-8 py-2.5 sm:py-3 bg-[#00c9a7] text-white rounded-md text-sm font-medium hover:bg-[#00b197]"
          >
            Editar Proyecto
          </button>
        </div>
      </div>
    </div>
  );
}
