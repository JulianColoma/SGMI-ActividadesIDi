"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HiOutlineArrowLeft } from "react-icons/hi";
import Sidebar from "./sidebar";
import UserPill from "./userPill";
import Hint from "./alerts/Hint";
import ConfirmModal from "./alerts/ConfrimModal";
import { Toast } from "@/app/lib/swal";

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

interface ProyectoApiData {
  id?: number;
  tipo?: string;
  codigo?: string;
  nombre?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
  descripcion?: string;
  logros?: string;
  fuente_financiamiento?: string;
  dificultades?: string;
  memoria_id?: number;
}

const MAX_FINANCIAMIENTO = 200;
const MAX_DESCRIPCION = 1000;
const MAX_LOGROS = 1000;
const MAX_DIFICULTADES = 1000;
const MAX_TIPO = 50;
const MAX_CODIGO = 50;
const MAX_NOMBRE = 255;
const WARN_CHARS = 30;

export default function ProyectoFormPage({
  mode,
  proyectoId,
  lockMemoria = false,
  forcedMemoriaId,
  returnPath = "/proyectos",
}: {
  mode: "create" | "edit";
  proyectoId?: number;
  lockMemoria?: boolean;
  forcedMemoriaId?: number;
  returnPath?: string;
}) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const [loadingInitial, setLoadingInitial] = useState(isEdit);
  const [initialError, setInitialError] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<ProyectoApiData | null>(null);

  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [selectedGrupoId, setSelectedGrupoId] = useState<number | string>("");
  const [selectedMemoriaId, setSelectedMemoriaId] = useState<number | string>(
    ""
  );

  const [form, setForm] = useState({
    tipo: "",
    codigo: "",
    nombre: "",
    fecha_inicio: "",
    fecha_fin: "",
    descripcion: "",
    fuente_financiamiento: "",
    logros: "",
    dificultades: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  useEffect(() => {
    const fetchGrupos = async () => {
      try {
        const res = await fetch("/api/grupo", { credentials: "include" });
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.data)) {
          setGrupos(data.data);
        }
      } catch {
        setGrupos([]);
      }
    };
    fetchGrupos();
  }, []);

  useEffect(() => {
    const fetchProyecto = async () => {
      if (!isEdit || !proyectoId) return;
      try {
        setLoadingInitial(true);
        setInitialError(null);
        const res = await fetch(`/api/investigacion/${proyectoId}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok || !data.success || !data.data) {
          setInitialError(data.error || data.message || "No se pudo cargar");
          return;
        }
        setInitialData(data.data);
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "No se pudo cargar";
        setInitialError(message);
      } finally {
        setLoadingInitial(false);
      }
    };
    fetchProyecto();
  }, [isEdit, proyectoId]);

  useEffect(() => {
    if (!initialData) return;
    setForm({
      tipo: initialData.tipo || "",
      codigo: initialData.codigo || "",
      nombre: initialData.nombre || "",
      fecha_inicio: initialData.fecha_inicio
        ? String(initialData.fecha_inicio).slice(0, 10)
        : "",
      fecha_fin: initialData.fecha_fin
        ? String(initialData.fecha_fin).slice(0, 10)
        : "",
      descripcion: initialData.descripcion || "",
      fuente_financiamiento: initialData.fuente_financiamiento || "",
      logros: initialData.logros || "",
      dificultades: initialData.dificultades || "",
    });
  }, [initialData]);

  useEffect(() => {
    if (!initialData || !initialData.memoria_id || grupos.length === 0) return;
    const grupoPadre = grupos.find((g) =>
      g.memorias.some((m) => m.id === initialData.memoria_id)
    );
    if (grupoPadre) {
      setSelectedGrupoId(grupoPadre.id);
      setSelectedMemoriaId(initialData.memoria_id);
    }
  }, [initialData, grupos]);

  useEffect(() => {
    if (!forcedMemoriaId || grupos.length === 0) return;
    const grupoPadre = grupos.find((g) =>
      g.memorias.some((m) => m.id === forcedMemoriaId)
    );
    if (grupoPadre) {
      setSelectedGrupoId(grupoPadre.id);
      setSelectedMemoriaId(forcedMemoriaId);
    }
  }, [forcedMemoriaId, grupos]);

  const memoriasDelGrupo =
    grupos.find((g) => g.id === Number(selectedGrupoId))?.memorias || [];

  const handleChange = (field: string, value: string) => {
    setIsDirty(true);

    if (field === "fuente_financiamiento") {
      setForm((prev) => ({ ...prev, [field]: value.slice(0, MAX_FINANCIAMIENTO) }));
      return;
    }
    if (field === "descripcion") {
      setForm((prev) => ({ ...prev, [field]: value.slice(0, MAX_DESCRIPCION) }));
      return;
    }
    if (field === "logros") {
      setForm((prev) => ({ ...prev, [field]: value.slice(0, MAX_LOGROS) }));
      return;
    }
    if (field === "dificultades") {
      setForm((prev) => ({ ...prev, [field]: value.slice(0, MAX_DIFICULTADES) }));
      return;
    }
    if (field === "tipo") {
      setForm((prev) => ({ ...prev, [field]: value.slice(0, MAX_TIPO) }));
      return;
    }
    if (field === "codigo") {
      setForm((prev) => ({ ...prev, [field]: value.slice(0, MAX_CODIGO) }));
      return;
    }
    if (field === "nombre") {
      setForm((prev) => ({ ...prev, [field]: value.slice(0, MAX_NOMBRE) }));
      return;
    }

    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.tipo.trim()) errs.tipo = "El tipo es obligatorio";
    if (form.tipo.trim().length > MAX_TIPO) errs.tipo = `Maximo ${MAX_TIPO} caracteres`;
    if (!form.codigo.trim()) errs.codigo = "El codigo es obligatorio";
    if (form.codigo.trim().length > MAX_CODIGO) errs.codigo = `Maximo ${MAX_CODIGO} caracteres`;
    if (!form.nombre.trim()) errs.nombre = "El nombre es obligatorio";
    if (form.nombre.trim().length < 3) {
      errs.nombre = "El nombre debe tener al menos 3 caracteres";
    }
    if (form.nombre.trim().length > MAX_NOMBRE) errs.nombre = `Maximo ${MAX_NOMBRE} caracteres`;
    if (!form.fecha_inicio) errs.fecha_inicio = "La fecha de inicio es obligatoria";
    if (
      form.fecha_inicio &&
      form.fecha_fin &&
      new Date(form.fecha_fin) < new Date(form.fecha_inicio)
    ) {
      errs.fecha_fin = "La fecha de fin no puede ser anterior a la de inicio";
    }
    if (!selectedGrupoId) errs.selectedGrupoId = "Selecciona un grupo";
    if (!selectedMemoriaId) errs.memoria_id = "Selecciona una memoria";
    return errs;
  };

  const handleSave = async () => {
    setError(null);
    const errs = validate();
    setFieldErrors(errs);
    if (Object.keys(errs).length) return;

    try {
      setLoading(true);
      const payload = {
        tipo: form.tipo.trim(),
        codigo: form.codigo.trim(),
        nombre: form.nombre.trim(),
        fecha_inicio: form.fecha_inicio,
        fecha_fin: form.fecha_fin || null,
        descripcion: form.descripcion.trim() || null,
        logros: form.logros.trim() || null,
        dificultades: form.dificultades.trim() || null,
        fuente_financiamiento: form.fuente_financiamiento.trim() || null,
        memoria_id: Number(selectedMemoriaId),
      };

      const url = isEdit ? `/api/investigacion/${proyectoId}` : "/api/investigacion";
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
        return;
      }

      await Toast.fire({
        icon: "success",
        title: isEdit ? "Proyecto actualizado con exito" : "Proyecto creado con exito",
        timer: 1200,
      });

      setIsDirty(false);
      router.push(returnPath);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Error en la peticion";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 shadow-sm transition focus:outline-none focus:ring-2 focus:ring-[#00c9a7]/30 focus:border-[#00c9a7]";
  const textareaClass = `${inputClass} min-h-[110px] resize-y`;
  const labelClass = "mb-2 block text-sm font-semibold text-slate-700";

  const Counter = ({
    used,
    max,
  }: {
    used: number;
    max: number;
  }) => {
    const remain = max - used;
    return (
      <p
        className={`mt-1 text-xs ${
          remain <= WARN_CHARS ? "text-amber-600" : "text-gray-500"
        }`}
      >
        {used}/{max} caracteres {remain <= WARN_CHARS ? `- Quedan ${remain}` : ""}
      </p>
    );
  };

  return (
    <div className="min-h-screen flex bg-[#f3f4f6] font-sans">
      <Sidebar locked />
      <main className="flex-1 px-4 py-5 md:px-10 md:py-6 overflow-y-auto h-screen w-full">
        <div className="mt-12 md:mt-0 mb-4 flex items-center justify-end">
          <UserPill />
        </div>

        <section className="mx-auto max-w-5xl">
            <Link
            href="#"
            onClick={(e) => {
              e.preventDefault();
              if (isDirty) {
                setShowLeaveConfirm(true);
                return;
              }
              router.push(returnPath);
            }}
              className="mb-4 inline-flex items-center gap-2 text-slate-600 hover:text-red-600 transition"
            >
            <HiOutlineArrowLeft className="w-5 h-5" />
            Volver a Proyectos I+D+i
          </Link>
            <h1 className="text-2xl md:text-4xl font-semibold text-slate-900">
              {isEdit ? "Editar Proyecto" : "Nuevo Proyecto"}
            </h1>
            <p className="mt-2 mb-6 text-sm md:text-base text-slate-500">
              Completa los datos del proyecto presentado. Los campos con * son obligatorios.
            </p>

          {loadingInitial ? (
            <div className="text-gray-500 py-4">Cargando datos...</div>
          ) : initialError ? (
            <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-600">
              {initialError}
            </div>
          ) : (
            <div className="space-y-6 pb-2">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className={labelClass}>
                    Tipo de Proyecto*
                  </label>
                  <input
                    value={form.tipo}
                    onChange={(e) => handleChange("tipo", e.target.value)}
                    className={inputClass}
                    placeholder="Medio Ambiente"
                    maxLength={MAX_TIPO}
                  />
                  <Counter used={form.tipo.length} max={MAX_TIPO} />
                  {fieldErrors.tipo && (
                    <Hint show={true} message={fieldErrors.tipo} type="error" />
                  )}
                </div>

                <div>
                  <label className={labelClass}>
                    Nombre del Proyecto*
                  </label>
                  <input
                    value={form.nombre}
                    onChange={(e) => handleChange("nombre", e.target.value)}
                    className={inputClass}
                    placeholder="Bateria de Litio"
                    maxLength={MAX_NOMBRE}
                  />
                  <Counter used={form.nombre.length} max={MAX_NOMBRE} />
                  {fieldErrors.nombre && (
                    <Hint show={true} message={fieldErrors.nombre} type="error" />
                  )}
                </div>
              </div>

              <div>
                <div>
                  <label className={labelClass}>
                    Codigo del Proyecto*
                  </label>
                  <input
                    value={form.codigo}
                    onChange={(e) => handleChange("codigo", e.target.value)}
                    className={inputClass}
                    placeholder="0201201221"
                    maxLength={MAX_CODIGO}
                  />
                  <Counter used={form.codigo.length} max={MAX_CODIGO} />
                  {fieldErrors.codigo && (
                    <Hint show={true} message={fieldErrors.codigo} type="error" />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className={labelClass}>
                    Fecha Inicio*
                  </label>
                  <input
                    type="date"
                    value={form.fecha_inicio}
                    onChange={(e) => handleChange("fecha_inicio", e.target.value)}
                    className={inputClass}
                  />
                  {fieldErrors.fecha_inicio && (
                    <Hint show={true} message={fieldErrors.fecha_inicio} type="error" />
                  )}
                </div>

                <div>
                  <label className={labelClass}>
                    Fecha Fin
                  </label>
                  <input
                    type="date"
                    value={form.fecha_fin}
                    onChange={(e) => handleChange("fecha_fin", e.target.value)}
                    className={inputClass}
                  />
                  {fieldErrors.fecha_fin && (
                    <Hint show={true} message={fieldErrors.fecha_fin} type="error" />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className={labelClass}>
                    Grupo*
                  </label>
                  <select
                    value={selectedGrupoId}
                    onChange={(e) => {
                      setIsDirty(true);
                      setSelectedGrupoId(Number(e.target.value));
                      setSelectedMemoriaId("");
                    }}
                    disabled={lockMemoria}
                    className={`${inputClass} disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed`}
                  >
                    <option value="">-- Elija un grupo --</option>
                    {grupos.map((grupo) => (
                      <option key={grupo.id} value={grupo.id}>
                        {grupo.nombre}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.selectedGrupoId && (
                    <Hint show={true} message={fieldErrors.selectedGrupoId} type="error" />
                  )}
                </div>

                <div>
                  <label className={labelClass}>
                    Memoria*
                  </label>
                  <select
                    value={selectedMemoriaId}
                    onChange={(e) => {
                      setIsDirty(true);
                      setSelectedMemoriaId(Number(e.target.value));
                    }}
                    disabled={!selectedGrupoId || lockMemoria}
                    className={`${inputClass} disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed`}
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
                          ? `${mem.contenido.substring(0, 60)}...`
                          : "Sin contenido"}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.memoria_id && (
                    <Hint show={true} message={fieldErrors.memoria_id} type="error" />
                  )}
                </div>
              </div>

              <div>
                  <label className={labelClass}>
                    Financiamiento
                  </label>
                <textarea
                  value={form.fuente_financiamiento}
                  onChange={(e) => handleChange("fuente_financiamiento", e.target.value)}
                  className={`${inputClass} min-h-[84px] resize-y`}
                  placeholder="Detalle de financiamiento"
                />
                <Counter
                  used={form.fuente_financiamiento.length}
                  max={MAX_FINANCIAMIENTO}
                />
              </div>

              <div>
                  <label className={labelClass}>
                    Descripcion
                  </label>
                <textarea
                  value={form.descripcion}
                  onChange={(e) => handleChange("descripcion", e.target.value)}
                  className={textareaClass}
                  placeholder="Descripcion del proyecto"
                />
                <Counter used={form.descripcion.length} max={MAX_DESCRIPCION} />
              </div>

              <div>
                  <label className={labelClass}>
                    Logros
                  </label>
                <textarea
                  value={form.logros}
                  onChange={(e) => handleChange("logros", e.target.value)}
                  className={textareaClass}
                  placeholder="Logros alcanzados"
                />
                <Counter used={form.logros.length} max={MAX_LOGROS} />
              </div>

              <div>
                  <label className={labelClass}>
                    Dificultades
                  </label>
                <textarea
                  value={form.dificultades}
                  onChange={(e) => handleChange("dificultades", e.target.value)}
                  className={textareaClass}
                  placeholder="Dificultades encontradas"
                />
                <Counter
                  used={form.dificultades.length}
                  max={MAX_DIFICULTADES}
                />
              </div>

              {error && (
                <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={handleSave}
                disabled={loading}
                className={`w-full rounded-xl py-3 text-sm md:text-base font-semibold text-white transition ${
                  loading
                    ? "bg-slate-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#00c9a7] to-[#00b197] hover:brightness-95 shadow-[0_10px_24px_rgba(0,201,167,0.35)]"
                }`}
              >
                {loading ? "Guardando..." : "Guardar Proyecto"}
              </button>
            </div>
          )}
        </section>

        <ConfirmModal
          open={showLeaveConfirm}
          onClose={() => setShowLeaveConfirm(false)}
          onConfirm={() => {
            setShowLeaveConfirm(false);
            router.push(returnPath);
          }}
          message="Si vuelves ahora, el proyecto no se creara y se perderan los cambios no guardados. Deseas salir?"
        />
      </main>
    </div>
  );
}
