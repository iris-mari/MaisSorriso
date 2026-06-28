"use client";

import { useState, useEffect } from "react";
import { FileImage, Loader2, Download, Eye, Calendar, Clock, X } from "lucide-react";
import Modal from "@/components/Modal";

interface XRayDocument {
  id: string;
  name: string;
  type: string;
  data: string;
  createdAt: string;
}

export default function ClientXraysPage() {
  const [xrays, setXrays] = useState<XRayDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedXrayForPreview, setSelectedXrayForPreview] = useState<XRayDocument | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const fetchXrays = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/client/xrays");
      const data = await res.json();
      setXrays(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching client xrays:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchXrays();
  }, []);

  const downloadFile = (xray: XRayDocument) => {
    const a = document.createElement("a");
    a.href = xray.data;
    a.download = xray.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-12">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Meu Raio-x</h2>
        <p className="text-slate-500 font-medium tracking-tight">
          Acompanhe suas radiografias odontológicas e consulte as datas de anexação dos exames.
        </p>
      </div>

      {/* Main Content Area */}
      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-premium p-8">
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
          </div>
        ) : xrays.length === 0 ? (
          <div className="py-20 text-center">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileImage className="w-10 h-10 text-slate-200" />
            </div>
            <h3 className="text-slate-500 font-black text-lg">Nenhum exame de raio-x anexado</h3>
            <p className="text-slate-400 font-medium max-w-xs mx-auto mt-2">
              Seu dentista ainda não anexou exames radiográficos ao seu prontuário.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {xrays.map((xray) => (
              <div 
                key={xray.id} 
                className="group border border-slate-100 hover:border-blue-100 rounded-[2rem] overflow-hidden bg-slate-50 hover:bg-white transition-all duration-300 hover:shadow-xl hover:shadow-blue-50/50 flex flex-col"
              >
                {/* Image Area with hover effect */}
                <div className="relative aspect-video bg-slate-950 flex items-center justify-center overflow-hidden group/img">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={xray.data} 
                    alt={xray.name} 
                    className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover/img:scale-105"
                  />
                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      onClick={() => {
                        setSelectedXrayForPreview(xray);
                        setIsPreviewModalOpen(true);
                      }}
                      className="p-3 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-md transition-all scale-90 group-hover/img:scale-100 font-bold"
                      title="Visualizar Ampliado"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => downloadFile(xray)}
                      className="p-3 bg-white text-blue-600 hover:bg-slate-50 rounded-full shadow-lg transition-all scale-90 group-hover/img:scale-100"
                      title="Baixar exame"
                    >
                      <Download className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Details Area */}
                <div className="p-6 flex-1 flex flex-col justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-slate-800 text-base leading-snug truncate" title={xray.name}>
                      {xray.name}
                    </h4>
                    
                    <div className="flex flex-col gap-2 mt-4">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                        Data de Anexação
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs font-bold text-slate-500 mt-1">
                        <span className="flex items-center gap-1.5 bg-slate-200/50 px-2.5 py-1 rounded-full uppercase tracking-tight">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(xray.createdAt).toLocaleDateString("pt-BR")}
                        </span>
                        <span className="flex items-center gap-1.5 bg-slate-200/50 px-2.5 py-1 rounded-full uppercase tracking-tight">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(xray.createdAt).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button 
                    onClick={() => downloadFile(xray)}
                    className="mt-2 w-full py-3.5 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-sm tracking-tight flex items-center justify-center gap-2 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-200 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    BAIXAR EXAME
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <Modal
        isOpen={isPreviewModalOpen}
        onClose={() => {
          setIsPreviewModalOpen(false);
          setSelectedXrayForPreview(null);
        }}
        title={selectedXrayForPreview?.name || "Visualização do Exame"}
      >
        {selectedXrayForPreview && (
          <div className="space-y-4">
            <div className="bg-slate-950 rounded-2xl border border-slate-800 max-h-[70vh] overflow-hidden flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selectedXrayForPreview.data}
                alt={selectedXrayForPreview.name}
                className="max-h-[60vh] object-contain"
              />
            </div>
            <div className="flex items-center justify-between border-t border-slate-100 pt-4">
              <div>
                <p className="text-xs text-slate-400 font-black uppercase tracking-wider">Anexado em</p>
                <p className="text-sm font-bold text-slate-700 mt-1">
                  {new Date(selectedXrayForPreview.createdAt).toLocaleString("pt-BR")}
                </p>
              </div>
              <button
                onClick={() => downloadFile(selectedXrayForPreview)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-xl font-bold text-sm tracking-tight flex items-center gap-2 transition-all shadow-md"
              >
                <Download className="w-4 h-4" />
                Baixar Arquivo
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
