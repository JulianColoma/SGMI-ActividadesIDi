"use client";

import { useState, useEffect } from "react";
import { Toast } from '@/app/lib/swal';
import Hint from "./alerts/Hint";

// Interfaces para los dropdowns
interface Memoria {
  id: number;
  anio: number;
  contenido: string;
}

interface Grupo {
  id: number;
  nombre: string;
  memorias: Memoria[];
}

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
  // Lógica robusta para determinar el tipo inicial
  const resolvedTipo = (() => {
    if (initialData) {
      // 1. Prioridad: Usar el tipo explícito que viene de la BD
      if (initialData.reunion_tipo) {
        return initialData.reunion_tipo.toLowerCase() === "internacional"
          ? "internacional"
          : "nacional";
      }
      // 2. Fallback: Si tiene país y NO es Argentina, asumimos internacional
      if (initialData.pais && initialData.pais.toLowerCase() !== "argentina") {
        return "internacional";
      }
      return "nacional";
    }
    return modoInicial;
  })();

  const [tipo, setTipo] = useState<"nacional" | "internacional">(resolvedTipo);

  // --- NUEVO: Estados para los selectores de Grupo y Memoria ---
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [selectedGrupoId, setSelectedGrupoId] = useState<number | string>("");
  const [selectedMemoriaId, setSelectedMemoriaId] = useState<number | string>(
    ""
  );

  // Estado del formulario
  const [form, setForm] = useState(() => ({
    nombreReunion: initialData?.reunion || initialData?.nombreReunion || "",
    ciudad: initialData?.ciudad || "",
    expositor: initialData?.expositor_nombre || "",
    fecha: initialData?.fecha_presentacion
      ? String(initialData.fecha_presentacion).slice(0, 10)
      : "",
    titulo: initialData?.titulo || "",
    // Si es nacional, forzamos Argentina si no viene nada; si es internacional dejamos lo que venga o vacío
    pais: initialData?.pais || (resolvedTipo === "nacional" ? "Argentina" : ""),
  }));

  const handleChange = (field: string, value: string) => {
    // Lógica para detectar cambio manual a "Argentina"
    if (field === "pais" && value.toLowerCase().trim() === "argentina") {
      setTipo("nacional");
      // Forzamos "Argentina" con mayúscula y cortamos la ejecución aquí
      setForm((prev: any) => ({ ...prev, [field]: "Argentina" }));
      return;
    }

    setForm((prev: any) => ({ ...prev, [field]: value }));
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // 1. Cargar la lista de grupos y memorias al abrir
  useEffect(() => {
    const fetchGrupos = async () => {
      try {
        const res = await fetch("/api/grupo");
        const data = await res.json();

        if (data.success && Array.isArray(data.data)) {
          setGrupos(data.data);
        }
      } catch (error) {
        console.error("Error al cargar grupos:", error);
      }
    };

    if (open) {
      fetchGrupos();
    }
  }, [open]);

  // 2. Manejar la precarga de datos (Modo Edición) para los Dropdowns
  useEffect(() => {
    if (open && initialData && grupos.length > 0) {
      // Lógica para preseleccionar los dropdowns si ya hay una memoria asignada
      if (initialData.memoria_id) {
        // Buscamos a qué grupo pertenece esta memoria_id
        const grupoPadre = grupos.find((g) =>
          g.memorias.some((m) => m.id === initialData.memoria_id)
        );

        if (grupoPadre) {
          setSelectedGrupoId(grupoPadre.id);
          setSelectedMemoriaId(initialData.memoria_id);
        }
      }
    }

    // Resetear al cerrar
    if (!open) {
      setSelectedGrupoId("");
      setSelectedMemoriaId("");
    }
  }, [open, initialData, grupos]);

  // Filtrar las memorias disponibles según el grupo seleccionado
  const memoriasDelGrupo =
    grupos.find((g) => g.id === Number(selectedGrupoId))?.memorias || [];

  const handleSave = async (e?: any) => {
    try {
      setError(null);
      setFieldErrors({});

      // Validaciones
      const errs: Record<string, string> = {};
      if (!form.titulo || !String(form.titulo).trim()) errs.titulo = "El título es obligatorio";
      if (!form.nombreReunion || !String(form.nombreReunion).trim()) errs.nombreReunion = "El nombre de la reunión es obligatorio";
      if (!selectedMemoriaId) errs.memoria_id = "Asigna una memoria al trabajo";
      if (tipo === "internacional" && (!form.pais || !String(form.pais).trim())) errs.pais = "Indica el país para reuniones internacionales";

      if (Object.keys(errs).length) {
        setFieldErrors(errs);
        // don't proceed
        return;
      }

      setLoading(true);

      // Preparar payload
      const payload: any = {
        titulo: form.titulo,
        fecha_presentacion: form.fecha || undefined,
        resumen: undefined,
        expositor_id: null,
        reunion_id: null,

        // --- NUEVO: Enviamos la memoria seleccionada ---
        memoria_id: selectedMemoriaId ? Number(selectedMemoriaId) : null,

        // datos extra
        ciudad: form.ciudad,
        pais: form.pais,
        nombreReunion: form.nombreReunion,
        tipo: tipo,
        expositor: form.expositor,
      };

      const isEdit = !!(editId || initialData?.id);
      const url = isEdit
        ? `/api/trabajo/${editId ?? initialData.id}`
        : "/api/trabajo";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || data.message || "Error al guardar");
        setLoading(false);
        return;
      }

      // Mostrar alerta de éxito según creación o edición
      const accion = isEdit ? 'actualizado' : 'creado';
      try {
        await Toast.fire({
          icon: 'success',
          title: `Trabajo ${accion} con éxito`,
          timer: 1200
        });
      } catch (e) {
        // ignore
      }

      onSave(data);
      setLoading(false);
      onClose();
    } catch (e: any) {
      setError(e.message || "Error en la petición");
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-[#D9D9D9] w-[850px] rounded-2xl shadow-xl relative p-6 max-h-[95vh] overflow-y-auto">
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
            ${
              tipo === "nacional"
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
            ${
              tipo === "internacional"
                ? "bg-[#00c9a7] text-white"
                : "bg-[#cfcfcf] text-gray-700"
            }`}
          >
            Reunión Internacional
          </button>
        </div>

        {/* FORM */}
        <div className="grid grid-cols-2 gap-6 text-sm">
          {/* Dropdown 1: Grupo */}
          <div>
            <label className="font-semibold text-black">
              Seleccionar Grupo
            </label>
            <select
              className="input-base mt-1 w-full p-2 border border-gray-300 rounded-md"
              value={selectedGrupoId}
              onChange={(e) => {
                setSelectedGrupoId(Number(e.target.value));
                setSelectedMemoriaId(""); // Resetear memoria al cambiar de grupo
              }}
            >
              <option value="">-- Elija un grupo --</option>
              {grupos.map((grupo) => (
                <option key={grupo.id} value={grupo.id}>
                  {grupo.nombre}
                </option>
              ))}
            </select>
            {fieldErrors.memoria_id && <Hint show={true} message={fieldErrors.memoria_id} type="error" />}
          </div>

          {/* Dropdown 2: Memoria */}
          <div>
            <label className="font-semibold text-black">
              Seleccionar Memoria
            </label>
            <select
              className={`input-base mt-1 w-full p-2 rounded-md disabled:bg-gray-200 disabled:text-gray-500 ${
                fieldErrors.memoria_id
                  ? 'border-2 border-red-500 focus:outline-none focus:ring-red-500'
                  : 'border border-gray-300'
              }`}
              value={selectedMemoriaId}
              onChange={(e) => setSelectedMemoriaId(Number(e.target.value))}
              disabled={!selectedGrupoId}
            >
              <option value="">
                {selectedGrupoId
                  ? "-- Elija una memoria --"
                  : "-- Primero seleccione un grupo --"}
              </option>
              {memoriasDelGrupo.map((mem) => (
                <option key={mem.id} value={mem.id}>
                  {mem.anio} -{" "}
                  {mem.contenido
                    ? mem.contenido.substring(0, 40) + "..."
                    : "Sin contenido"}
                </option>
              ))}
            </select>
            {fieldErrors.memoria_id && <Hint show={true} message={fieldErrors.memoria_id} type="error" />}
          </div>
          {/* NOMBRE REUNI\u00d3N */}
          <div>
            <label className="font-semibold text-black">
              Nombre de la Reunion
            </label>
            <input
              className={`input-base mt-1 ${
                fieldErrors.nombreReunion
                  ? 'border-2 border-red-500 focus:outline-none focus:ring-red-500'
                  : ''
              }`}
              placeholder={
                tipo === "nacional"
                  ? "Congreso"
                  : "Nombre de la reunion internacional"
              }
              value={form.nombreReunion}
              onChange={(e) => handleChange("nombreReunion", e.target.value)}
              onBlur={() => {
                const errs = { ...fieldErrors };
                if (!form.nombreReunion || !String(form.nombreReunion).trim()) {
                  errs.nombreReunion = 'El nombre de la reunion es obligatorio';
                } else {
                  delete errs.nombreReunion;
                }
                setFieldErrors(errs);
              }}
            />
            {fieldErrors.nombreReunion && (
              <Hint show={true} message={fieldErrors.nombreReunion} type="error" />
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
            <label className="font-semibold text-black">
              Nombre de Expositor/a
            </label>
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

          {/* T\u00cdTULO */}
          <div className="col-span-2">
            <label className="font-semibold text-black">
              Titulo del Trabajo
            </label>
            <input
              className={`input-base mt-1 ${
                fieldErrors.titulo
                  ? 'border-2 border-red-500 focus:outline-none focus:ring-red-500'
                  : ''
              }`}
              placeholder="Titulo"
              value={form.titulo}
              onChange={(e) => handleChange("titulo", e.target.value)}
              onBlur={() => {
                const errs = { ...fieldErrors };
                if (!form.titulo || !String(form.titulo).trim()) {
                  errs.titulo = 'El titulo es obligatorio';
                } else {
                  delete errs.titulo;
                }
                setFieldErrors(errs);
              }}
            />
            {fieldErrors.titulo && (
              <Hint show={true} message={fieldErrors.titulo} type="error" />
            )}
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
                className={`input-base mt-1 ${
                  fieldErrors.pais
                    ? 'border-2 border-red-500 focus:outline-none focus:ring-red-500'
                    : ''
                }`}
                placeholder="España"
                value={form.pais}
                onChange={(e) => handleChange("pais", e.target.value)}
                onBlur={() => {
                  const errs = { ...fieldErrors };
                  if (tipo === 'internacional' && (!form.pais || !String(form.pais).trim())) {
                    errs.pais = 'Indica el país para reuniones internacionales';
                  } else {
                    delete errs.pais;
                  }
                  setFieldErrors(errs);
                }}
              />
            )}
            {fieldErrors.pais && (
              <Hint show={true} message={fieldErrors.pais} type="error" />
            )}
          </div>
        </div>

        {/* BOTÓN GUARDAR */}
        {error && <div className="text-red-600 mt-4">{error}</div>}
        <div className="flex justify-end mt-6">
          <button
            onClick={handleSave}
            disabled={loading}
            className={`px-8 py-3 rounded-md text-white font-medium text-lg ${
              loading ? "bg-gray-400 cursor-not-allowed" : "bg-[#00c9a7] hover:bg-[#00b197]"
            }`}
          >
            {loading ? "Guardando..." : "Guardar Trabajo"}
          </button>
        </div>
      </div>
    </div>
  );
}
