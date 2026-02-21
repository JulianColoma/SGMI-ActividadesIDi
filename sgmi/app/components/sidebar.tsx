"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "../AuthContext";
import { RxHamburgerMenu, RxCross2 } from "react-icons/rx";

export default function Sidebar({ locked = false }: { locked?: boolean }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const baseItems = [
    { label: "Pagina Principal", href: "/" },
    { label: "Proyectos de I+D+i", href: "/proyectos" },
    { label: "Trabajos Presentados", href: "/trabajos" },
    { label: "Gestion de memorias", href: "/memorias" },
  ];

  const menuItems = [
    ...baseItems,
    ...(user?.role === "admin" ? [{ label: "Usuarios", href: "/usuarios" }] : []),
  ];

  return (
    <>
      <button
        onClick={() => {
          if (locked) return;
          setIsOpen(!isOpen);
        }}
        disabled={locked}
        className={`md:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-[#1f2a33] text-white focus:outline-none transition-colors ${
          locked ? "opacity-60 cursor-not-allowed" : "hover:bg-[#2f3d49]"
        }`}
        aria-label="Toggle menu"
      >
        {isOpen ? <RxCross2 size={24} /> : <RxHamburgerMenu size={24} />}
      </button>

      {isOpen && !locked && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-[#1f2a33] text-white
          transform transition-transform duration-300 ease-in-out
          flex flex-col py-6 px-4 min-h-screen
          ${locked ? "bg-[#1f2a33]/95" : ""}
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 md:static md:block
        `}
      >
        <div className={`mt-12 md:mt-0 mb-5 ${locked ? "blur-[0.5px]" : ""}`}>
          <p className="text-xs uppercase tracking-[0.16em] text-slate-300/90 px-2">
            Navegacion
          </p>
        </div>

        <nav
          className={`space-y-2 tracking-wide font-['Nunito',_'Trebuchet_MS',_sans-serif] ${
            locked ? "blur-[0.5px]" : ""
          }`}
        >
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <div key={item.href} className="relative">
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-[#00c9a7] rounded-r" />
                )}

                <Link
                  href={item.href}
                  onClick={(e) => {
                    if (locked) {
                      e.preventDefault();
                      return;
                    }
                    setIsOpen(false);
                  }}
                  className={`block py-3 px-4 rounded-xl text-sm transition ${
                    isActive
                      ? "bg-[#00c9a7]/20 text-[#00d5b1] font-semibold"
                      : locked
                      ? "cursor-not-allowed opacity-75"
                      : "hover:bg-[#2b3844]"
                  }`}
                >
                  {item.label}
                </Link>
              </div>
            );
          })}
        </nav>

        {locked && (
          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-3 text-xs text-slate-300">
            Navegacion bloqueada mientras completas el formulario.
          </div>
        )}
      </aside>
    </>
  );
}
