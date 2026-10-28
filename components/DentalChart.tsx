"use client";

import { useState } from "react";
import Tooth from "./Tooth";
import { getToothInfo, ToothCategory, ToothType } from "@/lib/teeth";

interface DentalChartProps {
  onToothSelect: (toothNumber: number, toothName: string) => void;
  selectedTooth: number | null;
  teethWithRecords: number[];
}

interface ToothPosition {
  number: number;
  name: string;
  category: ToothCategory;
  type: ToothType;
  x: number; // percentage left
  y: number; // percentage top
  rotation: number; // angle in degrees
}

// Generate the SVG path for background guide arches (Flat-bottom U-shaped quartic curves)
function getArchPath(
  wX: number,
  hY: number,
  yVertex: number,
  isUpper: boolean
): string {
  const points: string[] = [];
  for (let step = -20; step <= 20; step++) {
    const t = step / 20; // parameter from -1 to 1
    const x = 50 + wX * t;
    const y = isUpper ? yVertex + hY * Math.pow(t, 4) : yVertex - hY * Math.pow(t, 4);
    points.push(`${x},${y}`);
  }
  return `M ${points.join(" L ")}`;
}

export default function DentalChart({
  onToothSelect,
  selectedTooth,
  teethWithRecords,
}: DentalChartProps) {
  const [filter, setFilter] = useState<"todos" | "adulto" | "infantil">("todos");

  const hasRecord = (n: number) => teethWithRecords.includes(n);

  // Generate all teeth positions based on Flat-bottom U-shape (quartic) equations
  const getTeethPositions = (): ToothPosition[] => {
    const list: ToothPosition[] = [];

    // Permanent teeth configuration (W_x = 32 gives a nice width, H_y = 30 gives a nice depth)
    const W_x = 32; 
    const H_y = 30; 
    const Y_upper_vertex = 8; 
    const Y_lower_vertex = 92; 

    // Deciduous (child) teeth configuration (concentric smaller quartic arches)
    const W_child_x = 20; 
    const H_child_y = 17; 
    const Y_child_upper_vertex = 22; 
    const Y_child_lower_vertex = 78; 

    // 1. Upper Permanent (18 to 28)
    const upperPermanent = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
    upperPermanent.forEach((num, index) => {
      const t = -1 + (2 * index) / 15; // uniform linear distribution along X axis
      
      const x = 50 + W_x * t;
      const y = Y_upper_vertex + H_y * Math.pow(t, 4); // Flat top around t=0, steep walls near t=+-1
      
      // Rotation: vertical at front (t=0) and vertical at back (t=+-1), peak tilt in the middle (canines/premolars)
      const rotation = 180 - 75 * t * (1 - t * t);
      
      const info = getToothInfo(num);
      list.push({
        number: num,
        name: info.name,
        category: "adulto",
        type: info.type,
        x,
        y,
        rotation,
      });
    });

    // 2. Lower Permanent (48 to 38)
    const lowerPermanent = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];
    lowerPermanent.forEach((num, index) => {
      const t = -1 + (2 * index) / 15;
      
      const x = 50 + W_x * t;
      const y = Y_lower_vertex - H_y * Math.pow(t, 4);
      
      const rotation = -75 * t * (1 - t * t);
      
      const info = getToothInfo(num);
      list.push({
        number: num,
        name: info.name,
        category: "adulto",
        type: info.type,
        x,
        y,
        rotation,
      });
    });

    // 3. Upper Deciduous (55 to 65)
    const upperDeciduous = [55, 54, 53, 52, 51, 61, 62, 63, 64, 65];
    upperDeciduous.forEach((num, index) => {
      const t = -1 + (2 * index) / 9;
      
      const x = 50 + W_child_x * t;
      const y = Y_child_upper_vertex + H_child_y * Math.pow(t, 4);
      
      const rotation = 180 - 60 * t * (1 - t * t);
      
      const info = getToothInfo(num);
      list.push({
        number: num,
        name: info.name,
        category: "infantil",
        type: info.type,
        x,
        y,
        rotation,
      });
    });

    // 4. Lower Deciduous (85 to 75)
    const lowerDeciduous = [85, 84, 83, 82, 81, 71, 72, 73, 74, 75];
    lowerDeciduous.forEach((num, index) => {
      const t = -1 + (2 * index) / 9;
      
      const x = 50 + W_child_x * t;
      const y = Y_child_lower_vertex - H_child_y * Math.pow(t, 4);
      
      const rotation = -60 * t * (1 - t * t);
      
      const info = getToothInfo(num);
      list.push({
        number: num,
        name: info.name,
        category: "infantil",
        type: info.type,
        x,
        y,
        rotation,
      });
    });

    return list;
  };

  const teethPositions = getTeethPositions().filter(
    (tooth) => filter === "todos" || tooth.category === filter
  );

  return (
    <div className="flex flex-col items-center p-4 sm:p-6 md:p-8 bg-slate-50/40 rounded-[2.5rem] md:rounded-[3rem] border border-slate-100/80 shadow-inner">
      {/* Category Filters */}
      <div className="flex gap-1 p-1 bg-slate-200/50 backdrop-blur-sm rounded-2xl border border-slate-200/20 max-w-md w-full mb-8 shadow-sm">
        <button
          onClick={() => setFilter("todos")}
          type="button"
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${
            filter === "todos"
              ? "bg-white text-slate-800 shadow-sm border border-slate-100"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Todos
        </button>
        <button
          onClick={() => setFilter("adulto")}
          type="button"
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${
            filter === "adulto"
              ? "bg-white text-slate-800 shadow-sm border border-slate-100"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Adultos
        </button>
        <button
          onClick={() => setFilter("infantil")}
          type="button"
          className={`flex-1 py-2 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all duration-300 ${
            filter === "infantil"
              ? "bg-white text-slate-800 shadow-sm border border-slate-100"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Infantis
        </button>
      </div>

      {/* Interactive Odontogram Parabolic Board */}
      <div className="relative w-full aspect-[800/700] max-w-[650px] bg-white rounded-[2rem] border border-slate-100/50 shadow-sm overflow-hidden p-2 select-none">
        
        {/* Background Guide lines (SVG coords correspond directly to percentages) */}
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 w-full h-full pointer-events-none stroke-slate-200"
          style={{ width: "100%", height: "100%" }}
        >
          {/* Vertical Midline (Linha Média Dental) */}
          <line
            x1="50"
            y1="4"
            x2="50"
            y2="96"
            strokeDasharray="2,2"
            strokeWidth="0.15"
            className="stroke-slate-300"
          />

          {/* Horizontal Occlusion Line (Bite Line) */}
          <line
            x1="8"
            y1="50"
            x2="92"
            y2="50"
            strokeWidth="0.1"
            className="stroke-slate-200"
          />
          <circle
            cx="50"
            cy="50"
            r="1"
            fill="white"
            stroke="#cbd5e1"
            strokeWidth="0.25"
          />

          {/* Guide curves: Upper permanent */}
          {(filter === "todos" || filter === "adulto") && (
            <path
              d={getArchPath(32, 30, 8, true)}
              fill="none"
              strokeWidth="0.2"
              strokeDasharray="2,2"
              className="stroke-slate-200/80"
            />
          )}

          {/* Guide curves: Lower permanent */}
          {(filter === "todos" || filter === "adulto") && (
            <path
              d={getArchPath(32, 30, 92, false)}
              fill="none"
              strokeWidth="0.2"
              strokeDasharray="2,2"
              className="stroke-slate-200/80"
            />
          )}

          {/* Guide curves: Upper child */}
          {(filter === "todos" || filter === "infantil") && (
            <path
              d={getArchPath(20, 17, 22, true)}
              fill="none"
              strokeWidth="0.2"
              strokeDasharray="2,2"
              className="stroke-slate-200/80"
            />
          )}

          {/* Guide curves: Lower child */}
          {(filter === "todos" || filter === "infantil") && (
            <path
              d={getArchPath(20, 17, 78, false)}
              fill="none"
              strokeWidth="0.2"
              strokeDasharray="2,2"
              className="stroke-slate-200/80"
            />
          )}
        </svg>

        {/* Render interactive Teeth buttons */}
        {teethPositions.map((tooth) => (
          <Tooth
            key={tooth.number}
            number={tooth.number}
            name={tooth.name}
            category={tooth.category}
            type={tooth.type}
            x={tooth.x}
            y={tooth.y}
            rotation={tooth.rotation}
            isSelected={selectedTooth === tooth.number}
            hasRecord={hasRecord(tooth.number)}
            onClick={onToothSelect}
          />
        ))}
      </div>

      {/* Legend section */}
      <div className="mt-8 flex flex-wrap justify-center gap-6 sm:gap-8 bg-white px-8 py-4 rounded-2xl border border-slate-100 shadow-sm text-xs font-bold text-slate-600">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-md bg-gradient-to-b from-blue-400 to-blue-600 border border-blue-700 shadow-sm" />
          <span>Selecionado</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-md bg-gradient-to-b from-red-400 to-red-500 border border-red-600 shadow-sm" />
          <span>Com Registro</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-md bg-gradient-to-b from-slate-50 to-slate-200 border border-slate-350 shadow-sm" />
          <span>Sem Registro</span>
        </div>
      </div>
    </div>
  );
}
