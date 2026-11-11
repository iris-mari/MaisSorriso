"use client";

import { useState, useEffect } from "react";
import { Stethoscope, Loader2, FileText, Calendar } from "lucide-react";
import DentalChart from "@/components/DentalChart";

interface DentalRecord {
  id: string;
  toothNumber: number;
  description: string;
  createdAt: string;
}

export default function ClientRecordsPage() {
  const [records, setRecords] = useState<DentalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/client/records")
      .then((res) => res.json())
      .then((data) => {
        setRecords(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 sm:space-y-12">
      <div className="flex flex-col gap-1 sm:gap-2">
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">Meu Prontuário</h2>
        <p className="text-slate-500 text-xs sm:text-base font-medium tracking-tight">Acompanhe as observações do seu dentista e tratamentos por dente.</p>
      </div>

      <div className="bg-white rounded-2xl sm:rounded-[3rem] border border-slate-100 shadow-premium p-4 sm:p-8">
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
          </div>
        ) : records.length === 0 ? (
          <div className="py-16 sm:py-20 text-center">
            <div className="bg-slate-50 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Stethoscope className="w-8 h-8 sm:w-10 sm:h-10 text-slate-200" />
            </div>
            <p className="text-slate-400 font-bold text-base sm:text-lg">Nenhum registro encontrado no prontuário.</p>
          </div>
        ) : (
          <div className="space-y-6 sm:space-y-12">
            <div className="bg-slate-50/50 p-2 sm:p-8 rounded-2xl sm:rounded-[2rem] border border-slate-100/60 relative overflow-hidden">
              <div className="flex items-center justify-between p-2 sm:p-0 mb-4 sm:mb-8">
                <div className="flex flex-col gap-1">
                  <h3 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">Mapa Anatômico Interativo</h3>
                  <p className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest">Dentes com diagnóstico ou intervenção</p>
                </div>
              </div>
              <DentalChart 
                selectedTooth={null}
                onToothSelect={() => {}} // Read-only for client
                teethWithRecords={Array.from(new Set(records.map(r => r.toothNumber)))}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-4 sm:mb-8">
                <h3 className="text-base sm:text-xl font-black text-slate-900 tracking-tight">Histórico Cronológico</h3>
              </div>
              <div className="space-y-3 sm:space-y-4">
                {records.map((record) => (
                  <div key={record.id} className="p-4 sm:p-6 bg-slate-50 rounded-2xl sm:rounded-3xl border border-slate-100 flex flex-col md:flex-row md:items-center gap-4 sm:gap-6 hover:bg-white hover:border-slate-200 transition-all shadow-sm">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white border border-slate-200/60 shadow-sm flex flex-col items-center justify-center shrink-0">
                      <span className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Dente</span>
                      <span className="text-base sm:text-xl font-black text-blue-600 leading-none">{record.toothNumber}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 sm:mb-2">
                        <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                        <p className="font-bold text-slate-700 text-xs sm:text-sm">Observação Clínica</p>
                      </div>
                      <p className="text-slate-600 leading-relaxed text-xs sm:text-sm font-medium break-words">
                        {record.description}
                      </p>
                    </div>
                    <div className="shrink-0 flex items-center gap-2 bg-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl border border-slate-100 shadow-sm self-start md:self-auto text-[10px] sm:text-xs">
                      <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 shrink-0" />
                      <span className="font-black text-slate-500 uppercase tracking-widest">{new Date(record.createdAt).toLocaleDateString()}</span>
                      <span className="text-slate-300 font-black">•</span>
                      <span className="font-black text-slate-400">{new Date(record.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
