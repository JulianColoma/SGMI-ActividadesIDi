"use client";

import Sidebar from "@/app/components/sidebar";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import {
    HiOutlineSearch,
    HiOutlineEye,
    HiOutlineTrash,
} from "react-icons/hi";

import ModalProyectoDatos from "@/app/components/modalProyectorsDatos";
import NewProyecto from "@/app/components/newproyecto";
import ModalVerTrabajo from "@/app/components/modalVerTrabajo";
import ModalVerProyecto from "@/app/components/modalVerProyecto";
import Toast from 'sweetalert2';
import UserPill from "@/app/components/userPill";
import { withAuth } from "@/app/withAuth";
import ConfirmModal from "@/app/components/alerts/ConfrimModal";
import ErrorModal from "@/app/components/alerts/ErrorModal";

function MemoriaDetallePage() {
    const { id } = useParams();
    const router = useRouter();

    // DATOS DE LA API
    const [memoria, setMemoria] = useState<any>(null);
    const [trabajos, setTrabajos] = useState<any[]>([]);
    const [proyectos, setProyectos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // TABS
    const [tab, setTab] = useState<"trabajos" | "proyectos">("trabajos");

    // FILTROS Y ESTADOS
    const [busquedaProyecto, setBusquedaProyecto] = useState("");
    const [busquedaTrabajo, setBusquedaTrabajo] = useState("");
    const [modoGlobal, setModoGlobal] = useState(false); // false = nacional, true = internacional

    // MODALES - ESTADOS DE CONTROL
    const [modalProyectoDatos, setModalProyectoDatos] = useState(false);
    const [modalProyectoDetalles, setModalProyectoDetalles] = useState(false);

    //MODALES - ALERTAS
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmMessage, setConfirmMessage] = useState("");
    const [confirmAction, setConfirmAction] = useState<null | (() => void)>(null);

    const [errorOpen, setErrorOpen] = useState(false);
    const [errorTitle, setErrorTitle] = useState("");
    const [errorDesc, setErrorDesc] = useState("");

    const showError = (title: string, desc: string) => {
        setErrorTitle(title);
        setErrorDesc(desc);
        setErrorOpen(true);
    };


    // DATOS PARA EDICIÓN
    const [editProyectoData, setEditProyectoData] = useState<any>(null); // Datos completos del proyecto a editar
    const [proyectoDataTemp, setProyectoDataTemp] = useState<any>({});   // Datos temporales entre paso 1 y 2 de proyecto

    // MODALES - VISUALIZACIÓN
    const [verTrabajo, setVerTrabajo] = useState<any | null>(null);
    const [verProyecto, setVerProyecto] = useState<any | null>(null);

    // --- FETCH DE DATOS ---
    const fetchMemoria = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const res = await fetch(`/api/memoria/${id}`);
            const data = await res.json();

            if (data.success && data.data) {
                setMemoria(data.data);
                setTrabajos(data.data.trabajos || []);
                setProyectos(data.data.proyectos || []);
            } else {
                console.error("Error cargando memoria:", data.error);
            }
        } catch (error) {
            console.error("Error de red:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMemoria();
    }, [id]);

    // --- MANEJADORES DE TRABAJOS ---

    // Abrir modal para crear
    const handleOpenCreateTrabajo = () => {
        const memoriaId = Number(id);
        if (!Number.isFinite(memoriaId)) return;
        const modo = modoGlobal ? "internacional" : "nacional";
        const returnTo = encodeURIComponent(`/memorias/${memoriaId}?tab=trabajos`);
        router.push(
            `/trabajos/nuevo?memoriaId=${memoriaId}&lockMemoria=1&modo=${modo}&returnTo=${returnTo}`
        );
    };

    // Abrir modal para editar
    const handleEditTrabajo = (trabajo: any) => {
        setVerTrabajo(null); // Cerramos visualización si estaba abierta
        const memoriaId = Number(id);
        if (!trabajo?.id || !Number.isFinite(memoriaId)) return;
        const returnTo = encodeURIComponent(`/memorias/${memoriaId}?tab=trabajos`);
        router.push(
            `/trabajos/editar/${trabajo.id}?memoriaId=${memoriaId}&lockMemoria=1&returnTo=${returnTo}`
        );
    };

    // Eliminar trabajo

    const deleteTrabajo = async (trabajoId: number) => {
        try {
            const res = await fetch(`/api/trabajo/${trabajoId}`, { method: "DELETE" });
            const data = await res.json();
            if (!data.success) {
                showError("Error al eliminar", data.error || "No se pudo eliminar el trabajo");
                return;
            }
            fetchMemoria();
        } catch {
            showError("Error de conexión", "No se pudo contactar al servidor.");
        }
    };

    const handleDeleteTrabajo = (trabajoId: number) => {
        setConfirmMessage("¿Deseas eliminar este trabajo?");
        setConfirmAction(() => () => deleteTrabajo(trabajoId));
        setConfirmOpen(true);
    };

    // Callback al guardar (El modal hace el fetch, aquí solo refrescamos)
    

    // --- MANEJADORES DE PROYECTOS---

    // Abrir modal para crear proyecto
    const handleOpenCreateProyecto = () => {
        setEditProyectoData(null);
        setProyectoDataTemp({});
        setModalProyectoDatos(true);
    };

    // Abrir modal para editar proyecto
    const handleEditProyecto = (proyecto: any) => {
        setVerProyecto(null);
        setEditProyectoData(proyecto);
        // Pre-llenamos los datos temporales con lo que ya tiene el proyecto
        setProyectoDataTemp(proyecto);
        setModalProyectoDatos(true); 
    };

    // Eliminar proyecto
    
    const deleteProyecto = async (proyectoId: number) => {
        try {
            const res = await fetch(`/api/investigacion/${proyectoId}`, { method: "DELETE" });
            const data = await res.json();

            if (!data.success) {
                showError("Error al eliminar", data.error || "No se pudo eliminar el proyecto");
                return;
            }

            fetchMemoria();
        } catch {
            showError("Error de conexión", "No se pudo contactar al servidor.");
        }
    };

    const handleDeleteProyecto = (proyectoId: number) => {
        setConfirmMessage("¿Deseas eliminar este proyecto?");
        setConfirmAction(() => () => deleteProyecto(proyectoId));
        setConfirmOpen(true);
    };

    // Paso 1 -> Paso 2 (Guardar datos parciales y avanzar)
    const handleNextProyecto = (dataPaso1: any) => {
        // dataPaso1 trae { nombre, codigo, tipo, fecha_inicio, fecha_fin, descripcion } del ModalProyectoDatos
            setProyectoDataTemp({ 
            ...proyectoDataTemp, 
            ...dataPaso1,
            memoria_id: Number(id)
        });
        setModalProyectoDatos(false);
        setModalProyectoDetalles(true); // Abrir Paso 2
    };

    // Paso 2 -> Guardar Final (Hacer el POST o PUT)
    const handleFinalSaveProyecto = async (dataPaso2: any) => {
        try {
            const payload = {
                ...proyectoDataTemp,
                ...dataPaso2,
                memoria_id: Number(id),
            };

            const isEdit = !!editProyectoData?.id;
            const url = isEdit
                ? `/api/investigacion/${editProyectoData.id}`
                : "/api/investigacion";
            const method = isEdit ? "PUT" : "POST";

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!data.success) {
                showError("Error al guardar", data.error || "No se pudo guardar el proyecto");
                return;
            }

            // Mostrar alerta de éxito
            try {
                await Toast.fire({ icon: 'success', title: isEdit ? 'Proyecto actualizado con éxito' : 'Proyecto creado con éxito' });
            } catch (e) {
                // ignore
            }

            fetchMemoria();
            setModalProyectoDetalles(false);
            setEditProyectoData(null);
            setProyectoDataTemp({});
        } catch {
            showError("Error de conexión", "No se pudo contactar al servidor.");
        }
    };

    // --- FILTRADO ---
    const trabajosFiltrados = trabajos.filter((t) => {
        const esInternacional =
            t.reunion_tipo === 'INTERNACIONAL' ||
            (t.pais && t.pais.toLowerCase() !== 'argentina');
        const cumpleModo = modoGlobal ? esInternacional : !esInternacional;
        const q = busquedaTrabajo.toLowerCase();
        const cumpleBusqueda =
            t.titulo?.toLowerCase().includes(q) ||
            t.reunion?.toLowerCase().includes(q) ||
            t.expositor_nombre?.toLowerCase().includes(q);

        return cumpleModo && cumpleBusqueda;
    });

    const proyectosFiltrados = proyectos.filter((p) => {
        const q = busquedaProyecto.toLowerCase();
        return (
            p.nombre?.toLowerCase().includes(q) ||
            p.codigo?.toLowerCase().includes(q) ||
            p.tipo?.toLowerCase().includes(q)
        );
    });

    const formatDate = (dateString: string) => {
        if (!dateString) return "-";
        const d = new Date(dateString);
        return isNaN(d.getTime()) ? "-" : d.toLocaleDateString("es-AR");
    };

    if (loading && !memoria) {
        return <div className="min-h-screen flex items-center justify-center">Cargando memoria...</div>;
    }

    return (
        <div className="min-h-screen flex bg-[#f3f4f6] font-sans">
            <Sidebar />

            <main className="flex-1 px-4 py-6 md:px-12 md:py-8 bg-white overflow-y-auto h-screen w-full">

                {/* HEADER: Added mt-12 in mobile for hamburger fix */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4 mt-12 md:mt-0">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">
                            Memoria Anual {memoria?.anio}
                        </h1>
                        <p className="text-gray-500 mt-1 text-sm md:text-base">
                            {memoria?.contenido || "Sin descripción disponible."}
                        </p>
                    </div>

                    <div className="self-end md:self-auto">
                        <UserPill />
                    </div>
                </div>

                {/* TABS */}
                <div className="flex gap-4 md:gap-8 border-b border-gray-300 mb-8 overflow-x-auto">
                    <button
                        onClick={() => setTab("trabajos")}
                        className={`pb-3 text-sm font-semibold transition whitespace-nowrap ${tab === "trabajos"
                            ? "text-[#00c9a7] border-b-2 border-[#00c9a7]"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Trabajos presentados ({trabajos.length})
                    </button>

                    <button
                        onClick={() => setTab("proyectos")}
                        className={`pb-3 text-sm font-semibold transition whitespace-nowrap ${tab === "proyectos"
                            ? "text-[#00c9a7] border-b-2 border-[#00c9a7]"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        Proyectos vinculados ({proyectos.length})
                    </button>
                </div>

                {/* SECCIÓN TRABAJOS */}
                {tab === "trabajos" && (
                    <>
                        {/* FILTROS */}
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                            <div className="relative w-full md:w-80">
                                <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Buscar trabajo..."
                                    value={busquedaTrabajo}
                                    onChange={(e) => setBusquedaTrabajo(e.target.value)}
                                    className="w-full bg-[#f3f4f6] border border-[#e5e7eb] rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#00c9a7]"
                                />
                            </div>

                            <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-start">
                                {/* TOGGLE BANDERA FIXED: Added flex-shrink-0 to prevent squashing */}
                                <div
                                    className={`w-20 h-9 flex items-center rounded-full p-1 cursor-pointer transition-all flex-shrink-0 ${modoGlobal ? "bg-[#00c9a7]" : "bg-gray-300"}`}
                                    onClick={() => setModoGlobal(!modoGlobal)}
                                >
                                    <div
                                        className={`w-7 h-7 bg-white rounded-full shadow-md flex items-center justify-center overflow-hidden transition-all ${modoGlobal ? "translate-x-11" : "translate-x-0"}`}
                                    >
                                        {modoGlobal ? (
                                            <img src="/earth.png" alt="Internacional" className="w-full h-full object-cover rounded-full" />
                                        ) : (
                                            <img src="/arg.png" alt="Argentina" className="w-full h-full object-cover rounded-full" />
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={handleOpenCreateTrabajo}
                                    className="px-5 py-2 rounded-md text-sm font-medium text-white bg-[#00c9a7] hover:bg-[#00b197] whitespace-nowrap"
                                >
                                    + Añadir Trabajo
                                </button>
                            </div>
                        </div>

                        {/* TABLA TRABAJOS */}
                        <div className="border border-gray-300 rounded-lg overflow-hidden overflow-x-auto">
                            <div className="min-w-[900px]">
                                <div className="grid grid-cols-5 bg-[#e5e7eb] border-b border-gray-300 text-sm font-medium text-gray-700">
                                    <div className="px-4 py-3 border-r border-gray-300">Trabajo</div>
                                    <div className="px-4 py-3 border-r border-gray-300">
                                        {modoGlobal ? "País" : "Ciudad"}
                                    </div>
                                    <div className="px-4 py-3 border-r border-gray-300">Fecha</div>
                                    <div className="px-4 py-3 border-r border-gray-300">Reunión</div>
                                    <div className="px-4 py-3 text-center">Acciones</div>
                                </div>

                                {trabajosFiltrados.length > 0 ? (
                                    trabajosFiltrados.map((t, i) => (
                                        <div
                                            key={t.id || i}
                                            className={`grid grid-cols-5 ${i % 2 === 0 ? "bg-[#f9fafb]" : "bg-[#f3f4f6]"}`}
                                        >
                                            <div className="px-4 py-4 border-r border-gray-300 text-sm break-words">{t.titulo}</div>
                                            <div className="px-4 py-4 border-r border-gray-300 text-sm break-words">
                                                {modoGlobal ? t.pais : t.ciudad}
                                            </div>
                                            <div className="px-4 py-4 border-r border-gray-300 text-sm">
                                                {formatDate(t.fecha_presentacion)}
                                            </div>
                                            <div className="px-4 py-4 border-r border-gray-300 text-sm break-words">
                                                {t.reunion}
                                            </div>
                                            <div className="px-4 py-4 flex justify-center gap-5">
                                                <HiOutlineEye
                                                    className="w-5 h-5 text-[#00c9a7] cursor-pointer hover:scale-110"
                                                    onClick={() => setVerTrabajo(t)}
                                                    title="Ver detalle"
                                                />
                                                <HiOutlineTrash
                                                    className="w-5 h-5 text-red-500 cursor-pointer hover:scale-110"
                                                    onClick={() => handleDeleteTrabajo(t.id)}
                                                    title="Eliminar trabajo"
                                                />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-6 text-center text-gray-500">No se encontraron trabajos.</div>
                                )}
                            </div>
                        </div>
                    </>
                )}

                {/* SECCIÓN PROYECTOS */}
                {tab === "proyectos" && (
                    <>
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
                            <div className="relative w-full md:w-80">
                                <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <input
                                    type="text"
                                    placeholder="Buscar proyecto"
                                    value={busquedaProyecto}
                                    onChange={(e) => setBusquedaProyecto(e.target.value)}
                                    className="w-full bg-[#f3f4f6] border border-[#e5e7eb] rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#00c9a7]"
                                />
                            </div>
                            <button
                                onClick={handleOpenCreateProyecto}
                                className="w-full md:w-auto px-5 py-2 rounded-md text-sm font-medium text-white bg-[#00c9a7] hover:bg-[#00b197]"
                            >
                                + Añadir Proyecto
                            </button>
                        </div>

                        {/* TABLA PROYECTOS */}
                        <div className="border border-gray-300 rounded-lg overflow-hidden overflow-x-auto">
                            <div className="min-w-[700px]">
                                <div className="grid grid-cols-4 bg-[#e5e7eb] border-b border-gray-300 text-sm font-medium text-gray-700">
                                    <div className="px-4 py-3 border-r border-gray-300">Nombre del Proyecto</div>
                                    <div className="px-4 py-3 border-r border-gray-300">Código</div>
                                    <div className="px-4 py-3 border-r border-gray-300">Tipo de Proyecto</div>
                                    <div className="px-4 py-3 text-center">Acciones</div>
                                </div>
                                {proyectosFiltrados.length > 0 ? (
                                    proyectosFiltrados.map((p, i) => (
                                        <div
                                            key={p.id || i}
                                            className={`grid grid-cols-4 ${i % 2 === 0 ? "bg-[#f9fafb]" : "bg-[#f3f4f6]"}`}
                                        >
                                            <div className="px-4 py-4 border-r border-gray-300 text-sm break-words">{p.nombre}</div>
                                            <div className="px-4 py-4 border-r border-gray-300 text-sm break-words">{p.codigo}</div>
                                            <div className="px-4 py-4 border-r border-gray-300 text-sm break-words">{p.tipo}</div>
                                            <div className="px-4 py-4 flex justify-center gap-5">
                                                <HiOutlineEye
                                                    className="w-5 h-5 text-[#00c9a7] cursor-pointer hover:scale-110"
                                                    onClick={() => setVerProyecto(p)}
                                                    title="Ver detalle"
                                                />
                                                <HiOutlineTrash
                                                    className="w-5 h-5 text-red-500 cursor-pointer hover:scale-110"
                                                    onClick={() => handleDeleteProyecto(p.id)}
                                                    title="Eliminar proyecto"
                                                />
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-6 text-center text-gray-500">No se encontraron proyectos.</div>
                                )}
                            </div>
                        </div>
                    </>
                )}

            </main>

            {/* --- MODALES CREACIÓN / EDICIÓN --- */}
           

            {/* Paso 1 Proyecto: Datos Generales */}
            {modalProyectoDatos && (
                <ModalProyectoDatos
                    open={modalProyectoDatos}
                    initialData={editProyectoData || {}} // Si hay edición, precarga datos
                    onClose={() => setModalProyectoDatos(false)}
                    onNext={(dataPaso1: any) => handleNextProyecto(dataPaso1)}
                />
            )}

            {/* Paso 2 Proyecto: Detalles */}
            {modalProyectoDetalles && (
                <NewProyecto
                    open={modalProyectoDetalles}
                    initialData={{ ...editProyectoData, memoria_id: Number(id) }} // Precarga detalles si editas
                    onClose={() => setModalProyectoDetalles(false)}
                    onBack={() => {
                        setModalProyectoDetalles(false);
                        setModalProyectoDatos(true);
                    }}
                    onSave={handleFinalSaveProyecto}
                    lockMemoria={true} 
                />
            )}

            {/* --- MODALES VISUALIZACIÓN --- */}

            {verTrabajo && (
                <ModalVerTrabajo
                    open={!!verTrabajo}
                    trabajo={verTrabajo}
                    onClose={() => setVerTrabajo(null)}
                    onEdit={(t) => handleEditTrabajo(t)}
                />
            )}

            {verProyecto && (
                <ModalVerProyecto
                    open={!!verProyecto}
                    proyecto={verProyecto}
                    onClose={() => setVerProyecto(null)}
                    onEdit={(p: any) => handleEditProyecto(p)}
                />
            )}
            <ConfirmModal
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                onConfirm={() => {
                    if (confirmAction) confirmAction();
                    setConfirmOpen(false);
                }}
                message={confirmMessage}
            />
            <ErrorModal
                open={errorOpen}
                onClose={() => setErrorOpen(false)}
                title={errorTitle}
                description={errorDesc}
            />

        </div>
    );
}

export default withAuth(MemoriaDetallePage);
