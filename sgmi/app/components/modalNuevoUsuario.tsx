"use client";

import { useState } from "react";
import Hint from "./alerts/Hint";


interface ModalNuevoUsuarioProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void; 
}

export default function ModalNuevoUsuario({ open, onClose, onSave }: ModalNuevoUsuarioProps) {

  if (!open) return null;

 
  const [form, setForm] = useState({ 
    nombre: "", 
    email: "", 
    password: "", 
    role: "user" 
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string,string>>({});

  const validateAndSave = () => {
    const errs: Record<string,string> = {};
    if (!form.nombre || !form.nombre.trim()) errs.nombre = 'El nombre es obligatorio';
    if (!form.email || !form.email.trim()) errs.email = 'El email es obligatorio';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) errs.email = 'Email inválido';
    if (!form.password || form.password.length < 6) errs.password = 'La contraseña debe tener al menos 6 caracteres';

    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }

    setFieldErrors({});
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[600px] rounded-2xl p-6 shadow-xl relative">

        <button
          className="absolute top-3 right-3 text-2xl"
          onClick={onClose}
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold bg-[#00c9a7] text-white inline-block px-4 py-2 rounded-md mb-6">
          Nuevo Usuario
        </h2>

        <div className="space-y-4 text-sm">

          <div>
            <label className="font-medium">Nombre</label>
            <input
              type="text"
              className={`w-full rounded-md px-3 py-2 mt-1 ${
                fieldErrors.nombre
                  ? 'border-2 border-red-500 focus:outline-none focus:ring-red-500'
                  : 'border border-gray-300'
              }`}
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              onBlur={() => {
                const errs = { ...fieldErrors };
                if (!form.nombre || !form.nombre.trim()) errs.nombre = 'El nombre es obligatorio';
                else delete errs.nombre;
                setFieldErrors(errs);
              }}
            />
            {fieldErrors.nombre && <Hint show={true} message={fieldErrors.nombre} type="error" />}
          </div>

          <div>
            <label className="font-medium">Email</label>
            <input
              type="email"
              className={`w-full rounded-md px-3 py-2 mt-1 ${
                fieldErrors.email
                  ? 'border-2 border-red-500 focus:outline-none focus:ring-red-500'
                  : 'border border-gray-300'
              }`}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              onBlur={() => {
                const errs = { ...fieldErrors };
                if (!form.email || !form.email.trim()) errs.email = 'El email es obligatorio';
                else if (!/^[^\@\s]+@[^\@\s]+\.[^\@\s]+$/.test(form.email)) errs.email = 'Email inválido';
                else delete errs.email;
                setFieldErrors(errs);
              }}
            />
            {fieldErrors.email && <Hint show={true} message={fieldErrors.email} type="error" />}
          </div>

          
          <div>
            <label className="font-medium">Contraseña</label>
            <input
              type="password"
              className={`w-full rounded-md px-3 py-2 mt-1 ${
                fieldErrors.password
                  ? 'border-2 border-red-500 focus:outline-none focus:ring-red-500'
                  : 'border border-gray-300'
              }`}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              onBlur={() => {
                const errs = { ...fieldErrors };
                if (!form.password || form.password.length < 6) errs.password = 'La contraseña debe tener al menos 6 caracteres';
                else delete errs.password;
                setFieldErrors(errs);
              }}
            />
            {fieldErrors.password && <Hint show={true} message={fieldErrors.password} type="error" />}
          </div>

          <div>
            <label className="font-medium">Rol</label>
            <select
              className="w-full border rounded-md px-3 py-2 mt-1"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="admin">Administrador</option>
              <option value="user">Usuario</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={validateAndSave}
            className="px-6 py-2 bg-[#00c9a7] text-white rounded-md hover:bg-[#00b197]"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}