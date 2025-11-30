"use client";

import { useState, useEffect } from "react";

export default function NewProyecto({
  open,
  onClose,
  onBack,
  onSave,
  initialData,
}: {
  open: boolean;
  onClose: () => void;
  onBack: () => void;
  onSave: (data: any) => void;
  initialData?: any;
}) {
  if (!open) return null;

  const [fuente_financiamiento, setFinanciamiento] = useState("");
  const [logros, setLogros] = useState("");
  const [dificultades, setDificultades] = useState("");

  // Prefill when opening to edit
  useEffect(() => {
    if (open && initialData) {
      setFinanciamiento(initialData.fuente_financiamiento ?? "");
      setLogros(initialData.logros ?? "");
      setDificultades(initialData.dificultades ?? "");
    }
    if (!open) {
      setFinanciamiento(""); setLogros(""); setDificultades("");
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

        <div className="flex flex-col gap-5 text-sm">

          {/* Financiamiento */}
          <div>
            <label className="font-semibold text-black">Financiamiento</label>
            <input
              type="text"
              placeholder="Banco Galicia..."
              className="input-base mt-1"
              value={fuente_financiamiento}
              onChange={(e) => setFinanciamiento(e.target.value)}
            />
          </div>

          {/* Logros */}
          <div>
            <label className="font-semibold text-black">Logros</label>
            <input
              type="text"
              placeholder="Objetivo cumplido..."
              className="input-base mt-1"
              value={logros}
              onChange={(e) => setLogros(e.target.value)}
            />
          </div>

          {/* Dificultades */}
          <div>
            <label className="font-semibold text-black">Dificultades</label>
            <textarea
              placeholder="Dificultad 1..."
              className="textarea-base h-36"
              value={dificultades}
              onChange={(e) => setDificultades(e.target.value)}
            ></textarea>
          </div>
        </div>

        <div className="flex justify-end mt-8 gap-6">
          
          <button
            onClick={onBack}
            className="px-10 py-3 bg-[#00c9a7] text-white rounded-md font-medium text-lg hover:bg-[#00b197]"
          >
            Anterior
          </button>

          <button
            onClick={() =>
              onSave({
                fuente_financiamiento,
                logros,
                dificultades,
              })
            }
            className="px-10 py-3 bg-[#00c9a7] text-white rounded-md font-medium text-lg hover:bg-[#00b197]"
          >
            Guardar Proyecto
          </button>

        </div>
      </div>
    </div>
  );
}
