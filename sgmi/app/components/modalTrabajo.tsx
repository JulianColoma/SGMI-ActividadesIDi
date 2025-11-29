"use client";

import { useState } from "react";

export default function ModalTrabajo({
  open,
  onClose,
  onSave,
  modoInicial,
  initialData,
  editId,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  modoInicial: "nacional" | "internacional";
  initialData?: any;
  editId?: number | null;
}) {
  // Tipo de reunión según el toggle inicial o initialData
  const initialTipo = initialData ? (initialData.reunion_tipo && initialData.reunion_tipo.toLowerCase() === 'internacional' ? 'internacional' : (initialData.pais ? 'internacional' : 'nacional')) : modoInicial;
  const [tipo, setTipo] = useState<"nacional" | "internacional">(initialTipo);

  // Estado del formulario (si viene initialData lo prellenamos)
  const [form, setForm] = useState(() => ({
    nombreReunion: initialData?.reunion || initialData?.nombreReunion || "",
    ciudad: initialData?.ciudad || "",
    expositor: initialData?.expositor_nombre || "",
    fecha: initialData?.fecha_presentacion ? String(initialData.fecha_presentacion).slice(0,10) : "",
    titulo: initialData?.titulo || "",
    pais: initialData?.pais || (initialData ? (initialData.reunion_tipo === 'INTERNACIONAL' ? '' : 'Argentina') : (modoInicial === 'nacional' ? 'Argentina' : '')),
  }));

  // Defensor: siempre mantener value en todos los inputs
  const handleChange = (field: string, value: string) => {
    setForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (e?: any) => {
    try {
      setError(null);
      setLoading(true);

      // Preparar payload mínimo requerido por la API
      const payload: any = {
        titulo: form.titulo,
        fecha_presentacion: form.fecha || undefined,
        resumen: undefined,
        expositor_id: null,
        reunion_id: null,
        grupo_id: null,
        // datos extra (no usados por el modelo directamente pero útiles para el backend)
        ciudad: form.ciudad,
        pais: form.pais,
        nombreReunion: form.nombreReunion,
        tipo: tipo,
        expositor: form.expositor,
      };

      // si tenemos editId o initialData.id usamos PUT, sino POST
      const isEdit = !!(editId || initialData?.id);
      const url = isEdit ? `/api/trabajo/${editId ?? initialData.id}` : '/api/trabajo';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || data.message || 'Error al guardar');
        setLoading(false);
        return;
      }

      // Llamar al callback con la respuesta del servidor
      onSave(data);
      setLoading(false);
      onClose();
    } catch (e: any) {
      setError(e.message || 'Error en la petición');
      setLoading(false);
    }
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

            <input
              className="input-base mt-1"
              placeholder={tipo === "nacional" ? "Congreso" : "Nombre de la reunión internacional"}
              value={form.nombreReunion}
              onChange={(e) => handleChange("nombreReunion", e.target.value)}
            />
            
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
        {error && <div className="text-red-600 mt-4">{error}</div>}
        <div className="flex justify-end mt-6">
          <button
            onClick={handleSave}
            disabled={loading}
            className={`px-8 py-3 rounded-md text-white font-medium text-lg ${loading ? 'bg-gray-400' : 'bg-[#00c9a7] hover:bg-[#00b197]'}`}
          >
            {loading ? 'Guardando...' : 'Guardar Trabajo'}
          </button>
        </div>

      </div>
    </div>
  );
}
