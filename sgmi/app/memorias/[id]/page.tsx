"use client";

import Sidebar from "@/app/components/sidebar";
import { useParams } from "next/navigation";
import { useState } from "react";

import {
    HiOutlineSearch,
    HiOutlineEye,
    HiOutlineTrash,
} from "react-icons/hi";

import ModalTrabajo from "@/app/components/modalTrabajo";
import ModalProyectoDatos from "@/app/components/modalProyectorsDatos";
import NewProyecto from "@/app/components/newproyecto";
import UserPill from "@/app/components/userPill";
import { withAuth } from "@/app/withAuth";

function MemoriaDetallePage() {
    const { id } = useParams();

    // TABS
    const [tab, setTab] = useState<"trabajos" | "proyectos">("trabajos");
    // Buscador proyectos
    const [busquedaProyecto, setBusquedaProyecto] = useState("");

    // Estado nacional/internacional
    const [modoGlobal, setModoGlobal] = useState(false); // false = nacional, true = internacional

    // Buscador trabajos
    const [busqueda, setBusqueda] = useState("");

    // MODALES
    const [openTrabajo, setOpenTrabajo] = useState(false);
    const [modalProyectoDatos, setModalProyectoDatos] = useState(false);
    const [modalProyectoDetalles, setModalProyectoDetalles] = useState(false);

    // DATOS
    const [trabajos, setTrabajos] = useState([
        {
            nombreReunion: "Congreso Nacional",
            ciudad: "Buenos Aires",
            fecha: "2025-03-12",
            titulo: "Análisis de polímeros",
            expositor: "Juan Pérez",
            pais: "Argentina",
        },
        {
            nombreReunion: "Congreso Internacional",
            ciudad: "Madrid",
            fecha: "2026-04-20",
            titulo: "Nanoestructuras",
            expositor: "Laura Gómez",
            pais: "España",
        },
    ]);

    const [proyectos, setProyectos] = useState([
        { nombre: "Proyecto Energía Solar", codigo: "001", tipo: "Energía" },
        { nombre: "Proyecto Nanotech", codigo: "002", tipo: "Tecnología" },
    ]);

    // GUARDAR TRABAJO
    function guardarTrabajo(data: any) {
        setTrabajos([...trabajos, data]);
        setOpenTrabajo(false);
    }

    // GUARDAR PROYECTO
    function guardarProyecto() {
        setProyectos([
            ...proyectos,
            { nombre: "Proyecto nuevo", codigo: "000", tipo: "General" },
        ]);
        setModalProyectoDetalles(false);
    }

    return (
        <div className="min-h-screen flex bg-[#f3f4f6] font-sans">
            <Sidebar />

            <main className="flex-1 px-12 py-8 bg-white">

                {/* HEADER */}
                <div className="flex items-center justify-between mb-10">
                    <h1 className="text-3xl font-semibold text-gray-800">Memoria {id}</h1>

                    <UserPill/>
                </div>
                <p className="text-l font-semibold text-gray-800 mt-2 mb-5">aca va el contenido de la memoria pa</p>

                {/* TABS */}
                <div className="flex gap-8 border-b border-gray-300 mb-8">
                    <button
                        onClick={() => setTab("trabajos")}
                        className={`pb-3 text-sm font-semibold transition ${tab === "trabajos"
                                ? "text-[#00c9a7] border-b-2 border-[#00c9a7]"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Trabajos presentados
                    </button>

                    <button
                        onClick={() => setTab("proyectos")}
                        className={`pb-3 text-sm font-semibold transition ${tab === "proyectos"
                                ? "text-[#00c9a7] border-b-2 border-[#00c9a7]"
                                : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Proyectos vinculados
                    </button>
                </div>

                {/* ===================================================================
                        SECCIÓN TRABAJOS PRESENTADOS
        =================================================================== */}
                {tab === "trabajos" && (
                    <>
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
                                    className="w-full bg-[#f3f4f6] border border-[#e5e7eb] rounded-full pl-9 pr-4 py-2 text-sm 
                  focus:outline-none focus:ring-1 focus:ring-[#00c9a7]"
                                />
                            </div>

                            <div className="flex items-center gap-4">

                                {/* TOGGLE */}
                                <div
                                    onClick={() => setModoGlobal(!modoGlobal)}
                                    className={`w-20 h-9 flex items-center rounded-full p-1 cursor-pointer transition-all 
                    ${modoGlobal ? "bg-[#00c9a7]" : "bg-gray-300"}`}
                                >
                                    <div
                                        className={`w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center transition-all
                      ${modoGlobal ? "translate-x-11" : "translate-x-0"}`}
                                    >
                                        {modoGlobal ? "🌍" : "🇦🇷"}
                                    </div>
                                </div>

                                {/* BOTÓN AÑADIR */}
                                <button
                                    onClick={() => setOpenTrabajo(true)}
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
                                <div className="px-4 py-3 text-center">Acciones</div>
                            </div>

                            {/* FILAS */}
                            {trabajos
                                .filter((t) =>
                                    modoGlobal ? t.pais !== "Argentina" : t.pais === "Argentina"
                                )
                                .filter((t) =>
                                    t.titulo.toLowerCase().includes(busqueda.toLowerCase())
                                )
                                .map((t, i) => (
                                    <div
                                        key={i}
                                        className={`grid grid-cols-5 ${i % 2 === 0 ? "bg-[#f9fafb]" : "bg-[#f3f4f6]"
                                            }`}
                                    >
                                        <div className="px-4 py-4 border-r border-gray-300">
                                            {t.nombreReunion}
                                        </div>

                                        <div className="px-4 py-4 border-r border-gray-300">
                                            {modoGlobal ? t.pais : t.ciudad}
                                        </div>

                                        <div className="px-4 py-4 border-r border-gray-300">
                                            {t.fecha}
                                        </div>

                                        <div className="px-4 py-4 border-r border-gray-300">
                                            {t.titulo}
                                        </div>

                                        <div className="px-4 py-4 flex justify-center gap-5">
                                            <HiOutlineEye className="w-6 h-6 text-[#00c9a7] cursor-pointer" />
                                            <HiOutlineTrash className="w-6 h-6 text-red-500 cursor-pointer" />
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </>
                )}

                {/* ===================================================================
                            SECCIÓN PROYECTOS VINCULADOS
        =================================================================== */}
                {tab === "proyectos" && (
                    <>

                        {/* BUSCADOR + BOTÓN AGREGAR */}
                        <div className="flex items-center justify-between mb-6">

                            {/* BUSCADOR */}
                            <div className="relative w-80">
                                <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Buscar proyecto"
                                    value={busquedaProyecto}
                                    onChange={(e) => setBusquedaProyecto(e.target.value)}
                                    className="w-full bg-[#f3f4f6] border border-[#e5e7eb] rounded-full pl-9 pr-4 py-2 text-sm 
                     focus:outline-none focus:ring-1 focus:ring-[#00c9a7]"
                                />
                            </div>

                            {/* BOTÓN AÑADIR */}
                            <button
                                onClick={() => setModalProyectoDatos(true)}
                                className="px-5 py-2 rounded-md text-sm font-medium text-white bg-[#00c9a7] hover:bg-[#00b197]"
                            >
                                + Añadir Proyecto
                            </button>
                        </div>

                        {/* TABLA PROYECTOS */}
                        <div className="border border-gray-300 rounded-lg overflow-hidden">

                            {/* ENCABEZADOS */}
                            <div className="grid grid-cols-4 bg-[#e5e7eb] border-b border-gray-300 text-sm font-medium text-gray-700">
                                <div className="px-4 py-3 border-r border-gray-300">Nombre del Proyecto</div>
                                <div className="px-4 py-3 border-r border-gray-300">Código</div>
                                <div className="px-4 py-3 border-r border-gray-300">Tipo de Proyecto</div>
                                <div className="px-4 py-3 text-center">Acciones</div>
                            </div>

                            {/* FILAS */}
                            {proyectos
                                .filter((p) =>
                                    p.nombre.toLowerCase().includes(busquedaProyecto.toLowerCase())
                                )
                                .map((p, i) => (
                                    <div
                                        key={i}
                                        className={`grid grid-cols-4 ${i % 2 === 0 ? "bg-[#f9fafb]" : "bg-[#f3f4f6]"
                                            }`}
                                    >
                                        <div className="px-4 py-4 border-r border-gray-300">{p.nombre}</div>
                                        <div className="px-4 py-4 border-r border-gray-300">{p.codigo}</div>
                                        <div className="px-4 py-4 border-r border-gray-300">{p.tipo}</div>

                                        {/* ACCIONES */}
                                        <div className="px-4 py-4 flex justify-center gap-5">
                                            <HiOutlineEye className="w-6 h-6 text-[#00c9a7] cursor-pointer hover:text-[#009c88]" />
                                            <HiOutlineTrash className="w-6 h-6 text-red-500 cursor-pointer hover:text-red-700" />
                                        </div>
                                    </div>
                                ))}
                        </div>
                    </>
                )}

            </main>

            {/* MODAL TRABAJO */}
            <ModalTrabajo
                open={openTrabajo}
                modoInicial={modoGlobal ? "internacional" : "nacional"}
                onClose={() => setOpenTrabajo(false)}
                onSave={guardarTrabajo}
            />

            {/* MODALES PROYECTO */}
            <ModalProyectoDatos
                open={modalProyectoDatos}
                onClose={() => setModalProyectoDatos(false)}
                onNext={() => {
                    setModalProyectoDatos(false);
                    setModalProyectoDetalles(true);
                }}
            />

            <NewProyecto
                open={modalProyectoDetalles}
                onClose={() => setModalProyectoDetalles(false)}
                onBack={() => {
                    setModalProyectoDetalles(false);
                    setModalProyectoDatos(true);
                }}
                onSave={guardarProyecto}
            />
        </div>
    );
}

export default withAuth(MemoriaDetallePage);