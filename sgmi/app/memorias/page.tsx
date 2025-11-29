"use client";

import Sidebar from "@/app/components/sidebar";
import { useRouter } from "next/navigation";
import { HiOutlineEye, HiOutlineTrash } from "react-icons/hi";

export default function MemoriasPage() {
  const router = useRouter();

  // Ejemplo de datos
  const grupos = [
    {
      id: "Grupo01",
      memorias: [
        { id: "2025", nombre: "Memoria Anual 2025" },
        { id: "2024", nombre: "Memoria Anual 2024" }
      ]
    },
    {
      id: "Grupo03",
      memorias: [
        { id: "2005", nombre: "Memoria Anual 2005" },
        { id: "2003", nombre: "Memoria Anual 2003" }
      ]
    }
  ];

  return (
    <div className="min-h-screen flex bg-white">

      <Sidebar />

      <main className="flex-1 px-12 py-8">

        <h1 className="text-3xl font-semibold text-gray-800 mb-8">
          Gestión de memorias
        </h1>

        {/* BUSCADOR */}
        <input
          placeholder="Buscar grupo"
          className="w-80 bg-gray-100 border border-gray-300 rounded-full px-4 py-2 mb-8"
        />

        {grupos.map((grupo) => (
          <div key={grupo.id} className="mb-10">

            <div className="bg-[#d3d3d3] px-4 py-3 rounded-t-lg font-semibold">
              {grupo.id}
            </div>

            {grupo.memorias.map((mem) => (
              <div
                key={mem.id}
                className="bg-white px-4 py-3 border-b flex justify-between items-center"
              >
                <span>{mem.nombre}</span>

                <div className="flex gap-4">
                  <HiOutlineEye
                    className="w-6 h-6 text-[#00c9a7] cursor-pointer"
                    onClick={() => router.push(`/memorias/${mem.id}`)}
                  />

                  <HiOutlineTrash className="w-6 h-6 text-red-500 cursor-pointer" />
                </div>
              </div>
            ))}

            <div className="bg-[#ededed] px-4 py-3 rounded-b-lg">
              <button className="bg-[#00c9a7] text-white px-3 py-1 rounded-md text-sm">
                + Agregar
              </button>
            </div>
          </div>
        ))}

      </main>

    </div>
  );
}
