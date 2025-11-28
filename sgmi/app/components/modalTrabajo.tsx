"use client";

import { useState } from "react";

export default function ModalTrabajo({
  open,
  onClose,
  onSave,
  modoInicial,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  modoInicial: "nacional" | "internacional";
}) {
  // Tipo de reunión según el toggle inicial
  const [tipo, setTipo] = useState<"nacional" | "internacional">(modoInicial);

  // Estado del formulario (CONTROLADO → NO MÁS ERRORES)
  const [form, setForm] = useState({
    nombreReunion: "",
    ciudad: "",
    expositor: "",
    fecha: "",
    titulo: "",
    pais: modoInicial === "nacional" ? "Argentina" : "",
  });

  // Defensor: siempre mantener value en todos los inputs
  const handleChange = (field: string, value: string) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-[#D9D9D9] w-[850px] rounded-2xl shadow-xl relative p-6">

        {/* BOTÓN CERRAR */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-3xl text-gray-700 hover:text-black"
        >
          ✕
        </button>

        {/* TABS */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => {
              setTipo("nacional");
              handleChange("pais", "Argentina");
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-all 
            ${tipo === "nacional"
                ? "bg-[#00c9a7] text-white"
                : "bg-[#cfcfcf] text-gray-700"
              }`}
          >
            Reunión Nacional
          </button>

          <button
            onClick={() => {
              setTipo("internacional");
              handleChange("pais", "");
            }}
            className={`px-4 py-2 rounded-lg font-medium transition-all 
            ${tipo === "internacional"
                ? "bg-[#00c9a7] text-white"
                : "bg-[#cfcfcf] text-gray-700"
              }`}
          >
            Reunión Internacional
          </button>
        </div>

        {/* FORM */}
        <div className="grid grid-cols-2 gap-6 text-sm">

          {/* NOMBRE REUNIÓN */}
          <div>
            <label className="font-semibold text-black">Nombre de la Reunión</label>

            {tipo === "nacional" ? (
              <input
                className="input-base mt-1"
                placeholder="Congreso"
                value={form.nombreReunion}
                onChange={(e) => handleChange("nombreReunion", e.target.value)}
              />
            ) : (
              <select
                className="input-base bg-[#f3f4f6] mt-1"
                value={form.nombreReunion}
                onChange={(e) => handleChange("nombreReunion", e.target.value)}
              >
                <option value="">Seleccione...</option>
                <option value="Congreso">Congreso</option>
                <option value="Simposio">Simposio</option>
                <option value="Conferencia Internacional">Conferencia Internacional</option>
              </select>
            )}
          </div>

          {/* CIUDAD */}
          <div>
            <label className="font-semibold text-black">Ciudad</label>
            <input
              className="input-base mt-1"
              placeholder={tipo === "nacional" ? "Buenos Aires" : "Madrid"}
              value={form.ciudad}
              onChange={(e) => handleChange("ciudad", e.target.value)}
            />
          </div>

          {/* EXPOSITOR */}
          <div>
            <label className="font-semibold text-black">Nombre de Expositor/a</label>
            <input
              className="input-base mt-1"
              placeholder="Nombre completo"
              value={form.expositor}
              onChange={(e) => handleChange("expositor", e.target.value)}
            />
          </div>

          {/* FECHA */}
          <div>
            <label className="font-semibold text-black">Fecha de Inicio</label>
            <input
              type="date"
              className="input-base bg-[#f3f4f6] mt-1"
              value={form.fecha}
              onChange={(e) => handleChange("fecha", e.target.value)}
            />
          </div>

          {/* TÍTULO */}
          <div className="col-span-2">
            <label className="font-semibold text-black">Título del Trabajo</label>
            <input
              className="input-base mt-1"
              placeholder="Título"
              value={form.titulo}
              onChange={(e) => handleChange("titulo", e.target.value)}
            />
          </div>

          {/* PAÍS */}
          <div>
            <label className="font-semibold text-black">País</label>

            {tipo === "nacional" ? (
              <input
                className="input-base bg-[#f3f4f6] mt-1"
                value={form.pais}
                readOnly
              />
            ) : (
              <input
                className="input-base mt-1"
                placeholder="España"
                value={form.pais}
                onChange={(e) => handleChange("pais", e.target.value)}
              />
            )}

          </div>

        </div>

        {/* BOTÓN GUARDAR */}
        <div className="flex justify-end mt-6">
          <button
            onClick={() => onSave(form)}
            className="px-8 py-3 rounded-md bg-[#00c9a7] text-white font-medium text-lg hover:bg-[#00b197]"
          >
            Guardar Trabajo
          </button>
        </div>

      </div>
    </div>
  );
}
