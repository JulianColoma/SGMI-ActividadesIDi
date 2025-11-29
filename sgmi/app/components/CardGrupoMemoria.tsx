"use client";

import { HiOutlineEye, HiOutlineTrash, HiOutlineDotsHorizontal } from "react-icons/hi";

export default function CardGrupoMemoria({
  nombre,
  memorias,
  onVer,
  onEliminar,
  onAgregar,
  onOpciones
}: {
  nombre: string;
  memorias: string[];
  onVer?: (mem: string) => void;
  onEliminar?: (mem: string) => void;
  onAgregar?: () => void;
  onOpciones?: () => void;
}) {
  return (
    <div className="bg-[#e2e3e3] rounded-lg shadow-sm">

      {/* TOP BAR */}
      <div className="flex justify-between items-center px-4 py-3 bg-[#d3d3d3] rounded-t-lg">
        <span className="text-lg font-semibold text-gray-800">{nombre}</span>

        <HiOutlineDotsHorizontal
          onClick={onOpciones}
          className="w-6 h-6 text-gray-700 cursor-pointer hover:text-black"
        />
      </div>

      {/* LISTA DE MEMORIAS */}
      <div>
        {memorias.map((mem, idx) => (
          <div
            key={idx}
            className="flex justify-between items-center px-6 py-3 border-b last:border-none bg-white text-gray-700"
          >
            <span>{mem}</span>

            <div className="flex gap-5">
              <HiOutlineEye
                onClick={() => onVer?.(mem)}
                className="w-6 h-6 text-[#00c9a7] cursor-pointer hover:text-[#009e84]"
              />

              <HiOutlineTrash
                onClick={() => onEliminar?.(mem)}
                className="w-6 h-6 text-red-500 cursor-pointer hover:text-red-700"
              />
            </div>
          </div>
        ))}
      </div>

      {/* AGREGAR MEMORIA */}
      <div className="px-6 py-3">
        <button
          onClick={onAgregar}
          className="bg-[#00c9a7] text-white text-xs px-3 py-1 rounded-md hover:bg-[#00b197]"
        >
          + Agregar
        </button>
      </div>

    </div>
  );
}
