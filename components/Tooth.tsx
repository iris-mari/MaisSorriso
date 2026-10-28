"use client";

import { ToothCategory, ToothType } from "@/lib/teeth";

interface ToothProps {
  number: number;
  name: string;
  category: ToothCategory;
  type: ToothType;
  x: number; // percentage left
  y: number; // percentage top
  rotation: number; // angle in degrees
  isSelected?: boolean;
  hasRecord?: boolean;
  onClick: (number: number, name: string) => void;
}

const TOOTH_PATHS: Record<ToothType, string> = {
  incisivo: "M 5,4 L 19,4 C 20,4 20.5,5 20,7 L 17,26 C 16.5,28 14,29 12,29 C 10,29 7.5,28 7,26 L 4,7 C 3.5,5 4,4 5,4 Z",
  canino: "M 12,2 L 19,6 C 20,7 20,8 19,10 L 17,26 C 16.5,28 14,29 12,29 C 10,29 7.5,28 7,26 L 5,10 C 4,8 4,7 5,6 Z",
  premolar: "M 6,5 C 8,3 10,4 12,5 C 14,4 16,3 18,5 C 20.5,7 21,9 20,12 L 18.5,26 C 18,28.5 15.5,29 12,29 C 8.5,29 6,28.5 5.5,26 L 4,12 C 3,9 3.5,7 6,5 Z",
  molar: "M 4,6 C 6,4 9,5 12,6 C 15,5 18,4 20,6 C 22.5,8 23,10 22,13 L 20,26 C 19.5,28.5 16.5,29 12,29 C 7.5,29 4.5,28.5 4,26 L 2,13 C 1,10 1.5,8 4,6 Z",
};

export default function Tooth({
  number,
  name,
  category,
  type,
  x,
  y,
  rotation,
  isSelected,
  hasRecord,
  onClick,
}: ToothProps) {
  const isChild = category === "infantil";
  
  // Decide if number label is placed at the top or bottom of the tooth
  // Upper teeth (18-28, 55-65) are at the top half -> label at top.
  // Lower teeth (48-38, 85-75) are at the bottom half -> label at bottom.
  const isUpper = number < 30 || (number >= 50 && number < 70);

  // SVG dimensions
  const width = 24;
  const height = 32;

  // Paths
  const toothPath = TOOTH_PATHS[type];

  // Gradients IDs
  const gradId = `tooth-grad-${number}-${isSelected ? "sel" : hasRecord ? "rec" : "norm"}`;

  return (
    <button
      onClick={() => onClick(number, name)}
      type="button"
      className={`
        absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center transition-all duration-300 group focus:outline-none z-10
        ${isChild ? "w-8 h-12 sm:w-9 sm:h-13 md:w-10 md:h-15" : "w-10 h-14 sm:w-11 sm:h-15 md:w-12 md:h-18"}
        ${isSelected ? "scale-110 z-30" : "hover:scale-105 hover:z-20"}
      `}
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      {/* Tooltip */}
      <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-50 pointer-events-none shadow-lg">
        <div className="bg-slate-900 text-white text-[9px] sm:text-[10px] font-black tracking-wider py-1.5 px-3 rounded-xl whitespace-nowrap uppercase border border-slate-800">
          Dente {number}: {name}
        </div>
        <div className="w-2 h-2 bg-slate-900 rotate-45 -mt-1"></div>
      </div>

      {/* Record indicator badge (top-right of button) */}
      {hasRecord && (
        <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border border-white shadow-sm animate-pulse z-20" />
      )}

      {/* Number at the top (for upper teeth) */}
      {isUpper && (
        <span
          className={`
            text-[8px] sm:text-[9px] font-black tracking-tighter mb-0.5 transition-colors duration-300 select-none
            ${isSelected ? "text-blue-600 font-extrabold" : hasRecord ? "text-red-500 font-extrabold" : "text-slate-400 group-hover:text-slate-600"}
          `}
        >
          {number}
        </span>
      )}

      {/* Tooth shape container (rotated) */}
      <div
        className="w-full flex-1 flex items-center justify-center transition-transform duration-300"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className={`
            w-full h-full filter drop-shadow-[0_1px_1px_rgba(0,0,0,0.05)] transition-all duration-300
            ${isSelected ? "drop-shadow-[0_0_6px_rgba(59,130,246,0.4)]" : hasRecord ? "drop-shadow-[0_0_6px_rgba(239,68,68,0.4)]" : "group-hover:drop-shadow-[0_2px_4px_rgba(0,0,0,0.1)]"}
          `}
        >
          <defs>
            {isSelected ? (
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60a5fa" />
                <stop offset="100%" stopColor="#2563eb" />
              </linearGradient>
            ) : hasRecord ? (
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fca5a5" />
                <stop offset="100%" stopColor="#dc2626" />
              </linearGradient>
            ) : (
              <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="100%" stopColor="#f1f5f9" />
              </linearGradient>
            )}
          </defs>

          {/* Tooth Crown Path */}
          <path
            d={toothPath}
            fill={`url(#${gradId})`}
            stroke={isSelected ? "#1d4ed8" : hasRecord ? "#991b1b" : "#cbd5e1"}
            strokeWidth={isSelected || hasRecord ? 1.5 : 1}
            className="transition-all duration-300"
          />

          {/* Shine effect (only for default states) */}
          {!isSelected && !hasRecord && (
            <path
              d="M 6,8 C 6,8 8,5 11,5"
              fill="none"
              stroke="#ffffff"
              strokeWidth="1.25"
              strokeLinecap="round"
              className="opacity-60"
            />
          )}

          {/* Anatomical Grooves / Fissures */}
          {type === "molar" && (
            <path
              d="M 12,12 L 12,22 M 8,17 L 16,17"
              fill="none"
              stroke={isSelected ? "#93c5fd" : hasRecord ? "#fca5a5" : "#94a3b8"}
              strokeWidth="0.75"
              strokeLinecap="round"
              className="opacity-60"
            />
          )}
          {type === "premolar" && (
            <path
              d="M 12,10 L 12,20"
              fill="none"
              stroke={isSelected ? "#93c5fd" : hasRecord ? "#fca5a5" : "#94a3b8"}
              strokeWidth="0.75"
              strokeLinecap="round"
              className="opacity-50"
            />
          )}
          {type === "canino" && (
            <path
              d="M 12,12 L 12,22"
              fill="none"
              stroke={isSelected ? "#93c5fd" : hasRecord ? "#fca5a5" : "#cbd5e1"}
              strokeWidth="0.5"
              strokeLinecap="round"
              className="opacity-40"
            />
          )}
          {type === "incisivo" && (
            <path
              d="M 10,12 L 10,22 M 14,12 L 14,22"
              fill="none"
              stroke={isSelected ? "#93c5fd" : hasRecord ? "#fca5a5" : "#cbd5e1"}
              strokeWidth="0.5"
              strokeLinecap="round"
              className="opacity-30"
            />
          )}
        </svg>
      </div>

      {/* Number at the bottom (for lower teeth) */}
      {!isUpper && (
        <span
          className={`
            text-[8px] sm:text-[9px] font-black tracking-tighter mt-0.5 transition-colors duration-300 select-none
            ${isSelected ? "text-blue-600 font-extrabold" : hasRecord ? "text-red-500 font-extrabold" : "text-slate-400 group-hover:text-slate-600"}
          `}
        >
          {number}
        </span>
      )}
    </button>
  );
}
