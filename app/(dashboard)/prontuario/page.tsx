"use client";

import { useState, useEffect, useCallback } from "react";
import { User, Stethoscope, Save, Loader2, Info, Edit, Trash2, Plus } from "lucide-react";
import DentalChart from "@/components/DentalChart";
import Modal from "@/components/Modal";

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
    <div className="space-y-12">
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Prontuário Clínico</h2>
        <p className="text-slate-500 font-medium tracking-tight">Acompanhamento detalhado e mapeamento dental interativo.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-premium space-y-8">
            <div className="flex flex-col gap-4">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-blue-500" />
                Paciente Selecionado
              </h3>
              <select 
                className="w-full px-6 py-4 rounded-2xl border border-slate-200/60 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 bg-slate-50 text-sm font-bold transition-all shadow-sm"
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
              <div className="pt-8 border-t border-slate-50 space-y-6">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Resumo Clínico</span>
                  <p className="text-sm font-bold text-slate-600">{loading ? "..." : records.length} registros encontrados</p>
                </div>
                
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-[2rem] text-white shadow-xl shadow-blue-100 relative overflow-hidden group">
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                  <h4 className="font-black text-sm flex items-center gap-2 mb-3">
                    <Info className="w-5 h-5 text-blue-200" />
                    INSTRUÇÃO
                  </h4>
                  <p className="text-xs text-blue-100 font-medium leading-relaxed">
                    Selecione um dente na arcada para registrar um novo diagnóstico ou procedimento. Você pode adicionar mais de um relato por dente.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3 space-y-12">
          {!selectedPatientId ? (
            <div className="bg-white rounded-[4rem] border border-slate-100 border-dashed p-32 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-slate-100/50">
                <Stethoscope className="w-10 h-10 text-slate-200" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Selecione um paciente</h3>
              <p className="text-slate-400 mt-3 max-w-sm font-medium tracking-tight">
                Para visualizar a arcada dentária interativa e o histórico clínico, você precisa primeiro selecionar um paciente lateralmente.
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              <div className="bg-white p-2 rounded-[4rem] border border-slate-100 shadow-premium relative transition-all duration-500">
                <div className="p-10">
                  <div className="flex items-center justify-between mb-10 border-b border-slate-50 pb-8">
                    <div className="flex flex-col gap-1">
                       <h3 className="text-2xl font-black text-slate-900 tracking-tight">Mapeamento Anatômico</h3>
                       <p className="text-slate-400 text-sm font-medium">Selecione um dente para adicionar relato</p>
                    </div>
                    <div className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-2">
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
              <div className="bg-white p-12 rounded-[4rem] border border-slate-100 shadow-premium">
                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight">Histórico do Prontuário</h3>
                  <div className="px-4 py-2 bg-slate-50 rounded-xl text-[10px] font-black text-slate-400 uppercase tracking-widest">Cronológico</div>
                </div>
                
                {loading ? (
                   <div className="py-20 text-center">
                    <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-blue-500" />
                    <p className="font-bold text-sm tracking-tight text-slate-400">Sincronizando prontuário...</p>
                  </div>
                ) : records.length === 0 ? (
                  <div className="py-10 text-center bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                    <p className="text-slate-400 font-bold italic tracking-tight">Sem registros clínicos disponíveis para este paciente.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {records.map(record => (
                      <div key={record.id} className="p-8 rounded-[2.5rem] border border-slate-100 bg-white hover:bg-slate-50/50 transition-all flex gap-8 group shadow-sm hover:shadow-md">
                        <div className="w-16 h-16 bg-blue-600 rounded-[1.5rem] flex flex-col items-center justify-center shadow-lg shadow-blue-100 group-hover:scale-105 transition-transform">
                          <span className="text-xl font-black text-white leading-none">{record.toothNumber}</span>
                          <span className="text-[8px] font-black text-blue-200 uppercase tracking-widest mt-1">DENTE</span>
                        </div>
                        <div className="flex-1 flex flex-col justify-center">
                          <p className="text-slate-900 font-black text-lg tracking-tight mb-2 group-hover:text-blue-600 transition-colors">
                            {record.description}
                          </p>
                          <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <span className="bg-slate-100 px-3 py-1 rounded-full">{new Date(record.createdAt).toLocaleDateString("pt-BR")}</span>
                            <span>{new Date(record.createdAt).toLocaleTimeString("pt-BR", {hour: '2-digit', minute:'2-digit'})}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 self-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleEdit(record)}
                            className="p-3 rounded-xl hover:bg-blue-600 hover:text-white text-slate-400 transition-all border border-slate-100 shadow-sm"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => handleDelete(record.id)}
                            className="p-3 rounded-xl hover:bg-red-600 hover:text-white text-slate-400 transition-all border border-slate-100 shadow-sm"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
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
        title={editingRecordId ? `Editar Relato - Dente ${selectedTooth}` : `Novo Relato - Dente ${selectedTooth}`}
      >
        <div className="space-y-8 p-4">
          <div className="space-y-4">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Descrição do Diagnóstico / Procedimento</label>
            <textarea 
              rows={5}
              className="w-full px-6 py-5 rounded-[2rem] border border-slate-200 outline-none focus:border-blue-500 focus:ring-8 focus:ring-blue-50 bg-slate-50 font-bold text-slate-700 placeholder:text-slate-300 transition-all text-sm leading-relaxed"
              placeholder="Ex: Cárie oclusal detectada, canal necessário, restauração em resina composta no. 4..."
              value={toothDescription}
              onChange={(e) => setToothDescription(e.target.value)}
            />
          </div>
          <button 
            onClick={handleSaveRecord}
            disabled={isSaving || !toothDescription}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-[1.5rem] transition-all shadow-xl shadow-blue-100 disabled:opacity-50 flex items-center justify-center gap-3 hover:scale-105 active:scale-95"
          >
            {isSaving && <Loader2 className="w-5 h-5 animate-spin" />}
            {editingRecordId ? <Save className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
            {editingRecordId ? "SALVAR ALTERAÇÕES" : "ADICIONAR AO PRONTUÁRIO"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
