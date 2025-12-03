"use client";

import { HiOutlineX } from "react-icons/hi";
import { HiXCircle } from "react-icons/hi2";

export default function ErrorModal({
  open,
  onClose,
  title,
  description,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
}) {
  if (!open) return null;

  return (
    
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-[480px] rounded-2xl p-6 relative shadow-lg border border-gray-200">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-white border border-gray-400 rounded-full p-1 text-lg hover:bg-gray-100 transition-colors"
        >
          <HiOutlineX />
        </button>

        <div className="flex flex-col items-center text-center mt-2 mb-4">
          <HiXCircle className="text-red-500 flex-shrink-0" size={52} />

          <h2 className="text-xl font-bold text-gray-900 mt-3 break-words w-full">
            {title}
          </h2>

          <p className="text-sm font-medium text-gray-700 mt-2 px-2 md:px-4 break-words">
            {description}
          </p>
        </div>

      </div>
    </div>
  );
}