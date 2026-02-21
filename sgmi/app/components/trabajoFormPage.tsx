"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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

interface TrabajoApiData {
  id?: number;
  reunion_tipo?: string;
  reunion?: string;
  nombreReunion?: string;
  ciudad?: string;
  expositor_nombre?: string;
  expositor?: string;
  fecha_presentacion?: string;
  titulo?: string;
  pais?: string;
  memoria_id?: number;
}

type TipoReunion = "nacional" | "internacional";

export default function TrabajoFormPage({
  mode,
  trabajoId,
  lockMemoria = false,
  forcedMemoriaId,
  modoInicial,
  returnPath = "/trabajos",
}: {
  mode: "create" | "edit";
  trabajoId?: number;
  lockMemoria?: boolean;
  forcedMemoriaId?: number;
  modoInicial?: TipoReunion;
  returnPath?: string;
}) {
  const router = useRouter();
  const isEdit = mode === "edit";

  const [loadingInitial, setLoadingInitial] = useState(isEdit);
  const [initialError, setInitialError] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<TrabajoApiData | null>(null);

  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [selectedGrupoId, setSelectedGrupoId] = useState<number | string>("");
  const [selectedMemoriaId, setSelectedMemoriaId] = useState<number | string>(
    ""
  );

  const [tipo, setTipo] = useState<TipoReunion>("nacional");
  const [form, setForm] = useState({
    nombreReunion: "",
    ciudad: "",
    expositor: "",
    fecha: "",
    titulo: "",
    pais: "Argentina",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const MAX_LONG_TEXT = 255;
  const WARN_THRESHOLD = 30;

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
    const fetchTrabajo = async () => {
      if (!isEdit || !trabajoId) return;
      try {
        setLoadingInitial(true);
        setInitialError(null);
        const res = await fetch(`/api/trabajo/${trabajoId}`, {
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

    fetchTrabajo();
  }, [isEdit, trabajoId]);

  const tipoDerivado = useMemo<TipoReunion>(() => {
    if (!initialData) return "nacional";
    if (initialData.reunion_tipo) {
      return String(initialData.reunion_tipo).toLowerCase() === "internacional"
        ? "internacional"
        : "nacional";
    }
    if (
      initialData.pais &&
      String(initialData.pais).toLowerCase() !== "argentina"
    ) {
      return "internacional";
    }
    return "nacional";
  }, [initialData]);

  useEffect(() => {
    if (isEdit || !modoInicial) return;
    setTipo(modoInicial);
    if (modoInicial === "nacional") {
      setForm((prev) => ({ ...prev, pais: "Argentina" }));
    }
  }, [isEdit, modoInicial]);

  useEffect(() => {
    if (!initialData) return;
    setTipo(tipoDerivado);
    setForm({
      nombreReunion: initialData.reunion || initialData.nombreReunion || "",
      ciudad: initialData.ciudad || "",
      expositor: initialData.expositor_nombre || initialData.expositor || "",
      fecha: initialData.fecha_presentacion
        ? String(initialData.fecha_presentacion).slice(0, 10)
        : "",
      titulo: initialData.titulo || "",
      pais:
        initialData.pais || (tipoDerivado === "nacional" ? "Argentina" : ""),
    });
  }, [initialData, tipoDerivado]);

  useEffect(() => {
    if (!initialData || grupos.length === 0 || !initialData.memoria_id) return;

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
    if (field === "pais" && value.toLowerCase().trim() === "argentina") {
      setTipo("nacional");
      setForm((prev) => ({ ...prev, [field]: "Argentina" }));
      return;
    }
    if (field === "nombreReunion" || field === "titulo") {
      setForm((prev) => ({ ...prev, [field]: value.slice(0, MAX_LONG_TEXT) }));
      return;
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.nombreReunion.trim()) {
      errs.nombreReunion = "El nombre de la reunion es obligatorio";
    }
    if (!form.titulo.trim()) errs.titulo = "El titulo es obligatorio";
    if (form.titulo.trim() && form.titulo.trim().length < 3) {
      errs.titulo = "El titulo debe tener al menos 3 caracteres";
    }
    if (!selectedMemoriaId) errs.memoria_id = "Asigna una memoria al trabajo";
    if (tipo === "internacional" && !form.pais.trim()) {
      errs.pais = "Indica el pais para reuniones internacionales";
    }
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
        titulo: form.titulo,
        fecha_presentacion: form.fecha || undefined,
        resumen: undefined,
        expositor_id: null,
        reunion_id: null,
        memoria_id: selectedMemoriaId ? Number(selectedMemoriaId) : null,
        ciudad: form.ciudad,
        pais: form.pais,
        nombreReunion: form.nombreReunion,
        tipo,
        expositor: form.expositor,
      };

      const url = isEdit ? `/api/trabajo/${trabajoId}` : "/api/trabajo";
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
        title: isEdit
          ? "Trabajo actualizado con exito"
          : "Trabajo creado con exito",
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
  const labelClass = "mb-2 block text-sm font-semibold text-slate-700";
  const textareaClass = `${inputClass} min-h-[84px] resize-y`;
  const nombreRemaining = MAX_LONG_TEXT - form.nombreReunion.length;
  const tituloRemaining = MAX_LONG_TEXT - form.titulo.length;

  return (
    <div className="min-h-screen flex bg-[#f3f4f6]">
      <Sidebar />
      <main className="flex-1 px-4 py-4 md:px-8 lg:px-12 md:py-5 overflow-y-auto h-screen w-full">
        <div className="mb-3 flex items-center justify-end">
          <UserPill />
        </div>

        <section className="mx-auto max-w-6xl px-0 md:px-2">
          <div className="mb-5">
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
              Volver a Trabajos Presentados
            </Link>
            <h1 className="text-2xl md:text-4xl font-semibold text-slate-900">
              {isEdit ? "Editar Reunion" : "Nueva Reunion"}
            </h1>
            <p className="mt-2 text-sm md:text-base text-slate-500">
              Completa los datos del trabajo presentado. Los campos con * son obligatorios.
            </p>
          </div>

          {loadingInitial ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-500">
              Cargando datos...
            </div>
          ) : initialError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-600">
              {initialError}
            </div>
          ) : (
            <div className="space-y-6 pb-2">
              <div>
                <label className={labelClass}>Tipo de Reunion*</label>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => {
                      setTipo("nacional");
                      handleChange("pais", "Argentina");
                    }}
                    className={`rounded-2xl border px-4 py-4 text-left transition ${
                      tipo === "nacional"
                        ? "border-[#00c9a7] bg-[#00c9a7]/10 shadow-[0_4px_16px_rgba(0,201,167,0.18)]"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`h-5 w-5 rounded-full border-2 ${
                          tipo === "nacional"
                            ? "border-[#00c9a7] bg-[#00c9a7]"
                            : "border-slate-300 bg-white"
                        }`}
                      />
                      <div>
                        <p className="font-semibold text-slate-900">Nacional</p>
                        <p className="text-xs text-slate-500">
                          El pais queda fijado automaticamente en Argentina
                        </p>
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTipo("internacional");
                      handleChange("pais", "");
                    }}
                    className={`rounded-2xl border px-4 py-4 text-left transition ${
                      tipo === "internacional"
                        ? "border-[#00c9a7] bg-[#00c9a7]/10 shadow-[0_4px_16px_rgba(0,201,167,0.18)]"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`h-5 w-5 rounded-full border-2 ${
                          tipo === "internacional"
                            ? "border-[#00c9a7] bg-[#00c9a7]"
                            : "border-slate-300 bg-white"
                        }`}
                      />
                      <div>
                        <p className="font-semibold text-slate-900">
                          Internacional
                        </p>
                        <p className="text-xs text-slate-500">
                          Permite cargar pais presentado manualmente
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Grupo*</label>
                  <select
                    value={selectedGrupoId}
                    onChange={(e) => {
                      setIsDirty(true);
                      setSelectedGrupoId(Number(e.target.value));
                      setSelectedMemoriaId("");
                    }}
                    disabled={lockMemoria}
                    className={`${inputClass} disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed`}
                  >
                    <option value="">-- Elija un grupo --</option>
                    {grupos.map((grupo) => (
                      <option key={grupo.id} value={grupo.id}>
                        {grupo.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className={labelClass}>Memoria*</label>
                  <select
                    value={selectedMemoriaId}
                    onChange={(e) => {
                      setIsDirty(true);
                      setSelectedMemoriaId(Number(e.target.value));
                    }}
                    disabled={!selectedGrupoId || lockMemoria}
                    className={`${inputClass} disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed`}
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
                          ? `${mem.contenido.substring(0, 40)}...`
                          : "Sin contenido"}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.memoria_id && (
                    <Hint show={true} message={fieldErrors.memoria_id} type="error" />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className={labelClass}>
                    Nombre completo del Expositor/a*
                  </label>
                  <input
                    value={form.expositor}
                    onChange={(e) => handleChange("expositor", e.target.value)}
                    className={inputClass}
                    placeholder="Nombre completo"
                  />
                </div>
                <div>
                  <label className={labelClass}>Fecha Inicio*</label>
                  <input
                    type="date"
                    value={form.fecha}
                    onChange={(e) => handleChange("fecha", e.target.value)}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Nombre de la Reunion*</label>
                  <textarea
                    value={form.nombreReunion}
                    onChange={(e) => handleChange("nombreReunion", e.target.value)}
                    maxLength={MAX_LONG_TEXT}
                    className={textareaClass}
                    placeholder="Bateria de Litio"
                  />
                  <div
                    className={`mt-2 text-xs ${
                      nombreRemaining <= WARN_THRESHOLD
                        ? "text-amber-600"
                        : "text-slate-500"
                    }`}
                  >
                    {form.nombreReunion.length}/{MAX_LONG_TEXT} caracteres
                    {nombreRemaining <= WARN_THRESHOLD
                      ? ` - Quedan ${nombreRemaining}`
                      : ""}
                  </div>
                  {fieldErrors.nombreReunion && (
                    <Hint show={true} message={fieldErrors.nombreReunion} type="error" />
                  )}
                </div>
                <div>
                  <label className={labelClass}>Titulo del Trabajo Presentado*</label>
                  <textarea
                    value={form.titulo}
                    onChange={(e) => handleChange("titulo", e.target.value)}
                    maxLength={MAX_LONG_TEXT}
                    className={textareaClass}
                    placeholder="Titulo"
                  />
                  <div
                    className={`mt-2 text-xs ${
                      tituloRemaining <= WARN_THRESHOLD
                        ? "text-amber-600"
                        : "text-slate-500"
                    }`}
                  >
                    {form.titulo.length}/{MAX_LONG_TEXT} caracteres
                    {tituloRemaining <= WARN_THRESHOLD
                      ? ` - Quedan ${tituloRemaining}`
                      : ""}
                  </div>
                  {fieldErrors.titulo && (
                    <Hint show={true} message={fieldErrors.titulo} type="error" />
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className={labelClass}>Pais presentado</label>
                  {tipo === "nacional" ? (
                    <div className="relative">
                      <input
                        readOnly
                        value="Argentina"
                        className={`${inputClass} cursor-not-allowed border-dashed border-slate-300 bg-slate-100 pr-28 text-slate-500`}
                      />
                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-slate-300 bg-white px-3 py-1 text-xs font-medium text-slate-500">
                        Bloqueado
                      </span>
                    </div>
                  ) : (
                    <input
                      value={form.pais}
                      onChange={(e) => handleChange("pais", e.target.value)}
                      className={inputClass}
                      placeholder="Pais"
                    />
                  )}
                  {tipo === "nacional" && (
                    <p className="mt-2 text-xs text-slate-500">
                      Este campo se bloquea para reuniones nacionales y se
                      asigna Argentina automaticamente.
                    </p>
                  )}
                  {fieldErrors.pais && (
                    <Hint show={true} message={fieldErrors.pais} type="error" />
                  )}
                </div>

                <div>
                  <label className={labelClass}>Ciudad</label>
                  <input
                    value={form.ciudad}
                    onChange={(e) => handleChange("ciudad", e.target.value)}
                    className={inputClass}
                    placeholder="Ciudad"
                  />
                </div>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="pt-2">
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
          message="Si vuelves ahora, el trabajo no se creara y se perderan los cambios no guardados. Deseas salir?"
        />
      </main>
    </div>
  );
}
