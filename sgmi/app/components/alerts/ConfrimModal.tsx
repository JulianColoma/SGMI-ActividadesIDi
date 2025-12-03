"use client";

import { HiOutlineX } from "react-icons/hi";
import { HiExclamationTriangle } from "react-icons/hi2";

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  message,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-[360px] rounded-xl p-5 shadow-[0_4px_18px_rgba(0,0,0,0.12)] relative">

        {/* Close button minimal */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-black transition"
        >
          <HiOutlineX size={20} />
        </button>

        {/* Icon + message */}
        <div className="flex flex-col items-center text-center mt-2">
          <HiExclamationTriangle className="text-yellow-500 flex-shrink-0" size={40} />

          <p className="text-[15px] font-medium text-gray-800 mt-3 leading-snug break-words">
            {message}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-4 mt-5">
          <button
            onClick={onClose}
            className="flex-1 px-5 py-2 rounded-md bg-gray-100 text-gray-800 text-sm font-semibold hover:bg-gray-200 transition"
          >
            No
          </button>

          <button
            onClick={onConfirm}
            className="flex-1 px-5 py-2 rounded-md bg-gray-100 text-gray-800 text-sm font-semibold hover:bg-gray-200 transition"
          >
            Sí
          </button>
        </div>

      </div>
    </div>
  );
}