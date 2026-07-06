"use client";

import { useState, useEffect } from "react";
import { Plus, Calendar as CalendarIcon, Clock, User, Loader2, ChevronLeft, ChevronRight, Stethoscope, Edit, Trash2, Save } from "lucide-react";
import Modal from "@/components/Modal";

interface Patient {
  id: string;
  name: string;
}

interface Dentist {
  id: string;
  name: string;
  role: string;
}

interface Appointment {
  id: string;
  date: string;
  patient: Patient;
  dentist?: {
    id?: string;
    name: string;
  };
  dentistId?: string;
}

export default function AgendaPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; role: string } | null>(null);

  const [formData, setFormData] = useState({
    patientId: "",
    dentistId: "",
    date: "",
    time: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appRes, patRes, denRes, meRes] = await Promise.all([
        fetch("/api/appointments"),
        fetch("/api/patients"),
        fetch("/api/users"),
        fetch("/api/auth/me")
      ]);
      const appData = await appRes.json();
      const patData = await patRes.json();
      const denData = await denRes.json();
      const meData = await meRes.json();
      
      setAppointments(Array.isArray(appData) ? appData : []);
      setPatients(Array.isArray(patData) ? patData : []);
      setDentists(Array.isArray(denData) ? denData.filter((u: Dentist) => u.role === "DENTISTA") : []);
      if (meData && meData.id) {
        setCurrentUser(meData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (appt: Appointment) => {
    const date = new Date(appt.date);
    setEditingAppointmentId(appt.id);
    setFormData({
      patientId: appt.patient.id,
      dentistId: appt.dentistId || "",
      date: date.toISOString().split("T")[0],
      time: `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja cancelar este agendamento?")) return;
    
    try {
      const res = await fetch(`/api/appointments/${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Error deleting appointment:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const fullDate = new Date(`${formData.date}T${formData.time}`);
      const url = editingAppointmentId ? `/api/appointments/${editingAppointmentId}` : "/api/appointments";
      const method = editingAppointmentId ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: formData.patientId,
          dentistId: formData.dentistId || undefined,
          date: fullDate.toISOString(),
        }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setEditingAppointmentId(null);
        setFormData({ patientId: "", dentistId: "", date: "", time: "" });
        fetchData();
      }
    } catch (error) {
      console.error("Error saving appointment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Agenda</h2>
          <p className="text-slate-500 font-medium tracking-tight">Visualize e organize suas consultas programadas.</p>
        </div>
        <button 
          onClick={() => {
            setEditingAppointmentId(null);
            setFormData({ 
              patientId: "", 
              dentistId: currentUser?.role === "DENTISTA" ? currentUser.id : "", 
              date: "", 
              time: "" 
            });
            setIsModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-[1.5rem] font-black flex items-center gap-3 transition-all shadow-xl shadow-blue-100 hover:scale-105 active:scale-95"
        >
          <Plus className="w-6 h-6" />
          Agendar Consulta
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-premium flex items-center justify-between mb-2">
            <div className="flex items-center gap-6">
              <button className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-100"><ChevronLeft className="w-5 h-5 text-slate-400" /></button>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Próximos Dias</h3>
              <button className="w-10 h-10 flex items-center justify-center hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-100"><ChevronRight className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="flex gap-2 bg-slate-50 p-1.5 rounded-[1.25rem] border border-slate-100/50">
              <button className="px-6 py-2 bg-white text-blue-600 rounded-xl text-xs font-black shadow-sm border border-slate-100">LISTA</button>
              <button className="px-6 py-2 hover:bg-white/50 text-slate-400 rounded-xl text-xs font-black transition-all">AGENDA</button>
            </div>
          </div>

          <div className="bg-white rounded-[3rem] border border-slate-100 shadow-premium overflow-hidden">
            {loading ? (
              <div className="p-20 text-center text-slate-400">
                <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-blue-500" />
                <p className="font-bold text-sm tracking-tight text-slate-500">Sincronizando agenda...</p>
              </div>
            ) : appointments.length === 0 ? (
              <div className="p-20 text-center">
                <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CalendarIcon className="w-10 h-10 text-slate-200" />
                </div>
                <p className="text-slate-400 font-bold text-lg tracking-tight">Nenhuma consulta agendada.</p>
                <p className="text-slate-300 text-xs font-medium mt-1">Sua agenda está livre por enquanto.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {appointments.map((appointment) => {
                  const date = new Date(appointment.date);
                  return (
                    <div key={appointment.id} className="p-8 flex items-center gap-8 hover:bg-slate-50/50 transition-all group cursor-pointer">
                      <div className="flex flex-col items-center justify-center bg-white w-24 h-24 rounded-[2rem] border border-slate-100 shadow-sm group-hover:bg-blue-600 group-hover:border-blue-700 transition-all group-hover:scale-105 duration-300">
                        <span className="text-2xl font-black text-slate-900 group-hover:text-white transition-colors tracking-tighter">
                          {date.getHours().toString().padStart(2, '0')}:{date.getMinutes().toString().padStart(2, '0')}
                        </span>
                        <span className="text-[9px] font-black text-blue-500 group-hover:text-blue-200 uppercase tracking-widest mt-1">HORÁRIO</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-emerald-100 shadow-sm">Confirmado</span>
                          <span className="text-slate-300 px-1">•</span>
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {date.toLocaleDateString("pt-BR", { day: '2-digit', month: 'short' })}
                          </span>
                        </div>
                        <h4 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight">{appointment.patient.name}</h4>
                        <div className="flex items-center gap-4 mt-2">
                           <div className="flex items-center gap-1.5 text-slate-500 font-bold">
                             <Stethoscope className="w-3.5 h-3.5 text-blue-500" />
                             <span className="text-xs">{appointment.dentist?.name || "Qualquer Dentista"}</span>
                           </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleEdit(appointment)}
                          className="p-3 rounded-xl hover:bg-blue-600 hover:text-white text-slate-400 transition-all border border-slate-100 shadow-sm"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(appointment.id)}
                          className="p-3 rounded-xl hover:bg-red-600 hover:text-white text-slate-400 transition-all border border-slate-100 shadow-sm"
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

        <div className="space-y-8">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-premium">
            <h3 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3 tracking-tight">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                <CalendarIcon className="w-5 h-5" />
              </div>
              Calendário
            </h3>
            <div className="grid grid-cols-7 gap-y-6 text-center">
              {['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SAB'].map(d => (
                <span key={d} className="text-[10px] font-black text-slate-300 tracking-widest">{d}</span>
              ))}
              {Array.from({ length: 30 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center">
                  <button 
                    className={`w-10 h-10 text-sm font-black rounded-[14px] transition-all relative group
                      ${i + 1 === 24 
                        ? 'bg-blue-600 text-white shadow-xl shadow-blue-200 scale-110' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600 hover:scale-105'}`}
                  >
                    {i + 1}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingAppointmentId ? "Editar Agendamento" : "Agendar Consulta"}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Paciente</label>
            <select 
              required
              className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-8 focus:ring-blue-50 transition-all outline-none font-bold text-slate-600"
              value={formData.patientId}
              onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
            >
              <option value="">Selecione um paciente...</option>
              {patients.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {currentUser?.role === "DENTISTA" ? (
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Dentista</label>
              <div className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 font-bold text-slate-500">
                {currentUser.name} (Você)
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Dentista (Opcional)</label>
              <select 
                className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-8 focus:ring-blue-50 transition-all outline-none font-bold text-slate-600"
                value={formData.dentistId}
                onChange={(e) => setFormData({ ...formData, dentistId: e.target.value })}
              >
                <option value="">Qualquer dentista disponível</option>
                {dentists.map(d => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Data</label>
              <input 
                required
                type="date" 
                className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-8 focus:ring-blue-50 transition-all outline-none font-bold text-slate-600"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Horário</label>
              <input 
                required
                type="time" 
                className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-8 focus:ring-blue-50 transition-all outline-none font-bold text-slate-600"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
          </div>
          <button 
            type="submit"
            disabled={isSubmitting || !formData.patientId}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingAppointmentId ? <Save className="w-5 h-5" /> : <CalendarIcon className="w-5 h-5" />)}
            {editingAppointmentId ? "SALVAR ALTERAÇÕES" : "CONFIRMAR AGENDAMENTO"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
