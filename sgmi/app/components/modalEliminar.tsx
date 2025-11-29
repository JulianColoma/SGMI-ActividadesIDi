"use client";

export default function ModalEliminar({ open, onClose, onConfirm, texto }: any) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[400px] rounded-2xl p-6 shadow-xl relative">

        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Confirmar eliminación
        </h2>

        <p className="text-gray-600 mb-6">{texto}</p>

        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 rounded-md border"
            onClick={onClose}
          >
            Cancelar
          </button>

          <button
            className="px-4 py-2 rounded-md bg-red-500 text-white hover:bg-red-600"
            onClick={onConfirm}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}