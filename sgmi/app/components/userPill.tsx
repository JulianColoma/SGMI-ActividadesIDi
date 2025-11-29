"use client";
import { HiOutlineUserCircle, HiOutlineLogout } from "react-icons/hi";
import { useAuth } from "../AuthContext";

export default function UserPill() {
  const { user, logout } = useAuth();

  return (
    <div className="flex items-center gap-2 text-gray-700 whitespace-nowrap">
      <span className="text-sm">{user?.nombre || "Cargando..."}</span>
      <HiOutlineUserCircle className="w-7 h-7 mt-[1px]" />
      <button
        onClick={logout}
        title="Cerrar sesión"
        className="flex items-center justify-center ml-2 text-gray-700 hover:text-red-600 hover:bg-red-100 rounded-full p-1 transition-colors focus:outline-none"
      >
        <HiOutlineLogout className="w-7 h-7 mt-[1px]" />
      </button>
    </div>
  );
}
