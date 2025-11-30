"use client";

import { useState, useEffect } from "react";

interface ModalAddMemoriaProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { anio: number; contenido: string }) => void; // Definimos el tipo de dato que devuelve
}

export default function ModalAddMemoria({ open, onClose, onSave }: ModalAddMemoriaProps) {
  const [anio, setAnio] = useState(new Date().getFullYear());
  const [contenido, setContenido] = useState("");

  // Reiniciar campos cuando se abre el modal
  useEffect(() => {
    if (open) {
      setAnio(new Date().getFullYear());
      setContenido("");
    }
  }, [open]);

  if (!open) return null;

  const handleSave = () => {
    onSave({ anio, contenido });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[600px] rounded-2xl p-6 shadow-xl relative">

        <button
          className="absolute top-3 right-3 text-2xl text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold bg-[#00c9a7] text-white inline-block px-4 py-2 rounded-md mb-6">
          Nueva Memoria
        </h2>

        <div className="space-y-4 text-sm">

          {/* Campo Año */}
          <div>
            <label className="font-medium text-gray-700">Año</label>
            <input
              type="number"
              min="1900"
              max="2100"
              className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 focus:outline-none focus:ring-1 focus:ring-[#00c9a7]"
              value={anio}
              onChange={(e) => setAnio(parseInt(e.target.value))}
            />
          </div>

          {/* Campo Contenido */}
          <div>
            <label className="font-medium text-gray-700">Resumen / Contenido</label>
            <textarea
              rows={5}
              className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 resize-none focus:outline-none focus:ring-1 focus:ring-[#00c9a7]"
              value={contenido}
              onChange={(e) => setContenido(e.target.value)}
              placeholder="Describa brevemente las actividades del año..."
            />
          </div>

        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-[#00c9a7] text-white rounded-md hover:bg-[#00b092] font-medium transition-colors"
          >
            Guardar
          </button>
        </div>

      </div>
    </div>
  );
}