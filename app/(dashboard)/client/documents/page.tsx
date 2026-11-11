"use client";

import { useState, useEffect, useRef } from "react";
import { FolderOpen, Plus, Loader2, File, Download, X } from "lucide-react";
import Modal from "@/components/Modal";

interface PatientDocument {
  id: string;
  name: string;
  type: string;
  data: string;
  createdAt: string;
}

export default function ClientDocumentsPage() {
  const [documents, setDocuments] = useState<PatientDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  
  const [fileName, setFileName] = useState("");
  const [fileData, setFileData] = useState("");
  const [fileType, setFileType] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/client/documents");
      const data = await res.json();
      setDocuments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("Arquivo muito grande. O limite máximo para o MVP é de 5MB.");
      return;
    }

    setFileName(file.name);
    setFileType(file.type);

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setFileData(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileData) {
      alert("Por favor, selecione um arquivo.");
      return;
    }

    setIsUploading(true);
    try {
      const res = await fetch("/api/client/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fileName,
          type: fileType,
          data: fileData,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setFileName("");
        setFileData("");
        setFileType("");
        fetchDocuments();
      } else {
        const error = await res.json();
        alert(error.error || "Erro ao fazer upload");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const downloadFile = (doc: PatientDocument) => {
    const a = document.createElement("a");
    a.href = doc.data;
    a.download = doc.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6 sm:space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1 sm:gap-2">
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">Meus Documentos</h2>
          <p className="text-slate-500 text-xs sm:text-base font-medium tracking-tight">Visualize ou anexe exames, radiografias e laudos médicos.</p>
        </div>
        <button 
          onClick={() => {
            setFileName("");
            setFileData("");
            setFileType("");
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-[1.5rem] font-black flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-100 hover:scale-105 active:scale-95 w-full sm:w-auto text-xs sm:text-sm cursor-pointer"
        >
          <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
          Novo Documento
        </button>
      </div>

      <div className="bg-white rounded-2xl sm:rounded-[3rem] border border-slate-100 shadow-premium p-4 sm:p-8">
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-10 h-10 animate-spin text-blue-500" />
          </div>
        ) : documents.length === 0 ? (
          <div className="py-16 sm:py-20 text-center">
            <div className="bg-slate-50 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-8 h-8 sm:w-10 sm:h-10 text-slate-200" />
            </div>
            <p className="text-slate-400 font-bold text-base sm:text-lg">Nenhum documento anexado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {documents.map((doc) => (
              <div key={doc.id} className="p-4 sm:p-6 bg-slate-50 rounded-2xl sm:rounded-3xl border border-slate-100 flex flex-col gap-3 sm:gap-4 group transition-all hover:bg-white hover:border-blue-100 hover:shadow-xl hover:shadow-blue-50/50">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                  <File className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 text-sm sm:text-base truncate" title={doc.name}>{doc.name}</p>
                  <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button 
                  onClick={() => downloadFile(doc)}
                  className="mt-1 sm:mt-2 w-full py-2.5 sm:py-3 rounded-xl bg-white border border-slate-200 text-slate-600 font-bold text-xs sm:text-sm tracking-tight flex items-center justify-center gap-2 group-hover:bg-blue-50 group-hover:text-blue-600 group-hover:border-blue-200 transition-colors cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  BAIXAR ARQUIVO
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Anexar Documento">
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            onChange={handleFileChange} 
            accept="image/*,application/pdf"
          />
          
          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Arquivo Selecionado</label>
            {fileData ? (
              <div className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-blue-200 bg-blue-50">
                <div className="flex items-center gap-2 sm:gap-3 overflow-hidden">
                  <File className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 shrink-0" />
                  <span className="font-bold text-xs sm:text-sm text-blue-900 truncate">{fileName}</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => { setFileData(""); setFileName(""); setFileType(""); }}
                  className="p-1 hover:bg-blue-100 rounded-lg text-blue-500 transition-colors shrink-0"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            ) : (
              <button 
                type="button" 
                onClick={handleUploadClick}
                className="w-full border-2 border-dashed border-slate-200 rounded-xl sm:rounded-2xl p-6 sm:p-8 flex flex-col items-center justify-center gap-2 text-slate-400 hover:border-blue-500 hover:text-blue-500 hover:bg-blue-50/50 transition-all cursor-pointer"
              >
                <FolderOpen className="w-8 h-8 sm:w-10 sm:h-10 text-slate-300" />
                <span className="font-bold text-xs sm:text-sm">Clique para selecionar um arquivo</span>
                <span className="text-[10px] sm:text-xs">Imagens ou PDF até 5MB</span>
              </button>
            )}
          </div>

          <button 
            type="submit" 
            disabled={isUploading || !fileData}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3.5 sm:py-4 rounded-xl sm:rounded-2xl shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 text-xs sm:text-sm cursor-pointer"
          >
            {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
            ENVIAR DOCUMENTO
          </button>
        </form>
      </Modal>
    </div>
  );
}
