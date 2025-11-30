"use client";

import { useState, useEffect } from "react";

interface ModalAddGrupoProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { nombre: string }) => void;
}

export default function ModalAddGrupo({ open, onClose, onSave }: ModalAddGrupoProps) {
  
  const [nombre, setNombre] = useState("");

  // Reiniciar campos cuando se abre el modal
  useEffect(() => {
    if (open) {
        setNombre("");
    }
  }, [open]);

  if (!open) return null;

  const handleSave = () => {
    if (!nombre.trim()) {
        alert("El nombre es obligatorio");
        return;
    }
    onSave({ nombre });
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
          Nuevo Grupo
        </h2>

        <div className="space-y-4 text-sm">

          {/* Campo Nombre */}
          <div>
            <label className="font-medium text-gray-700">Nombre del Grupo</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-md px-3 py-2 mt-1 focus:outline-none focus:ring-1 focus:ring-[#00c9a7]"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Ej: Grupo de Trabajo 2024..."
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