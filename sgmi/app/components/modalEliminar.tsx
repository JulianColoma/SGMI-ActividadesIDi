"use client";

export default function ModalEliminar({
  open,
  onClose,
  onConfirm,
  texto,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  texto?: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[480px] rounded-2xl shadow-xl relative p-6">
        <button onClick={onClose} className="absolute top-4 right-4 text-xl">✕</button>
        <h3 className="text-lg font-semibold mb-4">Confirmar eliminación</h3>
        <p className="text-sm text-gray-700">{texto || '¿Estás seguro que querés eliminar este elemento?'}</p>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-200">Cancelar</button>
          <button
            onClick={async () => { await onConfirm(); }}
            className="px-4 py-2 rounded-md bg-red-500 text-white"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
