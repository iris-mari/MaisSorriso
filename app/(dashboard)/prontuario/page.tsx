"use client";

import { useState, useEffect, useCallback } from "react";
import { User, Stethoscope, Save, Loader2, Info, Edit, Trash2, Plus } from "lucide-react";
import DentalChart from "@/components/DentalChart";
import Modal from "@/components/Modal";
import { getToothInfo } from "@/lib/teeth";

interface Patient {
  id: string;
  name: string;
}

interface DentalRecord {
  id: string;
  toothNumber: number;
  description: string;
  createdAt: string;
}

export default function ProntuarioPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [records, setRecords] = useState<DentalRecord[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [toothDescription, setToothDescription] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchRecords = useCallback(async () => {
    if (!selectedPatientId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/dental-records?patientId=${selectedPatientId}`);
      const data = await res.json();
      setRecords(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching records:", error);
    } finally {
      setLoading(false);
    }
  }, [selectedPatientId]);

  useEffect(() => {
    fetch("/api/patients?myOnly=true")
      .then(res => res.json())
      .then(data => setPatients(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    if (selectedPatientId) {
      fetchRecords();
    } else {
      setRecords([]);
    }
  }, [selectedPatientId, fetchRecords]);

  const handleToothSelect = (number: number) => {
    setSelectedTooth(number);
    setToothDescription("");
    setEditingRecordId(null);
    setIsModalOpen(true);
  };

  const handleEdit = (record: DentalRecord) => {
    setSelectedTooth(record.toothNumber);
    setToothDescription(record.description);
    setEditingRecordId(record.id);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este registro?")) return;
    
    try {
      const res = await fetch(`/api/dental-records/${id}`, { method: "DELETE" });
      if (res.ok) fetchRecords();
    } catch (error) {
      console.error("Error deleting record:", error);
    }
  };

  const handleSaveRecord = async () => {
    if (!selectedPatientId || selectedTooth === null) return;
    
    setIsSaving(true);
    try {
      const url = editingRecordId ? `/api/dental-records/${editingRecordId}` : "/api/dental-records";
      const method = editingRecordId ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: selectedPatientId,
          toothNumber: selectedTooth,
          description: toothDescription,
        }),
      });
      if (res.ok) {
        fetchRecords();
        setIsModalOpen(false);
        setEditingRecordId(null);
        setToothDescription("");
      }
    } catch (error) {
      console.error("Error saving record:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-8 sm:space-y-12">
      <div className="flex flex-col gap-1 sm:gap-2">
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">Prontuário Clínico</h2>
        <p className="text-slate-500 text-sm sm:text-base font-medium tracking-tight">Acompanhamento detalhado e mapeamento dental interativo.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-12">
        {/* Left Column: Patient Selector */}
        <div className="lg:col-span-1 space-y-6 sm:space-y-8">
          <div className="bg-white p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-[2.5rem] md:rounded-[3rem] border border-slate-100 shadow-premium space-y-6 sm:space-y-8">
            <div className="flex flex-col gap-3 sm:gap-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-blue-500" />
                Paciente Selecionado
              </h3>
              <select 
                className="w-full px-4 sm:px-6 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl border border-slate-200/60 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 bg-slate-50 text-xs sm:text-sm font-bold transition-all shadow-sm"
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
              >
                <option value="">Selecione um paciente...</option>
                {patients.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            {selectedPatientId && (
              <div className="pt-6 sm:pt-8 border-t border-slate-50 space-y-4 sm:space-y-6">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Resumo Clínico</span>
                  <p className="text-xs sm:text-sm font-bold text-slate-600">{loading ? "..." : records.length} registros encontrados</p>
                </div>
                
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-5 sm:p-6 rounded-2xl sm:rounded-[2rem] text-white shadow-xl shadow-blue-100 relative overflow-hidden group">
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                  <h4 className="font-black text-xs sm:text-sm flex items-center gap-2 mb-2 sm:mb-3">
                    <Info className="w-4 h-4 sm:w-5 sm:h-5 text-blue-200" />
                    INSTRUÇÃO
                  </h4>
                  <p className="text-[11px] sm:text-xs text-blue-100 font-medium leading-relaxed">
                    Toque em um dente na arcada para registrar diagnóstico ou procedimento.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Dental Chart & History */}
        <div className="lg:col-span-3 space-y-6 sm:space-y-12">
          {!selectedPatientId ? (
            <div className="bg-white rounded-2xl sm:rounded-[3rem] md:rounded-[4rem] border border-slate-100 border-dashed p-8 sm:p-16 md:p-28 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-slate-50 rounded-full flex items-center justify-center mb-4 sm:mb-6 shadow-inner border border-slate-100/50">
                <Stethoscope className="w-8 h-8 sm:w-10 sm:h-10 text-slate-200" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Selecione um paciente</h3>
              <p className="text-slate-400 mt-2 sm:mt-3 max-w-sm text-xs sm:text-sm font-medium tracking-tight">
                Para visualizar a arcada dentária interativa e o histórico clínico, selecione um paciente acima.
              </p>
            </div>
          ) : (
            <div className="space-y-6 sm:space-y-12">
              {/* Odontogram Card */}
              <div className="bg-white p-2 sm:p-4 rounded-2xl sm:rounded-[3rem] md:rounded-[4rem] border border-slate-100 shadow-premium relative transition-all duration-500">
                <div className="p-4 sm:p-8 md:p-10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-10 border-b border-slate-50 pb-6 sm:pb-8">
                    <div className="flex flex-col gap-1">
                       <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Mapeamento Anatômico</h3>
                       <p className="text-slate-400 text-xs sm:text-sm font-medium">Selecione um dente para adicionar relato</p>
                    </div>
                    <div className="bg-emerald-50 text-emerald-600 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2 self-start sm:self-auto">
                      <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                      Mapa Interativo
                    </div>
                  </div>
                  
                  <DentalChart 
                    selectedTooth={selectedTooth}
                    onToothSelect={handleToothSelect}
                    teethWithRecords={Array.from(new Set(records.map(r => r.toothNumber)))}
                  />
                </div>
              </div>

              {/* Patient Records Timeline/List */}
              <div className="bg-white p-5 sm:p-8 md:p-12 rounded-2xl sm:rounded-[3rem] md:rounded-[4rem] border border-slate-100 shadow-premium">
                <div className="flex items-center justify-between mb-6 sm:mb-10">
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Histórico do Prontuário</h3>
                  <div className="px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-50 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest">Cronológico</div>
                </div>
                
                {loading ? (
                   <div className="py-16 text-center">
                    <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin mx-auto mb-3 text-blue-500" />
                    <p className="font-bold text-xs sm:text-sm tracking-tight text-slate-400">Sincronizando prontuário...</p>
                  </div>
                ) : records.length === 0 ? (
                  <div className="py-10 text-center bg-slate-50/50 rounded-2xl sm:rounded-3xl border border-dashed border-slate-200">
                    <p className="text-slate-400 font-bold italic tracking-tight text-xs sm:text-sm">Sem registros clínicos disponíveis para este paciente.</p>
                  </div>
                ) : (
                  <div className="space-y-4 sm:space-y-6">
                    {records.map(record => {
                      const toothInfo = getToothInfo(record.toothNumber);
                      return (
                        <div key={record.id} className="p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-[2.5rem] border border-slate-100 bg-white hover:bg-slate-50/50 transition-all flex flex-col sm:flex-row gap-4 sm:gap-6 md:gap-8 group shadow-sm hover:shadow-md">
                          <div className="flex items-center justify-between sm:justify-start gap-4">
                            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-600 rounded-2xl sm:rounded-[1.5rem] flex flex-col items-center justify-center shadow-lg shadow-blue-100 group-hover:scale-105 transition-transform shrink-0">
                              <span className="text-lg sm:text-xl font-black text-white leading-none">{record.toothNumber}</span>
                              <span className="text-[7px] sm:text-[8px] font-black text-blue-200 uppercase tracking-widest mt-1">DENTE</span>
                            </div>

                            {/* Mobile action buttons */}
                            <div className="flex sm:hidden items-center gap-1.5">
                              <button 
                                onClick={() => handleEdit(record)}
                                className="p-2.5 rounded-xl bg-slate-50 hover:bg-blue-600 hover:text-white text-slate-500 transition-all border border-slate-100 shadow-sm"
                                title="Editar relato"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleDelete(record.id)}
                                className="p-2.5 rounded-xl bg-slate-50 hover:bg-red-600 hover:text-white text-slate-500 transition-all border border-slate-100 shadow-sm"
                                title="Excluir relato"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="flex-1 flex flex-col justify-center min-w-0">
                            <h4 className="text-[10px] sm:text-xs font-black text-blue-500 uppercase tracking-wider mb-1">
                              {toothInfo.name} ({toothInfo.category === "adulto" ? "Permanente" : "Decíduo"})
                            </h4>
                            <p className="text-slate-900 font-bold sm:font-black text-base sm:text-lg tracking-tight mb-2 group-hover:text-blue-600 transition-colors break-words">
                              {record.description}
                            </p>
                            <div className="flex items-center gap-3 sm:gap-4 text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-widest flex-wrap">
                              <span className="bg-slate-100 px-2.5 sm:px-3 py-1 rounded-full">{new Date(record.createdAt).toLocaleDateString("pt-BR")}</span>
                              <span>{new Date(record.createdAt).toLocaleTimeString("pt-BR", {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                          </div>

                          {/* Desktop action buttons */}
                          <div className="hidden sm:flex items-center gap-2 self-center opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            <button 
                              onClick={() => handleEdit(record)}
                              className="p-3 rounded-xl hover:bg-blue-600 hover:text-white text-slate-400 transition-all border border-slate-100 shadow-sm cursor-pointer"
                              title="Editar relato"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button 
                              onClick={() => handleDelete(record.id)}
                              className="p-3 rounded-xl hover:bg-red-600 hover:text-white text-slate-400 transition-all border border-slate-100 shadow-sm cursor-pointer"
                              title="Excluir relato"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setSelectedTooth(null);
          setEditingRecordId(null);
          setToothDescription("");
        }} 
        title={editingRecordId ? "Editar Relato de Diagnóstico" : "Novo Relato de Diagnóstico"}
      >
        <div className="space-y-6 sm:space-y-8 p-1 sm:p-4">
          {selectedTooth !== null && (
            <div className="p-4 sm:p-5 bg-blue-50/50 border border-blue-100 rounded-xl sm:rounded-[2rem] flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-b from-blue-400 to-blue-600 border border-blue-700 shadow-lg shadow-blue-100 rounded-2xl flex flex-col items-center justify-center text-white shrink-0">
                <span className="text-lg font-black leading-none">{selectedTooth}</span>
                <span className="text-[6px] font-black uppercase tracking-widest mt-0.5">FDI</span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[10px] font-black text-blue-700 uppercase tracking-widest">
                  {getToothInfo(selectedTooth).category === "adulto" ? "Dente Permanente" : "Dente Decíduo (Infantil)"}
                </h4>
                <p className="text-xs sm:text-sm font-black text-slate-800 tracking-tight leading-tight truncate">
                  {getToothInfo(selectedTooth).name}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-2 sm:space-y-4">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Descrição do Diagnóstico / Procedimento</label>
            <textarea 
              rows={4}
              className="w-full px-4 sm:px-6 py-3.5 sm:py-5 rounded-xl sm:rounded-[2rem] border border-slate-200 outline-none focus:border-blue-500 focus:ring-4 sm:focus:ring-8 focus:ring-blue-50 bg-slate-50 font-bold text-slate-700 placeholder:text-slate-300 transition-all text-xs sm:text-sm leading-relaxed"
              placeholder="Ex: Cárie oclusal detectada, canal necessário, restauração em resina composta no. 4..."
              value={toothDescription}
              onChange={(e) => setToothDescription(e.target.value)}
            />
          </div>
          <button 
            onClick={handleSaveRecord}
            disabled={isSaving || !toothDescription}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 sm:py-5 rounded-xl sm:rounded-[1.5rem] transition-all shadow-xl shadow-blue-100 disabled:opacity-50 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] cursor-pointer text-xs sm:text-sm"
          >
            {isSaving && <Loader2 className="w-5 h-5 animate-spin" />}
            {editingRecordId ? <Save className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            {editingRecordId ? "SALVAR ALTERAÇÕES" : "ADICIONAR AO PRONTUÁRIO"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
