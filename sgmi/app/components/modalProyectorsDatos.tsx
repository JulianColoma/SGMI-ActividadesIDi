"use client";

import { useState, useEffect } from "react";

export default function ModalProyectoDatos({
  open,
  onClose,
  onNext,
  initialData,
}: {
  open: boolean;
  onClose: () => void;
  onNext: (data: any) => void;
  initialData?: any;
}) {
  if (!open) return null;

  const [tipo, setTipo] = useState("");
  const [codigo, setCodigo] = useState("");
  const [nombre, setNombre] = useState("");
  const [fecha_inicio, setFechaInicio] = useState("");
  const [fecha_fin, setFechaFin] = useState("");
  const [descripcion, setDescripcion] = useState("");

  // When initialData (for edit) is provided, populate local state
  // Also reset when modal opens/closes
  useEffect(() => {
    if (open && initialData) {
      setTipo(initialData.tipo ?? "");
      setCodigo(initialData.codigo ?? "");
      setNombre(initialData.nombre ?? "");
      // assume fecha come as ISO date string
      setFechaInicio(initialData.fecha_inicio ? new Date(initialData.fecha_inicio).toISOString().slice(0, 10) : "");
      setFechaFin(initialData.fecha_fin ? new Date(initialData.fecha_fin).toISOString().slice(0, 10) : "");
      setDescripcion(initialData.descripcion ?? "");
    }
    if (!open) {
      // clear when closed
      setTipo(""); setCodigo(""); setNombre(""); setFechaInicio(""); setFechaFin(""); setDescripcion("");
    }
  }, [open, initialData]);

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-[#D9D9D9] w-[900px] rounded-2xl shadow-xl relative p-6">
        <button
          className="absolute top-5 right-5 text-3xl text-gray-700 hover:text-black"
          onClick={onClose}
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold bg-[#00c9a7] text-white inline-block px-4 py-2 rounded-md mb-6">
          Proyecto de I+D+i
        </h2>

        <div className="grid grid-cols-3 gap-6 text-sm">

          {/* Tipo */}
          <div>
            <label className="font-semibold text-black">Tipo de Proyecto</label>
            <input
              type="text"
              placeholder="Ej: Investigación aplicada"
              className="input-base mt-1"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
            />
          </div>

          {/* Código */}
          <div>
            <label className="font-semibold text-black">Código</label>
            <input
              type="text"
              placeholder="001"
              className="input-base mt-1"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
            />
          </div>

          {/* Nombre */}
          <div>
            <label className="font-medium text-black">Nombre del Proyecto</label>
            <input
              type="text"
              placeholder="Nombre..."
              className="input-base mt-1"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
            />
          </div>

          {/* Fecha Inicio */}
          <div>
            <label className="font-medium text-black">Fecha de Inicio</label>
            <input
              type="date"
              className="input-base mt-1"
              value={fecha_inicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </div>

          {/* Fecha Fin */}
          <div>
            <label className="font-medium text-black">Fecha de Fin</label>
            <input
              type="date"
              className="input-base mt-1"
              value={fecha_fin}
              onChange={(e) => setFechaFin(e.target.value)}
            />
          </div>
        </div>

        {/* Descripción */}
        <div className="mt-6 text-sm">
          <label className="font-medium text-black">Descripción</label>
          <textarea
            className="textarea-base h-32 mt-1"
            placeholder="Descripción del proyecto..."
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
          ></textarea>
        </div>

        <div className="flex justify-end mt-6">
          <button
            className="px-10 py-3 rounded-md bg-[#00c9a7] text-white font-medium text-lg hover:bg-[#00b197]"
            onClick={() =>
              onNext({
                tipo,
                codigo,
                nombre,
                fecha_inicio,
                fecha_fin,
                descripcion,
              })
            }
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
