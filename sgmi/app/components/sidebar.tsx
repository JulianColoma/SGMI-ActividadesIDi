"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const menuItems = [
    { label: "Página Principal", href: "/" },
    { label: "Proyectos de I+D+i", href: "/proyectos" },
    { label: "Trabajos Presentados", href: "/trabajos" },
    { label: "Gestión de memorias", href: "/memorias" },
  ];

  return (
    <aside className="w-64 bg-[#27333d] text-white flex flex-col justify-between py-6 px-4 min-h-screen">
      
      <nav className="space-y-1 tracking-wide">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;

          return (
            <div key={item.href} className="relative">
              {isActive && (
                <span className="absolute left-0 top-0 bottom-0 w-1 bg-[#00c9a7] rounded-r"></span>
              )}

              <Link
                href={item.href}
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

      <button
        onClick={() => console.log("Cerrar sesión")}
        className="mt-10 w-full py-2 text-sm bg-[#e5e7eb] text-[#27333d] rounded hover:bg-[#d1d5db]"
      >
        Cerrar sesión
      </button>
    </aside>
  );
}
