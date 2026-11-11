"use client";

import { useState, useEffect } from "react";
import { Plus, Search, FileText, DollarSign, Calendar, User, Clock, ChevronRight, Loader2, Info } from "lucide-react";
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

interface Budget {
  id: string;
  patientId: string;
  description: string;
  value: number;
  createdAt: string;
}

export default function AdminBudgetsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [patientSearch, setPatientSearch] = useState("");
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [loadingBudgets, setLoadingBudgets] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    patientId: "",
    description: "",
    value: "",
  });

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

  const fetchBudgetsForPatient = async (patientId: string) => {
    setLoadingBudgets(true);
    try {
      const res = await fetch(`/api/budgets?patientId=${patientId}`);
      const data = await res.json();
      setBudgets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching budgets:", error);
    } finally {
      setLoadingBudgets(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      fetchBudgetsForPatient(selectedPatient.id);
    } else {
      setBudgets([]);
    }
  }, [selectedPatient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.patientId || !formData.description || !formData.value) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/budgets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: formData.patientId,
          description: formData.description,
          value: parseFloat(formData.value.replace(",", ".")),
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ patientId: "", description: "", value: "" });
        
        // Refresh budgets if the current selected patient was the one updated
        if (selectedPatient && selectedPatient.id === formData.patientId) {
          fetchBudgetsForPatient(selectedPatient.id);
        } else {
          const updatedPatient = patients.find(p => p.id === formData.patientId);
          if (updatedPatient) {
            setSelectedPatient(updatedPatient);
          }
        }
      } else {
        const errData = await res.json();
        alert(`Erro: ${errData.error || "Não foi possível gerar o orçamento"}`);
      }
    } catch (error) {
      console.error("Error creating budget:", error);
      alert("Erro de conexão ao gerar o orçamento.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtering patients by search input
  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(patientSearch.toLowerCase()) ||
    patient.phone.includes(patientSearch)
  );

  const totalValue = budgets.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-col gap-1 sm:gap-2">
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">Gestão de Orçamentos</h2>
          <p className="text-slate-500 text-xs sm:text-base font-medium tracking-tight">Crie orçamentos para pacientes e envie notificações instantâneas.</p>
        </div>
        <button
          onClick={() => {
            setFormData({
              patientId: selectedPatient?.id || "",
              description: "",
              value: "",
            });
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-[1.5rem] font-black flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-100 hover:scale-105 active:scale-95 w-full sm:w-auto text-xs sm:text-sm cursor-pointer"
        >
          <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
          Gerar Orçamento
        </button>
      </div>

      {/* Main Dual-Pane Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
        
        {/* Left Side: Patients Selector */}
        <div className="lg:col-span-4 bg-white rounded-2xl sm:rounded-[2.5rem] border border-slate-100 shadow-premium p-4 sm:p-6 space-y-4 sm:space-y-6">
          <div className="space-y-1 sm:space-y-2">
            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">Pacientes</h3>
            <p className="text-xs text-slate-400 font-medium">Selecione um paciente para ver o histórico</p>
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

        {/* Right Side: Budget History */}
        <div className="lg:col-span-8 space-y-4 sm:space-y-6">
          {selectedPatient ? (
            <>
              {/* Patient Profile & Stats Summary */}
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6 sm:md:pl-8">
                  <div className="bg-slate-50/50 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-100">
                    <p className="text-[9px] sm:text-[10px] font-black text-slate-400 uppercase tracking-wider">Total de Orçamentos</p>
                    <p className="text-xl sm:text-2xl font-black text-slate-800 mt-1">{budgets.length}</p>
                  </div>
                  <div className="bg-emerald-50/30 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-emerald-50">
                    <p className="text-[9px] sm:text-[10px] font-black text-emerald-600 uppercase tracking-wider">Valor Acumulado</p>
                    <p className="text-xl sm:text-2xl font-black text-emerald-700 mt-1">
                      {totalValue.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Budget History List */}
              <div className="bg-white rounded-2xl sm:rounded-[2.5rem] border border-slate-100 shadow-premium p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 sm:space-y-1">
                    <h4 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">Histórico de Orçamentos</h4>
                    <p className="text-xs text-slate-400 font-medium">Orçamentos gerados para o paciente selecionado</p>
                  </div>
                </div>

                {loadingBudgets ? (
                  <div className="py-16 text-center text-slate-400">
                    <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin mx-auto text-blue-500 mb-3 sm:mb-4" />
                    <p className="font-bold text-xs sm:text-sm">Carregando histórico...</p>
                  </div>
                ) : budgets.length === 0 ? (
                  <div className="py-12 sm:py-20 text-center border-2 border-dashed border-slate-100 rounded-2xl sm:rounded-3xl p-4">
                    <FileText className="w-10 h-10 sm:w-12 sm:h-12 text-slate-200 mx-auto mb-3 sm:mb-4" />
                    <h5 className="font-black text-slate-400 text-base sm:text-lg">Nenhum orçamento gerado</h5>
                    <p className="text-slate-300 text-xs mt-1">Clique em "Gerar Orçamento" para lançar um novo orçamento para este paciente.</p>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {budgets.map((budget) => (
                      <div
                        key={budget.id}
                        className="p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-100 bg-white hover:bg-slate-50/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 hover:shadow-sm"
                      >
                        <div className="space-y-2 max-w-xl">
                          <p className="font-bold text-slate-700 text-sm sm:text-base leading-relaxed break-words">
                            {budget.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-[10px] sm:text-xs text-slate-400 font-bold">
                            <span className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-full text-slate-500 uppercase tracking-tight">
                              <Calendar className="w-3.5 h-3.5" />
                              {new Date(budget.createdAt).toLocaleDateString("pt-BR")}
                            </span>
                            <span className="flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-full text-slate-500 uppercase tracking-tight">
                              <Clock className="w-3.5 h-3.5" />
                              {new Date(budget.createdAt).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3 self-end md:self-auto">
                          <div className="bg-emerald-50 text-emerald-700 px-3.5 sm:px-5 py-2 sm:py-3 rounded-xl border border-emerald-100 font-black text-base sm:text-lg shadow-sm">
                            {budget.value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                          </div>
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
                <User className="w-6 h-6 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-base sm:text-xl font-black text-slate-800">Nenhum Paciente Selecionado</h3>
              <p className="text-slate-400 text-xs sm:text-sm max-w-xs mt-1">Selecione um paciente na lista acima para visualizar suas informações e histórico de orçamentos.</p>
            </div>
          )}
        </div>

      </div>

      {/* Generate Budget Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Gerar Novo Orçamento"
      >
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {/* Patient Selection Dropdown */}
          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Selecione o Paciente</label>
            <select
              required
              value={formData.patientId}
              onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
              className="w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 sm:focus:ring-8 focus:ring-blue-50 transition-all outline-none font-bold text-slate-600 appearance-none cursor-pointer text-xs sm:text-sm"
            >
              <option value="" disabled>-- Selecione um Paciente --</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name}
                </option>
              ))}
            </select>
          </div>

          {/* Description of Problem / Treatment */}
          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Descrição do Problema / Tratamento</label>
            <textarea
              required
              rows={4}
              placeholder="Descreva o problema dentário, tratamento necessário ou procedimentos planejados..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 sm:px-5 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 sm:focus:ring-8 focus:ring-blue-50 transition-all outline-none font-bold text-slate-600 resize-none leading-relaxed placeholder:text-slate-400 text-xs sm:text-sm"
            />
          </div>

          {/* Value / Price */}
          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Valor do Orçamento (R$)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none">
                <span className="text-slate-400 font-black text-sm">R$</span>
              </div>
              <input
                required
                type="text"
                placeholder="0,00"
                value={formData.value}
                onChange={(e) => {
                  let val = e.target.value.replace(/[^0-9.,]/g, "");
                  setFormData({ ...formData, value: val });
                }}
                className="w-full pl-11 sm:pl-12 pr-4 sm:pr-5 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 sm:focus:ring-8 focus:ring-blue-50 transition-all outline-none font-black text-slate-700 text-base sm:text-lg"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3.5 sm:py-4 rounded-xl sm:rounded-2xl transition-all shadow-xl shadow-blue-100 disabled:opacity-50 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] text-xs sm:text-sm cursor-pointer"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <DollarSign className="w-5 h-5" />}
            GERAR ORÇAMENTO
          </button>
        </form>
      </Modal>
    </div>
  );
}
