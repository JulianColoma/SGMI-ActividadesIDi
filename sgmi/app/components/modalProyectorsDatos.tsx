"use client";

import { useState } from "react";

export default function ModalProyectoDatos({
  open,
  onClose,
  onNext,
}: {
  open: boolean;
  onClose: () => void;
  onNext: () => void;
}) {
  if (!open) return null;

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

          <div className="col-span-1">
            <label className="font-semibold text-black">Tipo de Proyecto</label>
            <select className="input-base mt-1 bg-[#f3f4f6]">
              <option>Medio Ambiente</option>
              <option>Tecnología</option>
              <option>Energía</option>
              <option>Salud</option>
            </select>
          </div>

          <div>
            <label className="font-semibold text-black">Codigo</label>
            <input
              type="text"
              placeholder="001"
              className="input-base mt-1"
            />
          </div>

          <div>
            <label className="font-medium  text-black">Nombre del Proyecto</label>
            <input
              type="text"
              placeholder="001"
              className="input-base mt-1"
            />
          </div>

           <div>
            <label className="font-medium  text-black">Fecha de Inicio</label>
            <div className="relative mt-1">
              <input
                type="text"
                placeholder="001"
              className="input-base mt-1"
              />
            </div>
          </div>

          <div>
            <label className="font-medium  text-black">Fecha de Fin</label>
            <div className="relative mt-1">
              <input
              type="text"
              placeholder="001"
              className="input-base mt-1"
              />
            </div>
          </div>

        </div>

        <div className="mt-6 text-sm">
          <label className="font-medium  text-black">Descripcion</label>
          <textarea
            className="textarea-base h-32 mt-1"
            placeholder="Descripción del Proyecto..."
          ></textarea>
        </div>

        <div className="flex justify-end mt-6">
          <button
            className="px-10 py-3 rounded-md bg-[#00c9a7] text-white font-medium text-lg hover:bg-[#00b197]"
            onClick={onNext}
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
