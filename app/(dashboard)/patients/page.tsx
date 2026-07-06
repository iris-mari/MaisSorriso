"use client";

import { useState, useEffect } from "react";
import { Plus, Search, User, Phone, Calendar as CalendarIcon, Loader2, Edit, Trash2, Save } from "lucide-react";

import Modal from "@/components/Modal";

interface Patient {
  id: string;
  name: string;
  dateOfBirth: string;
  phone: string;
  createdAt: string;
  user?: {
    cpf: string;
    email: string | null;
  };
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingPatientId, setEditingPatientId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    cpf: "",
    dateOfBirth: "",
    phone: "",
    email: "",
  });

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/patients?myOnly=true");
      const data = await res.json();
      setPatients(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching patients:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleEdit = (patient: Patient) => {
    setEditingPatientId(patient.id);

    let formattedCpf = patient.user?.cpf || "";
    if (formattedCpf) {
      formattedCpf = formattedCpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
    }

    setFormData({
      name: patient.name,
      cpf: formattedCpf,
      dateOfBirth: patient.dateOfBirth ? new Date(patient.dateOfBirth).toISOString().split('T')[0] : "",
      phone: patient.phone,
      email: patient.user?.email || "",
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este paciente e todos os seus registros?")) return;
    
    try {
      const res = await fetch(`/api/patients/${id}`, { method: "DELETE" });
      if (res.ok) fetchPatients();
    } catch (error) {
      console.error("Error deleting patient:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const url = editingPatientId ? `/api/patients/${editingPatientId}` : "/api/patients";
      const method = editingPatientId ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setEditingPatientId(null);
        setFormData({ name: "", cpf: "", dateOfBirth: "", phone: "", email: "" });
        fetchPatients();
      }
    } catch (error) {
      console.error("Error saving patient:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Pacientes</h2>
          <p className="text-slate-500 font-medium tracking-tight">Gerencie o cadastro e histórico de seus pacientes.</p>
        </div>
        <button 
          onClick={() => {
            setEditingPatientId(null);
            setFormData({ name: "", cpf: "", dateOfBirth: "", phone: "", email: "" });
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-[1.5rem] font-black flex items-center gap-3 transition-all shadow-xl shadow-blue-100 hover:scale-105 active:scale-95"
        >
          <Plus className="w-6 h-6" />
          Novo Paciente
        </button>
      </div>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-premium overflow-hidden">
        <div className="p-8 border-b border-slate-50 flex items-center gap-6 bg-slate-50/30">
          <div className="flex items-center gap-4 bg-white px-6 py-4 rounded-2xl border border-slate-200/60 flex-1 max-w-lg shadow-sm focus-within:ring-4 focus-within:ring-blue-50 transition-all">
            <Search className="w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Pesquisar por nome ou telefone..." 
              className="bg-transparent border-none outline-none text-slate-600 placeholder:text-slate-400 w-full text-sm font-bold"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded-full">Total: {patients.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto px-4 pb-4">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead>
              <tr>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Iniciais</th>
                <th className="px-4 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Paciente</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Data ou Nasc.</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Telefone</th>
                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-400">
                    <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-blue-500" />
                    <p className="font-bold text-sm tracking-tight">Sincronizando dados...</p>
                  </td>
                </tr>
              ) : patients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-10 h-10 text-slate-200" />
                    </div>
                    <p className="text-slate-400 font-bold text-lg">Nenhum paciente encontrado.</p>
                    <p className="text-slate-300 text-xs font-medium mt-1">Experimente mudar o termo de busca ou cadastrar um novo.</p>
                  </td>
                </tr>
              ) : (
                patients.map((patient) => (
                  <tr key={patient.id} className="group cursor-pointer">
                    <td className="bg-white group-hover:bg-slate-50 py-5 pl-8 text-center rounded-l-[1.5rem] transition-all">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all mx-auto">
                        {patient.name.charAt(0)}
                      </div>
                    </td>
                    <td className="bg-white group-hover:bg-slate-50 py-5 px-4 transition-all">
                      <p className="font-black text-slate-900 text-lg tracking-tight group-hover:text-blue-600 transition-colors">
                        {patient.name}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">ID: #{patient.id.slice(0, 8)}</p>
                    </td>
                    <td className="bg-white group-hover:bg-slate-50 py-5 px-8 text-center transition-all">
                      <span className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-black">
                        {patient.dateOfBirth ? new Date(patient.dateOfBirth).toLocaleDateString() : 'N/A'}
                      </span>
                    </td>
                    <td className="bg-white group-hover:bg-slate-50 py-5 px-8 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                          <Phone className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-slate-600 tracking-tight">{patient.phone}</span>
                      </div>
                    </td>
                    <td className="bg-white group-hover:bg-slate-50 py-5 pr-8 text-right rounded-r-[1.5rem] transition-all">
                      <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(patient)}
                          className="p-3 rounded-xl hover:bg-blue-600 hover:text-white text-slate-400 transition-all border border-slate-100 shadow-sm"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(patient.id)}
                          className="p-3 rounded-xl hover:bg-red-600 hover:text-white text-slate-400 transition-all border border-slate-100 shadow-sm"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>


      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingPatientId ? "Editar Paciente" : "Cadastrar Novo Paciente"}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
            <input 
              required
              type="text" 
              className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-8 focus:ring-blue-50 transition-all outline-none font-bold text-slate-600"
              placeholder="Ex: João Silva"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">CPF</label>
              <input 
                required
                type="text" 
                className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-8 focus:ring-blue-50 transition-all outline-none font-bold text-slate-600"
                placeholder="000.000.000-00"
                value={formData.cpf}
                onChange={(e) => {
                  let val = e.target.value.replace(/\D/g, "");
                  if (val.length > 11) val = val.slice(0, 11);
                  val = val.replace(/(\d{3})(\d)/, "$1.$2");
                  val = val.replace(/(\d{3})(\d)/, "$1.$2");
                  val = val.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
                  setFormData({ ...formData, cpf: val });
                }}
                disabled={!!editingPatientId} // Can't easily edit CPF without extra logic
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">E-mail (opcional)</label>
              <input 
                type="email" 
                className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-8 focus:ring-blue-50 transition-all outline-none font-bold text-slate-600"
                placeholder="exemplo@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                disabled={!!editingPatientId}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Data de Nasc.</label>
              <input 
                required
                type="date" 
                className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-8 focus:ring-blue-50 transition-all outline-none font-bold text-slate-600"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Telefone</label>
              <input 
                required
                type="tel" 
                className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-8 focus:ring-blue-50 transition-all outline-none font-bold text-slate-600"
                placeholder="(00) 00000-0000"
                value={formData.phone}
                onChange={(e) => {
                  let val = e.target.value.replace(/\D/g, "");
                  if (val.length > 11) val = val.slice(0, 11);
                  val = val.replace(/^(\d{2})(\d)/g, "($1) $2");
                  val = val.replace(/(\d)(\d{4})$/, "$1-$2");
                  setFormData({ ...formData, phone: val });
                }}
              />
            </div>
          </div>
          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-blue-100 disabled:opacity-50 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98]"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {editingPatientId ? "SALVAR ALTERAÇÕES" : "CADASTRAR PACIENTE"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
