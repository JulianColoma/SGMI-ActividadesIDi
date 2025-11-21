// app/proyectos/page.tsx
"use client";

import { HiOutlineUserCircle, HiOutlineSearch } from "react-icons/hi";

export default function ProyectosPage() {
  return (
    <div className="min-h-screen flex bg-white">
      {/* SIDEBAR IZQUIERDA (vacía por ahora) */}
      <aside className="w-64 bg-[#27333d]" />

      {/* CONTENIDO PRINCIPAL */}
      <main className="flex-1 flex flex-col px-12 py-8">
        {/* BARRA SUPERIOR: TÍTULO + USUARIO */}
        <header className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-semibold text-[#374151] leading-tight">
              Gestión de Proyectos
              <br />
              de I+D+i
            </h1>
          </div>

          <div className="flex items-center gap-3 text-sm text-[#4b5563]">
            <span>Nombre de Usuario</span>
            <HiOutlineUserCircle className="w-7 h-7" />
          </div>
        </header>

        {/* BUSCADOR + BOTÓN AÑADIR */}
        <div className="flex items-center justify-between mb-5">
          <div className="relative w-80">
            <span className="absolute inset-y-0 left-3 flex items-center">
              <HiOutlineSearch className="w-4 h-4 text-gray-400" />
            </span>
            <input
              type="text"
              placeholder="Buscar proyecto"
              className="w-full rounded-full bg-[#f3f4f6] border border-[#e5e7eb] pl-9 pr-4 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#00c9a7]"
            />
          </div>

          <button className="px-5 py-2 rounded-md text-sm font-medium text-white bg-[#00c9a7] shadow-sm hover:bg-[#00b197]">
            + Añadir Proyecto
          </button>
        </div>

        {/* TABLA DE PROYECTOS (estructura vacía) */}
        <section className="flex-1 overflow-hidden">
          <div className="border border-[#d1d5db] rounded-lg overflow-hidden">
            {/* Encabezado */}
            <div className="grid grid-cols-3 bg-[#e5e7eb] text-sm font-medium text-[#4b5563]">
              <div className="px-4 py-3 border-r border-[#d1d5db]">
                Nombre del Proyecto
              </div>
              <div className="px-4 py-3 border-r border-[#d1d5db]">Código</div>
              <div className="px-4 py-3">Tipo de Proyecto</div>
            </div>

            {/* Filas vacías (efecto de “skeleton”) */}
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={`grid grid-cols-3 text-sm ${
                  i % 2 === 0 ? "bg-[#f9fafb]" : "bg-[#f3f4f6]"
                }`}
              >
                <div className="px-4 py-4 border-r border-[#e5e7eb]" />
                <div className="px-4 py-4 border-r border-[#e5e7eb]" />
                <div className="px-4 py-4" />
              </div>
            ))}
          </div>
        </section>

        {/* PAGINACIÓN */}
        <div className="mt-6 flex justify-center items-center gap-4 text-sm text-[#4b5563]">
          <button className="px-2 py-1 rounded hover:bg-gray-100">←</button>
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-[#27333d] text-white text-xs">
            1
          </span>
          <span>…</span>
          <button className="px-2 py-1 rounded hover:bg-gray-100">→</button>
        </div>
      </main>
    </div>
  );
}
