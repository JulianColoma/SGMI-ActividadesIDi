"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAuth } from "../AuthContext"; // Importar useAuth

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth(); // Obtener la función login del contexto

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/usuario/register", {
        method: "POST",
        credentials: 'include',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre: "tomi",email, password, role: "admin" }), // Aseguramos que el rol sea 'user' al registrarse
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Credenciales incorrectas");
        setLoading(false);
        return;
      }

      // Pasamos los datos del usuario al contexto para actualizar inmediatamente el estado
      login(data.data);
      router.push("/"); 
    } catch (err) {
      console.error(err);
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* BARRA SUPERIOR + BOTÓN REGISTRARSE (como en Figma) */}
      {/* Responsive: h-16 en mobile, h-20 en desktop. Padding reducido en mobile. */}
      <header className="w-full bg-[#e5e7eb] h-16 md:h-20 flex items-center justify-end px-4 md:px-10">
        {/*<button
          type="button"
          onClick={() => router.push("/register")} // cambia la ruta si usás otra
          className="px-6 py-2 rounded-sm bg-[#243343] text-white text-sm font-medium hover:bg-[#1b2633]"
        >
          Registrarse
        </button>*/}
      </header>

      {/* CONTENIDO CENTRAL */}
      <main className="flex-1 flex flex-col items-center mt-6 md:mt-10 px-4">
        {/* LOGO CENTRADO */}
        {/* Responsive: menos margen inferior en mobile */}
        <div className="mb-6 md:mb-10">
          <Image
            src="/images/logo.svg" 
            alt="Logo SGMI"
            width={140}
            height={140}
          />
        </div>

        {/* CARD DEL FORMULARIO (como la primera captura) */}
        {/* Responsive: padding interno reducido (px-6) en mobile para dar aire a los inputs */}
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-white shadow-[0_0_25px_rgba(15,23,42,0.08)] rounded-2xl px-6 py-6 md:px-10 md:py-8 space-y-5 border border-[#f3f4f6]"
        >
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Email</label>
            <input
              type="email"
              placeholder="ejemplo@email.com"
              className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Contraseña
            </label>
            <input
              type="password"
              placeholder="ejemplo1234"
              className="w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/*<div className="text-left">
            <button
              type="button"
              className="text-xs underline text-gray-700 hover:text-gray-900"
              // acá después podés hacer router.push("/forgot-password")
              onClick={() => console.log("Recuperar contraseña")}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>*/}

          {error && (
            <p className="text-red-600 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#1f2933] text-white py-3 rounded-md text-sm font-medium hover:bg-[#151e27] disabled:opacity-60"
          >
            {loading ? "Registrando..." : "Registrarse"}
          </button>
        </form>
      </main>
    </div>
  );
}