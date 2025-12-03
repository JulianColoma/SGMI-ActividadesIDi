'use client';

import Sidebar from "./components/sidebar";
import { HiOutlineUserCircle } from "react-icons/hi";
import Image from "next/image";
import { withAuth } from "./withAuth";
import UserPill from "./components/userPill";

function HomePage() {
  return (
    <div className="min-h-screen flex bg-white font-sans">

      <Sidebar />

      <main className="flex-1 px-4 py-8 md:px-20 md:py-10">

        <div className="flex justify-end items-center mb-8 mt-12 md:mt-0">
          <UserPill/>
        </div>

        <h1 className="text-2xl md:text-4xl font-bold text-center text-gray-800 leading-tight mb-2">
          Actividades I+D+i y Trabajos SGMI
        </h1>

        <p className="text-center text-gray-500 text-sm md:text-lg mb-10">
          Sistema de Gestión de Actividades Científicas y Académicas
        </p>

        <div className="flex justify-center mb-10">
          <Image
            src="/images/logo.svg"
            alt="SGMI"
            width={180}
            height={180}
            className="w-32 h-32 md:w-[180px] md:h-[180px]"
          />
        </div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 gap-6 md:gap-10">

          <div className="bg-[#F5F6F7] p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-3">
              Investigaciones (I+D+i)
            </h2>
            <p className="text-gray-700 leading-relaxed text-sm md:text-base">
              Esta sección agrupa todos los proyectos de I+D+i en curso en los que 
              participa o lidera el grupo. El sistema permite gestionar los proyectos 
              (Alta, Baja, Modificación y Consulta). Cada proyecto debe registrar 
              su información principal junto con el avance de sus actividades.
            </p>
          </div>

          <div className="bg-[#F5F6F7] p-6 rounded-xl shadow-sm border border-gray-200">
            <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-3">
              Trabajos Presentados en Congresos y Reuniones Científicas
            </h2>
            <p className="text-gray-700 leading-relaxed text-sm md:text-base">
              Registro de exposiciones realizadas por integrantes del grupo 
              en congresos nacionales e internacionales con evaluación por pares. 
              El sistema permite gestionar los trabajos presentados 
              y listar los datos correspondientes a Reuniones Científicas Nacionales 
              e Internacionales.
            </p>
          </div>

        </div>

      </main>
    </div>
  );
}

export default withAuth(HomePage);