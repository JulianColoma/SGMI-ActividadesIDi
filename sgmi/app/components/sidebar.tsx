"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../AuthContext";
// Importamos la hamburguesa y la cruz para cerrar
import { RxHamburgerMenu, RxCross2 } from "react-icons/rx"; 

export default function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const baseItems = [
    { label: "Página Principal", href: "/" },
    { label: "Proyectos de I+D+i", href: "/proyectos" },
    { label: "Trabajos Presentados", href: "/trabajos" },
    { label: "Gestión de memorias", href: "/memorias" },
  ];

  const menuItems = [
    ...baseItems,
    ...(user?.role === "admin" ? [{ label: "Usuarios", href: "/usuarios" }] : []),
  ];

  return (
    <>
      {/* Botón Toggle (Visible solo en mobile) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-[#27333d] text-white hover:bg-[#2f3d49] focus:outline-none transition-colors"
        aria-label="Toggle menu"
      >
        {isOpen ? (
          <RxCross2 size={24} /> // Icono de cerrar
        ) : (
          <RxHamburgerMenu size={24} /> // Tu icono de hamburguesa
        )}
      </button>

      {/* Overlay para cerrar haciendo click afuera */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)} 
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-[#27333d] text-white 
          transform transition-transform duration-300 ease-in-out
          flex flex-col justify-between py-6 px-4 min-h-screen
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0 md:static md:block
        `}
      >
        <nav className="space-y-1 tracking-wide mt-12 md:mt-0">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <div key={item.href} className="relative">
                {isActive && (
                  <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#00c9a7] rounded-r"></span>
                )}

                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`block py-3 px-4 rounded text-sm transition ${
                    isActive
                      ? "bg-[#00c9a7]/20 text-[#00c9a7] font-semibold"
                      : "hover:bg-[#2f3d49]"
                  }`}
                >
                  {item.label}
                </Link>
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}