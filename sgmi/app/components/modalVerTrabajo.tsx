"use client";

import { HiOutlineX } from "react-icons/hi";

type TrabajoView = {
  [key: string]: unknown;
  reunion_tipo?: string;
  expositor_nombre?: string;
  expositor?: string;
  reunion?: string;
  ciudad?: string;
  fecha_presentacion?: string;
  titulo?: string;
  grupo_nombre?: string;
  memoria_anio?: number;
  pais?: string;
};

export default function ModalVerTrabajo({
  open,
  onClose,
  trabajo,
  onEdit,
  hiddeGroup = false,
}: {
  open: boolean;
  onClose: () => void;
  trabajo: TrabajoView | null;
  onEdit: (t: TrabajoView) => void;
  hiddeGroup?: boolean;
}) {
  if (!open || !trabajo) return null;

  const expositor = trabajo.expositor_nombre ? trabajo.expositor_nombre : trabajo.expositor || "-";
  const nombreReunion = trabajo.reunion || "-";
  const ciudad = trabajo.ciudad || "-";
  const fecha = trabajo.fecha_presentacion
    ? new Date(trabajo.fecha_presentacion).toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "-";
  const titulo = trabajo.titulo || "-";
  const grupo = trabajo.grupo_nombre || "-";
  const memoria = trabajo.memoria_anio ? `Ano ${trabajo.memoria_anio}` : "-";

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
          Reunion {trabajo.reunion_tipo === "INTERNACIONAL" ? "Internacional" : "Nacional"}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-10 text-sm sm:text-[15px] text-gray-800 leading-relaxed">
          <div className="space-y-3 break-words">
            <div>
              <strong>Nombre de la Reunion:</strong> <span className="break-words">{nombreReunion}</span>
            </div>
            <div>
              <strong>Fecha:</strong> {fecha}
            </div>
            {trabajo.reunion_tipo === "INTERNACIONAL" && trabajo.pais && (
              <div>
                <strong>Pais:</strong> <span className="break-words">{trabajo.pais}</span>
              </div>
            )}
            <div>
              <strong>Ciudad:</strong> <span className="break-words">{ciudad}</span>
            </div>
          </div>

          <div className="space-y-3 break-words">
            <div>
              <strong>Expositor/a:</strong> <span className="break-words">{expositor}</span>
            </div>
            <div>
              <strong>Titulo del Trabajo:</strong> <span className="break-words">{titulo}</span>
            </div>
            {!hiddeGroup && (
              <div>
                <strong>Grupo:</strong> <span className="break-words">{grupo}</span>
              </div>
            )}
            {!hiddeGroup && (
              <div>
                <strong>Memoria:</strong> <span className="break-words">{memoria}</span>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end mt-6 sm:mt-8">
          <button
            onClick={() => onEdit(trabajo)}
            className="w-full sm:w-auto px-5 sm:px-8 py-2.5 sm:py-3 bg-[#00c9a7] text-white rounded-md text-sm font-medium hover:bg-[#00b197]"
          >
            Editar Trabajo
          </button>
        </div>
      </div>
    </div>
  );
}
