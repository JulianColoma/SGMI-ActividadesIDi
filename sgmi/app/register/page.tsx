
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Hint from "../components/alerts/Hint";

export default function RegisterPage() {
  const router = useRouter();

  const [nombreCompleto, setNombreCompleto] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string,string>>({});
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setFieldErrors({});

    const errs: Record<string,string> = {};
    if (!nombreCompleto || !nombreCompleto.trim()) errs.nombreCompleto = 'El nombre es obligatorio';
    if (!email || !email.trim()) errs.email = 'El email es obligatorio';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errs.email = 'Email inválido';
    if (!password || password.length < 6) errs.password = 'La contraseña debe tener al menos 6 caracteres';
    if (password !== password2) errs.password2 = 'Las contraseñas no coinciden';
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }

    setLoading(true);

    try {
      const res = await fetch("/api/usuario/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nombre: nombreCompleto,
          email,
          password,
          role: "admin",
        }
      ),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "No se pudo registrar el usuario");
      } else {
        setSuccess("Usuario registrado correctamente");
        // Opcional: redirigir al login después de unos segundos
        router.push("/login");
      }
    } catch (err) {
      console.error(err);
      setError("Error de conexión con el servidor");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* BARRA SUPERIOR CON BOTÓN INICIAR SESIÓN */}
      <header className="w-full bg-[#e5e7eb] h-20 flex items-center justify-end px-10">
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="px-6 py-2 rounded-sm bg-[#243343] text-white text-sm font-medium hover:bg-[#1b2633]"
        >
          Iniciar sesión
        </button>
      </header>

      {/* CONTENIDO CENTRAL */}
      <main className="flex-1 flex flex-col items-center mt-10 px-4">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md bg-white shadow-[0_0_25px_rgba(15,23,42,0.08)] rounded-2xl px-10 py-8 space-y-5 border border-[#f3f4f6]"
        >
          <div>
            <label className="block text-sm font-medium mb-1">
              Nombre Completo
            </label>
            <input
              type="text"
              placeholder="ej: Juan Carlos García"
              className={`w-full rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-1 ${
                fieldErrors.nombreCompleto
                  ? 'border-2 border-red-500 focus:ring-red-500'
                  : 'border border-gray-300 focus:ring-gray-400'
              }`}
              value={nombreCompleto}
              onChange={(e) => setNombreCompleto(e.target.value)}
              onBlur={() => {
                const errs = { ...fieldErrors };
                if (!nombreCompleto || !nombreCompleto.trim()) errs.nombreCompleto = 'El nombre es obligatorio';
                else delete errs.nombreCompleto;
                setFieldErrors(errs);
              }}
              required
            />
            {fieldErrors.nombreCompleto && <Hint show={true} message={fieldErrors.nombreCompleto} type="error" />}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              placeholder="ejemplo@email.com"
              className={`w-full rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-1 ${
                fieldErrors.email
                  ? 'border-2 border-red-500 focus:ring-red-500'
                  : 'border border-gray-300 focus:ring-gray-400'
              }`}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => {
                const errs = { ...fieldErrors };
                if (!email || !email.trim()) errs.email = 'El email es obligatorio';
                else if (!/^[^\@\s]+@[^\@\s]+\.[^\@\s]+$/.test(email)) errs.email = 'Email inválido';
                else delete errs.email;
                setFieldErrors(errs);
              }}
              required
            />
            {fieldErrors.email && <Hint show={true} message={fieldErrors.email} type="error" />}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Contraseña
            </label>
            <input
              type="password"
              placeholder="ejemplo1234"
              className={`w-full rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-1 ${
                fieldErrors.password
                  ? 'border-2 border-red-500 focus:ring-red-500'
                  : 'border border-gray-300 focus:ring-gray-400'
              }`}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => {
                const errs = { ...fieldErrors };
                if (!password || password.length < 6) errs.password = 'La contraseña debe tener al menos 6 caracteres';
                else delete errs.password;
                setFieldErrors(errs);
              }}
              required
            />
            {fieldErrors.password && <Hint show={true} message={fieldErrors.password} type="error" />}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Confirmar contraseña
            </label>
            <input
              type="password"
              className={`w-full rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-1 ${
                fieldErrors.password2
                  ? 'border-2 border-red-500 focus:ring-red-500'
                  : 'border border-gray-300 focus:ring-gray-400'
              }`}
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              onBlur={() => {
                const errs = { ...fieldErrors };
                if (password !== password2) errs.password2 = 'Las contraseñas no coinciden';
                else delete errs.password2;
                setFieldErrors(errs);
              }}
              required
            />
            {fieldErrors.password2 && <Hint show={true} message={fieldErrors.password2} type="error" />}
          </div>

          {error && (
            <p className="text-red-600 text-sm text-center">{error}</p>
          )}

          {success && (
            <p className="text-emerald-600 text-sm text-center">{success}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-[#1f2933] text-white py-3 rounded-md text-sm font-medium hover:bg-[#151e27] disabled:opacity-60"
          >
            {loading ? "Registrando..." : "Registrarse"}
          </button>

          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="text-xs underline text-gray-700 hover:text-gray-900"
            >
              ¿Ya estás registrado?
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
