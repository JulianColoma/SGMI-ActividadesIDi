"use client";

import { HiOutlineEye, HiOutlineTrash } from "react-icons/hi";

export default function DataTable({
  headers,
  rows,
  actionView,
  actionDelete,
}: {
  headers: string[];
  rows: any[];
  actionView?: (item: any) => void;
  actionDelete?: (item: any) => void;
}) {
  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden">

      {/* ENCABEZADOS */}
      <div
        className={`grid bg-[#e5e7eb] border-b border-gray-300 text-sm font-medium text-gray-700`}
        style={{
          gridTemplateColumns: `repeat(${headers.length}, 1fr) 50px`,
        }}
      >
        {headers.map((h, i) => (
          <div
            key={i}
            className={`px-4 py-3 ${
              i < headers.length - 1 ? "border-r border-gray-300" : ""
            }`}
          >
            {h}
          </div>
        ))}
      </div>

      {/* FILAS */}
      {rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className={`grid ${
            rowIndex % 2 === 0 ? "bg-[#f9fafb]" : "bg-[#f3f4f6]"
          }`}
          style={{
            gridTemplateColumns: `repeat(${headers.length}, 1fr) 50px`,
          }}
        >
          {Object.values(row).map((value: any, i) => (
            <div
              key={i}
              className={`px-4 py-4 ${
                i < headers.length - 1 ? "border-r border-gray-300" : ""
              }`}
            >
              {value}
            </div>
          ))}

          {/* ÍCONOS */}
          <div className="flex items-center justify-center gap-4 px-4 py-4">
            {actionView && (
              <HiOutlineEye
                onClick={() => actionView(row)}
                className="w-6 h-6 text-[#00c9a7] cursor-pointer hover:text-[#009c88]"
              />
            )}

            {actionDelete && (
              <HiOutlineTrash
                onClick={() => actionDelete(row)}
                className="w-6 h-6 text-red-500 cursor-pointer hover:text-red-700"
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
