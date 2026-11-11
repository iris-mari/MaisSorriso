"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Search, FileImage, Calendar, User, Clock, ChevronRight, Loader2, Info, Download, Trash2, FolderOpen, X, Eye } from "lucide-react";
import Modal from "@/components/Modal";

interface Patient {
  id: string;
  name: string;
  dateOfBirth: string;
  phone: string;
  user?: {
    cpf: string;
    email: string | null;
  };
}

interface XRayDocument {
  id: string;
  patientId: string;
  name: string;
  type: string;
  data: string;
  createdAt: string;
}

export default function AdminXraysPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [xrays, setXrays] = useState<XRayDocument[]>([]);
  const [patientSearch, setPatientSearch] = useState("");
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingXrays, setLoadingXrays] = useState(false);
  
  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [selectedXrayForPreview, setSelectedXrayForPreview] = useState<XRayDocument | null>(null);
  
  // Upload Form State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadPatientId, setUploadPatientId] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileData, setFileData] = useState("");
  const [fileType, setFileType] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchPatients = async () => {
    setLoadingPatients(true);
    try {
      const res = await fetch("/api/patients?myOnly=true");
      const data = await res.json();
      const patientList = Array.isArray(data) ? data : [];
      setPatients(patientList);
      
      // Auto-select first patient if available
      if (patientList.length > 0 && !selectedPatient) {
        setSelectedPatient(patientList[0]);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoadingPatients(false);
    }
  };

  const fetchXraysForPatient = async (patientId: string) => {
    setLoadingXrays(true);
    try {
      const res = await fetch(`/api/xrays?patientId=${patientId}`);
      const data = await res.json();
      setXrays(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching xrays:", error);
    } finally {
      setLoadingXrays(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      fetchXraysForPatient(selectedPatient.id);
    } else {
      setXrays([]);
    }
  }, [selectedPatient]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (limit to 5MB for base64 payload safety)
    if (file.size > 5 * 1024 * 1024) {
      alert("Arquivo muito grande. O limite máximo é de 5MB.");
      return;
    }

    // Only images allowed for xrays
    if (!file.type.startsWith("image/")) {
      alert("Apenas arquivos de imagem são permitidos para exames de raio-x.");
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
    if (!uploadPatientId || !fileData) {
      alert("Por favor, selecione um paciente e um arquivo.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/xrays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: uploadPatientId,
          name: fileName,
          data: fileData,
        }),
      });

      if (res.ok) {
        setIsUploadModalOpen(false);
        setFileName("");
        setFileData("");
        setFileType("");
        
        // Refresh xray list if the current selected patient was the target
        if (selectedPatient && selectedPatient.id === uploadPatientId) {
          fetchXraysForPatient(selectedPatient.id);
        } else {
          const updatedPatient = patients.find(p => p.id === uploadPatientId);
          if (updatedPatient) {
            setSelectedPatient(updatedPatient);
          }
        }
      } else {
        const errData = await res.json();
        alert(`Erro: ${errData.error || "Não foi possível enviar o raio-x"}`);
      }
    } catch (error) {
      console.error("Error uploading xray:", error);
      alert("Erro ao enviar o raio-x.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteXray = async (id: string) => {
    if (!confirm("Tem certeza de que deseja excluir este exame de raio-x?")) return;

    try {
      const res = await fetch(`/api/xrays?id=${id}`, {
        method: "DELETE"
      });

      if (res.ok) {
        if (selectedPatient) {
          fetchXraysForPatient(selectedPatient.id);
        }
      } else {
        const errData = await res.json();
        alert(`Erro: ${errData.error || "Não foi possível excluir o raio-x"}`);
      }
    } catch (error) {
      console.error("Error deleting xray:", error);
      alert("Erro ao excluir o raio-x.");
    }
  };

  const downloadFile = (xray: XRayDocument) => {
    const a = document.createElement("a");
    a.href = xray.data;
    a.download = xray.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Filter patients
  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
    patient.phone.includes(patientSearch)
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1 sm:gap-2">
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">Gestão de Raio-x</h2>
          <p className="text-slate-500 text-xs sm:text-base font-medium tracking-tight">Envie imagens de radiografias para os prontuários dos pacientes com notificações automáticas.</p>
        </div>
        <button
          onClick={() => {
            setUploadPatientId(selectedPatient?.id || "");
            setFileName("");
            setFileData("");
            setFileType("");
            setIsUploadModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-[1.5rem] font-black flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-100 hover:scale-105 active:scale-95 w-full sm:w-auto text-xs sm:text-sm cursor-pointer"
        >
          <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
          Adicionar Raio-x
        </button>
      </div>

      {/* Main Dual-Pane Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        
        {/* Left Side: Patients Selector */}
        <div className="lg:col-span-4 bg-white rounded-2xl sm:rounded-[2.5rem] border border-slate-100 shadow-premium p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="space-y-1 sm:space-y-2">
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">Pacientes</h3>
            <p className="text-xs text-slate-400 font-medium">Selecione o paciente para gerenciar seus raios-x</p>
          </div>

          {/* Search bar */}
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-50 focus-within:border-blue-200 transition-all">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 shrink-0" />
            <input
              type="text"
              placeholder="Buscar paciente..."
              value={patientSearch}
              onChange={(e) => setPatientSearch(e.target.value)}
              className="bg-transparent border-none outline-none text-xs sm:text-sm font-bold text-slate-700 placeholder:text-slate-400 w-full"
            />
          </div>

          {/* Patient list container */}
          <div className="max-h-[350px] sm:max-h-[500px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {loadingPatients ? (
              <div className="py-12 text-center text-slate-400">
                <Loader2 className="w-7 h-7 sm:w-8 sm:h-8 animate-spin mx-auto text-blue-500 mb-2" />
                <span className="text-xs font-bold">Carregando pacientes...</span>
              </div>
            ) : filteredPatients.length === 0 ? (
              <div className="py-12 text-center text-slate-300">
                <Info className="w-7 h-7 sm:w-8 sm:h-8 mx-auto mb-2" />
                <span className="text-xs sm:text-sm font-bold">Nenhum paciente encontrado.</span>
              </div>
            ) : (
              filteredPatients.map((patient) => {
                const isSelected = selectedPatient?.id === patient.id;
                return (
                  <button
                    key={patient.id}
                    onClick={() => setSelectedPatient(patient)}
                    className={`w-full text-left p-3 sm:p-4 rounded-xl sm:rounded-2xl flex items-center justify-between transition-all group border ${
                      isSelected
                        ? "bg-blue-50/70 border-blue-100 shadow-sm"
                        : "bg-white border-transparent hover:bg-slate-50/50"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-black transition-all shrink-0 text-xs sm:text-sm ${
                        isSelected
                          ? "bg-blue-600 text-white"
                          : "bg-slate-100 text-slate-600 group-hover:bg-blue-50 group-hover:text-blue-600"
                      }`}>
                        {patient.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-xs sm:text-sm font-bold truncate tracking-tight ${isSelected ? "text-blue-900" : "text-slate-700 group-hover:text-blue-600"}`}>
                          {patient.name}
                        </p>
                        <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-tight">{patient.phone}</p>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isSelected ? "text-blue-500 translate-x-1" : "text-slate-300 group-hover:text-blue-500"}`} />
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: X-Ray Records */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-6">
          {selectedPatient ? (
            <>
              {/* Selected Patient Profile */}
              <div className="bg-white rounded-2xl sm:rounded-[2.5rem] border border-slate-100 shadow-premium p-4 sm:p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-center">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-50 text-blue-600 rounded-xl sm:rounded-[1.25rem] flex items-center justify-center font-black text-xl sm:text-2xl shadow-sm shrink-0">
                    {selectedPatient.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base sm:text-xl font-black text-slate-900 tracking-tight truncate">{selectedPatient.name}</h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-0.5 mt-1">
                      <p className="text-[10px] sm:text-xs text-slate-400 font-bold uppercase tracking-tight">
                        CPF: {selectedPatient.user?.cpf?.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4") || "Sem login associado"}
                      </p>
                      {selectedPatient.user?.email && (
                        <p className="text-[10px] sm:text-xs text-slate-400 font-bold lowercase truncate">
                          {selectedPatient.user.email}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 sm:md:pl-8">
                  <div className="bg-slate-50/50 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100">
                    <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-wider">Total de Raio-x</p>
                    <p className="text-xl sm:text-2xl font-black text-slate-800 mt-1">{xrays.length}</p>
                  </div>
                </div>
              </div>

              {/* X-Ray Gallery */}
              <div className="bg-white rounded-2xl sm:rounded-[2.5rem] border border-slate-100 shadow-premium p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 sm:space-y-1">
                    <h4 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">Galeria de Exames Radiográficos</h4>
                    <p className="text-xs text-slate-400 font-medium">Exames anexados para o paciente selecionado</p>
                  </div>
                </div>

                {loadingXrays ? (
                  <div className="py-16 text-center text-slate-400">
                    <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin mx-auto text-blue-500 mb-3 sm:mb-4" />
                    <p className="font-bold text-xs sm:text-sm">Carregando exames...</p>
                  </div>
                ) : xrays.length === 0 ? (
                  <div className="py-12 sm:py-20 text-center border-2 border-dashed border-slate-100 rounded-2xl sm:rounded-3xl p-4">
                    <FileImage className="w-10 h-10 sm:w-12 sm:h-12 text-slate-200 mx-auto mb-3 sm:mb-4" />
                    <h5 className="font-black text-slate-400 text-base sm:text-lg">Nenhum exame anexado</h5>
                    <p className="text-slate-300 text-xs mt-1">Clique em "Adicionar Raio-x" para subir uma imagem para este paciente.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {xrays.map((xray) => (
                      <div
                        key={xray.id}
                        className="group border border-slate-100 hover:border-blue-100 rounded-2xl sm:rounded-3xl overflow-hidden bg-slate-50 hover:bg-white transition-all duration-300 hover:shadow-xl hover:shadow-blue-50/50 flex flex-col"
                      >
                        {/* Image Preview Container */}
                        <div className="relative aspect-video bg-slate-950 overflow-hidden flex items-center justify-center group/img">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={xray.data}
                            alt={xray.name}
                            className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover/img:scale-105"
                          />
                          {/* Hover Overlay */}
                          <div className="absolute inset-0 bg-slate-900/40 opacity-100 sm:opacity-0 sm:group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            <button
                              onClick={() => {
                                setSelectedXrayForPreview(xray);
                                setIsPreviewModalOpen(true);
                              }}
                              className="p-2.5 sm:p-3 bg-white/20 hover:bg-white/30 text-white rounded-full backdrop-blur-md transition-all scale-95 sm:scale-90 sm:group-hover/img:scale-100 cursor-pointer"
                              title="Visualizar ampliado"
                            >
                              <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                            <button
                              onClick={() => downloadFile(xray)}
                              className="p-2.5 sm:p-3 bg-white text-blue-600 hover:bg-slate-50 rounded-full shadow-lg transition-all scale-95 sm:scale-90 sm:group-hover/img:scale-100 cursor-pointer"
                              title="Baixar exame"
                            >
                              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                          </div>
                        </div>

                        {/* Document details */}
                        <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3 sm:gap-4">
                          <div>
                            <p className="font-bold text-slate-800 text-xs sm:text-sm leading-snug truncate" title={xray.name}>
                              {xray.name}
                            </p>
                            <div className="flex items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] text-slate-400 font-black mt-2 flex-wrap">
                              <span className="flex items-center gap-1 bg-slate-200/50 px-2 py-0.5 rounded-md uppercase tracking-tight">
                                <Calendar className="w-3 h-3" />
                                {new Date(xray.createdAt).toLocaleDateString("pt-BR")}
                              </span>
                              <span className="flex items-center gap-1 bg-slate-200/50 px-2 py-0.5 rounded-md uppercase tracking-tight">
                                <Clock className="w-3 h-3" />
                                {new Date(xray.createdAt).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteXray(xray.id)}
                            className="mt-1 sm:mt-2 w-full py-2 sm:py-2.5 rounded-xl border border-red-100 text-red-500 font-bold text-xs tracking-tight flex items-center justify-center gap-2 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            EXCLUIR EXAME
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl sm:rounded-[2.5rem] border border-slate-100 shadow-premium p-8 sm:p-12 text-center flex flex-col items-center justify-center min-h-[250px] sm:min-h-[300px]">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-50 text-blue-600 rounded-xl sm:rounded-[1.25rem] flex items-center justify-center mb-3 sm:mb-4">
                <FileImage className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-base sm:text-xl font-black text-slate-800">Nenhum Paciente Selecionado</h3>
              <p className="text-slate-400 text-xs sm:text-sm max-w-xs mt-1">Selecione um paciente na lista acima para visualizar suas informações e histórico de exames de raio-x.</p>
            </div>
          )}
        </div>

      </div>

      {/* Upload X-Ray Modal */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Anexar Novo Raio-x"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Selection Dropdown */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Selecione o Paciente</label>
            <select
              required
              value={uploadPatientId}
              onChange={(e) => setUploadPatientId(e.target.value)}
              className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-8 focus:ring-blue-50 transition-all outline-none font-bold text-slate-600 appearance-none cursor-pointer"
            >
              <option value="" disabled>-- Selecione um Paciente --</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>
          </div>

          {/* File selector input */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Imagem do Exame</label>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              onChange={handleFileChange} 
              accept="image/*"
            />
            
            {fileData ? (
              <div className="flex flex-col gap-3 p-4 rounded-2xl border border-blue-200 bg-blue-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <FileImage className="w-5 h-5 text-blue-600 shrink-0" />
                    <span className="font-bold text-sm text-blue-900 truncate" title={fileName}>{fileName}</span>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => { setFileData(""); setFileName(""); setFileType(""); }}
                    className="p-1 hover:bg-blue-100 rounded-lg text-blue-500 transition-colors shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                {/* Image preview in modal */}
                <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center border border-blue-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={fileData} alt="Preview" className="max-h-full max-w-full object-contain" />
                </div>
              </div>
            ) : (
              <button 
                type="button" 
                onClick={handleUploadClick}
                className="w-full flex flex-col items-center justify-center gap-2 py-10 rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-slate-400 hover:text-blue-500 group"
              >
                <div className="w-12 h-12 bg-slate-100 rounded-xl group-hover:bg-white flex items-center justify-center transition-colors">
                  <FolderOpen className="w-6 h-6" />
                </div>
                <span className="font-bold text-sm">Selecione uma imagem de Raio-x</span>
                <span className="text-xs">Formatos aceitos: JPG, PNG, WEBP (Máx 5MB)</span>
              </button>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting || !fileData || !uploadPatientId}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-blue-100 disabled:opacity-50 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98]"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <FolderOpen className="w-5 h-5" />}
            FAZER UPLOAD E ANEXAR
          </button>
        </form>
      </Modal>

      {/* Large Image Preview Modal */}
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
                <p className="text-xs text-slate-400 font-black uppercase tracking-wider">Data de Anexação</p>
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
