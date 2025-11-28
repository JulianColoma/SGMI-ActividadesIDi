"use client";

export default function NewProyecto({
  open,
  onClose,
  onBack,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  onBack: () => void;
  onSave: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      
      <div className="bg-[#D9D9D9] w-[900px] rounded-2xl shadow-xl relative p-6">


        <button
          className="absolute top-5 right-5 text-3xl text-gray-700 hover:text-black"
          onClick={onClose}
        >
          ✕
        </button>

        <h2 className="text-lg font-semibold bg-[#00c9a7] text-white inline-block px-4 py-2 rounded-md mb-6">
          Proyecto de I+D+i
        </h2>

        <div className="flex flex-col gap-5 text-sm">

            <div>
            <label className="font-semibold text-black">Financiamiento</label>
            <div className="relative mt-1">
                <input
                type="text"
                placeholder="Banco Galicia..."
                className="input-base"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xl text-gray-600">
                +
                </span>
            </div>
            </div>

            <div>
            <label className="font-semibold text-black">Logros</label>
            <div className="relative mt-1">
                <input
                type="text"
                placeholder="Objetivo cumplido 1..."
                className="input-base"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xl text-gray-600">
                +
                </span>
            </div>
            </div>

            <div>
            <label className="font-semibold text-black">Dificultades</label>
            <textarea
                placeholder="Dificultad 1..."
                className="textarea-base h-36"
            ></textarea>
            </div>


        </div>

       
        <div className="flex justify-end mt-8 gap-6">

            <button
                    onClick={onBack}
                    className="px-10 py-3 bg-[#00c9a7] text-white rounded-md font-medium text-lg hover:bg-[#00b197]">
            Anterior
            </button>

            <button
                    onClick={onSave}
                    className="px-10 py-3 bg-[#00c9a7] text-white rounded-md font-medium text-lg hover:bg-[#00b197]">
            Guardar Proyecto
            </button>

        </div>
      </div>
    </div>
  );
}
