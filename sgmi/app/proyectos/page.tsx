"use client";

import { HiOutlineUserCircle, HiOutlineSearch } from "react-icons/hi";
import Link from "next/link";
import Sidebar from "../components/sidebar";
import NewProyecto from "../components/newproyecto";
import { useState } from "react";
import ModalProyectoDatos from "../components/modalProyectorsDatos";


export default function ProyectosPage() {

  const [modalDatos, setModalDatos] = useState(false);
  const [modalDetalles, setModalDetalles] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#f3f4f6] font-sans">
      
      <Sidebar />

      <main className="flex-1 px-12 py-8 bg-white">
        
        <div className="flex items-center justify-between mb-10">
          
          <h1 className="text-3xl font-semibold text-gray-800 whitespace-nowrap leading-normal">
            Gestión de Proyectos de I+D+i
          </h1>

          <div className="flex items-center gap-2 text-gray-700 whitespace-nowrap">
            <span className="text-sm">Nombre de Usuario</span>
            <HiOutlineUserCircle className="w-7 h-7 mt-[1px]" />
          </div>
        </div>

        <div className="flex items-center justify-between mb-6">
          <div className="relative w-80">
            <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Buscar proyecto"
              className="w-full bg-[#f3f4f6] border border-[#e5e7eb] rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#00c9a7]"
            />
          </div>

          <button
            onClick={() => setModalDatos(true)}
            className="px-5 py-2 rounded-md text-sm font-medium text-white bg-[#00c9a7] shadow-sm hover:bg-[#00b197]"
          >
            + Añadir Proyecto
          </button>
        </div>

        <div className="border border-gray-300 rounded-lg overflow-hidden">
          
          <div className="grid grid-cols-3 bg-[#e5e7eb] border-b border-gray-300 text-sm font-medium text-gray-700">
            <div className="px-4 py-3 border-r border-gray-300">Nombre del Proyecto</div>
            <div className="px-4 py-3 border-r border-gray-300">Código</div>
            <div className="px-4 py-3">Tipo de Proyecto</div>
          </div>

          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className={`grid grid-cols-3 ${
                i % 2 === 0 ? "bg-[#f9fafb]" : "bg-[#f3f4f6]"
              }`}
            >
              <div className="px-4 py-4 border-r border-gray-300"></div>
              <div className="px-4 py-4 border-r border-gray-300"></div>
              <div className="px-4 py-4"></div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-center items-center gap-4 text-gray-600 text-sm">
          <button className="px-2 py-1 hover:bg-gray-100 rounded">←</button>
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-[#27333d] text-white text-xs">
            1
          </span>
          <span>…</span>
          <button className="px-2 py-1 hover:bg-gray-100 rounded">→</button>
        </div>
      </main>

      {modalDatos && (
        <ModalProyectoDatos
        open={modalDatos}
        onClose={() => setModalDatos(false)}
        onNext={() => {
          setModalDatos(false);
          setModalDetalles(true);
        }}
      />
      )}
      {modalDetalles && (
        <NewProyecto
        open={modalDetalles}
        onClose={() => setModalDetalles(false)}
        onBack={() => {
        setModalDetalles(false);
        setModalDatos(true);
      }}
    onSave={() => console.log("guardar")}
  />
)}
    </div>
  );
}
