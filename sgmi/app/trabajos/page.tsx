"use client";

import { useState } from "react";
import Sidebar from "../components/sidebar";
import { HiOutlineUserCircle, HiOutlineSearch } from "react-icons/hi";
import ModalTrabajo from "../components/modalTrabajo";

// Datos demo (después conectamos API real)
const trabajosDemo = [
    {
        reunion: "Reunión A",
        ciudad: "Buenos Aires",
        pais: "Argentina",
        fecha: "2024-01-10",
        trabajo: "Análisis de Energías Renovables",
        tipo: "nacional",
    },
    {
        reunion: "Reunión B",
        ciudad: "Madrid",
        pais: "España",
        fecha: "2024-02-20",
        trabajo: "Investigación en Nanomateriales",
        tipo: "internacional",
    },
    {
        reunion: "Reunión C",
        ciudad: "Córdoba",
        pais: "Argentina",
        fecha: "2024-03-12",
        trabajo: "Desarrollo Agroindustrial",
        tipo: "nacional",
    },
    {
        reunion: "Reunión D",
        ciudad: "París",
        pais: "Francia",
        fecha: "2024-04-01",
        trabajo: "Estudio de Baterías de Litio",
        tipo: "internacional",
    },
];

export default function TrabajosPage() {
    const [openModalTrabajo, setOpenModalTrabajo] = useState(false);
    const [modoGlobal, setModoGlobal] = useState(false); // false=nacional 🇦🇷 / true=global 🌍
    const [busqueda, setBusqueda] = useState("");

    // Filtra por nacional / internacional
    const filtrados = trabajosDemo.filter((t) =>
        modoGlobal ? t.tipo === "internacional" : t.tipo === "nacional"
    );

    // Filtra por texto del buscador
    const trabajosFinal = filtrados.filter((t) =>
        t.trabajo.toLowerCase().includes(busqueda.toLowerCase())
    );

    return (
        <div className="min-h-screen flex bg-[#f3f4f6] font-sans">
            <Sidebar />

            {/* CONTENIDO PRINCIPAL */}
            <main className="flex-1 px-12 py-8 bg-white">

                {/* HEADER SUPERIOR */}
                <div className="flex items-center justify-between mb-10">
                    <h1 className="text-3xl font-semibold text-gray-800">
                        Gestión de Trabajos Presentados en Reuniones
                    </h1>

                    <div className="flex items-center gap-2 text-gray-700">
                        <span className="text-sm">Nombre de Usuario</span>
                        <HiOutlineUserCircle className="w-7 h-7" />
                    </div>
                </div>

                {/* BUSCADOR + TOGGLE + BOTÓN */}
                <div className="flex items-center justify-between mb-6">

                    {/* BUSCADOR */}
                    <div className="relative w-80">
                        <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Buscar trabajo"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="w-full bg-[#f3f4f6] border border-[#e5e7eb] rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#00c9a7]"
                        />
                    </div>

                    {/* TOGGLE BONITO */}
                    <div className="flex items-center gap-4">

                        <div
                            onClick={() => setModoGlobal(!modoGlobal)}
                            className={`
                w-20 h-9 flex items-center rounded-full p-1 cursor-pointer transition-all
                ${modoGlobal ? "bg-[#00c9a7]" : "bg-gray-300"}
              `}
                        >
                            <div
                                className={`
                  w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center transition-all
                  ${modoGlobal ? "translate-x-11" : "translate-x-0"}
                `}
                            >
                                {modoGlobal ? "🌍" : "🇦🇷"}
                            </div>
                        </div>

                        {/* Botón de añadir */}
                        <button
                            onClick={() => setOpenModalTrabajo(true)}
                            className="px-5 py-2 rounded-md text-sm font-medium text-white bg-[#00c9a7] hover:bg-[#00b197]"
                        >
                            + Añadir Trabajo
                        </button>

                    </div>
                </div>

                {/* TABLA */}
                <div className="border border-gray-300 rounded-lg overflow-hidden">

                    {/* ENCABEZADOS */}
                    <div className="grid grid-cols-5 bg-[#e5e7eb] border-b border-gray-300 text-sm font-medium text-gray-700">
                        <div className="px-4 py-3 border-r border-gray-300">Reunión</div>
                        <div className="px-4 py-3 border-r border-gray-300">
                            {modoGlobal ? "País" : "Ciudad"}
                        </div>
                        <div className="px-4 py-3 border-r border-gray-300">Fecha</div>
                        <div className="px-4 py-3 border-r border-gray-300">Trabajo</div>
                        <div className="px-4 py-3">Acciones</div>
                    </div>

                    {/* FILAS */}
                    {trabajosFinal.length > 0 ? (
                        trabajosFinal.map((t, i) => (
                            <div
                                key={i}
                                className={`grid grid-cols-5 ${i % 2 === 0 ? "bg-[#f9fafb]" : "bg-[#f3f4f6]"
                                    }`}
                            >
                                <div className="px-4 py-4 border-r border-gray-300 text-gray-700">
                                    {t.reunion}
                                </div>

                                <div className="px-4 py-4 border-r border-gray-300 text-gray-700">
                                    {modoGlobal ? t.pais : t.ciudad}
                                </div>

                                <div className="px-4 py-4 border-r border-gray-300 text-gray-700">
                                    {t.fecha}
                                </div>

                                <div className="px-4 py-4 border-r border-gray-300 text-gray-700">
                                    {t.trabajo}
                                </div>

                                {/* ACCIONES */}
                                <div className="px-4 py-4 flex items-center gap-4">

                                    {/* Ver */}
                                    <button
                                        onClick={() => alert(`Ver trabajo: ${t.trabajo}`)}
                                        className="text-[#00c9a7] hover:text-[#009e84] text-xl"
                                    >
                                        👁️
                                    </button>

                                    {/* Eliminar */}
                                    <button
                                        onClick={() => alert(`Eliminar trabajo: ${t.trabajo}`)}
                                        className="text-red-500 hover:text-red-700 text-xl"
                                    >
                                        🗑️
                                    </button>

                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-6 text-gray-500">
                            No hay trabajos para mostrar
                        </div>
                    )}
                </div>


                {/* PAGINACIÓN */}
                <div className="mt-6 flex justify-center items-center gap-4 text-gray-600 text-sm">
                    <button className="px-2 py-1 hover:bg-gray-100 rounded">←</button>
                    <span className="px-3 py-1 rounded bg-[#27333d] text-white">1</span>
                    <button className="px-2 py-1 hover:bg-gray-100 rounded">→</button>
                </div>
                {openModalTrabajo && (
                    <ModalTrabajo
                        open={openModalTrabajo}
                        modoInicial={modoGlobal ? "internacional" : "nacional"}
                        onClose={() => setOpenModalTrabajo(false)}
                        onSave={() => console.log("Guardar trabajo")}
                    />
                )}

            </main>
        </div>
    );
}
