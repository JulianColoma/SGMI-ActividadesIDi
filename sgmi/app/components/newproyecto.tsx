"use client";

import { useState, useEffect } from "react";
import Hint from "./alerts/Hint";

// Definimos las interfaces 
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

export default function NewProyecto({
  open,
  onClose,
  onBack,
  onSave,
  initialData,
  lockMemoria = false, 
}: {
  open: boolean;
  onClose: () => void;
  onBack: () => void;
  onSave: (data: any) => void;
  initialData?: any;
  lockMemoria?: boolean; 
}) {
  if (!open) return null;

  // Estados del formulario
  const [fuente_financiamiento, setFinanciamiento] = useState("");
  const [logros, setLogros] = useState("");
  const [dificultades, setDificultades] = useState("");

  // Estados para los selectores
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [selectedGrupoId, setSelectedGrupoId] = useState<number | string>(""); 
  const [selectedMemoriaId, setSelectedMemoriaId] = useState<number | string>("");
  const [fieldErrors, setFieldErrors] = useState<Record<string,string>>({});

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
 
  useEffect(() => {
    if (open) {
      if (initialData) {
        // --- MODO EDICIÓN O PRE-CARGA ---
        setFinanciamiento(initialData.fuente_financiamiento ?? "");
        setLogros(initialData.logros ?? "");
        setDificultades(initialData.dificultades ?? "");

        // Si viene un memoria_id (ya sea por edición o por bloqueo desde el padre)
        if (initialData.memoria_id && grupos.length > 0) {
          const grupoPadre = grupos.find(g => 
            g.memorias.some(m => m.id === initialData.memoria_id)
          );
          
          if (grupoPadre) {
            setSelectedGrupoId(grupoPadre.id);
            setSelectedMemoriaId(initialData.memoria_id);
          }
        }
      } else {
        // --- MODO NUEVO LIMPIO ---
        setFinanciamiento("");
        setLogros("");
        setDificultades("");
        setSelectedGrupoId("");
        setSelectedMemoriaId("");
        setFieldErrors({}); 
      }
    }
  }, [open, initialData, grupos]);

  // Filtrar las memorias disponibles según el grupo seleccionado
  const memoriasDelGrupo = grupos.find(g => g.id === Number(selectedGrupoId))?.memorias || [];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-[#D9D9D9] w-[900px] rounded-2xl shadow-xl relative p-6 max-h-[95vh] overflow-y-auto">
        
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

          {/* --- Dropdown 1: Grupo --- */}
          <div>
            <label className="font-semibold text-black">Seleccionar Grupo</label>
            <select
              // Si lockMemoria es true, deshabilitamos el select
              disabled={lockMemoria} 
              className={`input-base mt-1 w-full p-2 rounded-md ${
                fieldErrors.selectedGrupoId
                  ? 'border-2 border-red-500 focus:outline-none focus:ring-red-500'
                  : 'border border-gray-300'
              } ${lockMemoria ? 'bg-gray-200 text-gray-600 cursor-not-allowed' : ''}`} // Estilo visual bloqueado
              value={selectedGrupoId}
              onChange={(e) => {
                setSelectedGrupoId(Number(e.target.value));
                setSelectedMemoriaId(""); 
                const errs = { ...fieldErrors };
                if (e.target.value) delete errs.selectedGrupoId;
                setFieldErrors(errs);
              }}
            >
              <option value="">-- Elija un grupo --</option>
              {grupos.map((grupo) => (
                <option key={grupo.id} value={grupo.id}>
                  {grupo.nombre}
                </option>
              ))}
            </select>
            {fieldErrors.selectedGrupoId && <Hint show={true} message={fieldErrors.selectedGrupoId} type="error" />}
          </div>

          {/* --- Dropdown 2: Memoria (Dependiente) --- */}
          <div>
            <label className="font-semibold text-black">Seleccionar Memoria</label>
            <select
              // Si lockMemoria es true O no hay grupo, deshabilitamos
              disabled={!selectedGrupoId || lockMemoria} 
              className={`input-base mt-1 w-full p-2 rounded-md disabled:bg-gray-200 disabled:text-gray-500 ${
                fieldErrors.memoria_id
                  ? 'border-2 border-red-500 focus:outline-none focus:ring-red-500'
                  : 'border border-gray-300'
              } ${lockMemoria ? 'cursor-not-allowed' : ''}`}
              value={selectedMemoriaId}
              onChange={(e) => setSelectedMemoriaId(Number(e.target.value))}
            >
              <option value="">
                {selectedGrupoId ? "-- Elija una memoria --" : "-- Primero seleccione un grupo --"}
              </option>
              {memoriasDelGrupo.map((mem) => (
                <option key={mem.id} value={mem.id}>
                  {mem.anio} - {mem.contenido ? mem.contenido.substring(0, 60) + "..." : "Sin contenido"}
                </option>
              ))}
            </select>
            {selectedGrupoId && memoriasDelGrupo.length === 0 && (
              <p className="text-red-500 text-xs mt-1">Este grupo no tiene memorias cargadas.</p>
            )}
            {fieldErrors.memoria_id && <Hint show={true} message={fieldErrors.memoria_id} type="error" />}
          </div>

          {/* Financiamiento */}
          <div>
            <label className="font-semibold text-black">Financiamiento</label>
            <input
              type="text"
              placeholder="Banco Galicia..."
              className={`input-base mt-1 w-full p-2 rounded-md ${
                fieldErrors.fuente_financiamiento
                  ? 'border-2 border-red-500 focus:outline-none focus:ring-red-500'
                  : 'border border-gray-300'
              }`}
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
              className={`input-base mt-1 w-full p-2 rounded-md ${
                fieldErrors.logros
                  ? 'border-2 border-red-500 focus:outline-none focus:ring-red-500'
                  : 'border border-gray-300'
              }`}
              value={logros}
              onChange={(e) => setLogros(e.target.value)}
            />
          </div>

          {/* Dificultades */}
          <div>
            <label className="font-semibold text-black">Dificultades</label>
            <textarea
              placeholder="Dificultad 1..."
              className="textarea-base h-36 w-full p-2 border border-gray-300 rounded-md"
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
            onClick={() => {
              const errs: Record<string,string> = {};
              if (!selectedGrupoId) errs.selectedGrupoId = 'Selecciona un grupo para el proyecto';
              if (!selectedMemoriaId) errs.memoria_id = 'Selecciona la memoria vinculada al proyecto';
              if (Object.keys(errs).length) { setFieldErrors(errs); return; }
              setFieldErrors({});
              onSave({
                fuente_financiamiento,
                logros,
                dificultades,
                memoria_id: Number(selectedMemoriaId) // Enviamos la memoria vinculada
              })
            }}
            className={`px-10 py-3 rounded-md font-medium text-lg text-white bg-[#00c9a7] hover:bg-[#00b197]`}
          >
            Guardar Proyecto
          </button>

        </div>
      </div>
    </div>
  );
}