"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import {
  Plus,
  Calendar as CalendarIcon,
  Clock,
  User,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  Edit,
  Trash2,
  Save,
  Filter,
  Check,
  ExternalLink,
  Phone,
  Activity,
  CheckCircle2,
  Clock3,
} from "lucide-react";
import Modal from "@/components/Modal";

interface Patient {
  id: string;
  name: string;
  phone?: string;
}

interface Dentist {
  id: string;
  name: string;
  role: string;
}

interface Appointment {
  id: string;
  date: string;
  procedure?: string | null;
  status?: string | null;
  patient: Patient;
  dentist?: {
    id?: string;
    name: string;
  } | null;
  dentistId?: string | null;
}

const COMMON_PROCEDURES = [
  "Avaliação Inicial / Check-up",
  "Profilaxia e Raspagem (Limpeza)",
  "Restauração em Resina Composta",
  "Tratamento de Canal (Endodontia)",
  "Extração Dentária (Exodontia)",
  "Clareamento Dental",
  "Manutenção de Aparelho Ortodôntico",
  "Prótese / Coroa Dentária",
  "Implante Dentário",
  "Urgência Odontológica",
];

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  CONFIRMADO: {
    label: "Confirmado",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  AGENDADO: {
    label: "Agendado",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  EM_ATENDIMENTO: {
    label: "Em Atendimento",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
  },
  CONCLUIDO: {
    label: "Concluído",
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-200",
  },
  CANCELADO: {
    label: "Cancelado",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
  },
};

export default function AgendaPage() {
  // Dados fundamentais
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; role: string } | null>(null);
  const [loading, setLoading] = useState(true);

  // Estados de navegação do calendário
  const [currentMonth, setCurrentMonth] = useState<Date>(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

  // Filtros de Administrador (IDs dos dentistas selecionados)
  const [selectedDentistIds, setSelectedDentistIds] = useState<string[]>([]);

  // Modal de criação/edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingAppointmentId, setEditingAppointmentId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    patientId: "",
    dentistId: "",
    procedure: "",
    status: "CONFIRMADO",
    date: "",
    time: "09:00",
  });

  // 1. Carrega dados iniciais do usuário, pacientes e dentistas
  const initData = async () => {
    try {
      const [patRes, denRes, meRes] = await Promise.all([
        fetch("/api/patients"),
        fetch("/api/users"),
        fetch("/api/auth/me"),
      ]);

      const patData = await patRes.json();
      const denData = await denRes.json();
      const meData = await meRes.json();

      setPatients(Array.isArray(patData) ? patData : []);
      setDentists(Array.isArray(denData) ? denData.filter((u: Dentist) => u.role === "DENTISTA") : []);
      if (meData && meData.id) {
        setCurrentUser(meData);
      }
    } catch (error) {
      console.error("Erro ao carregar dados do usuário:", error);
    }
  };

  useEffect(() => {
    initData();
  }, []);

  // 2. Busca consultas do mês/dentistas para alimentar o calendário e a lista
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    try {
      // Buscar todas as consultas do mês atual para preencher os indicadores do calendário
      const year = currentMonth.getFullYear();
      const month = String(currentMonth.getMonth() + 1).padStart(2, "0");
      let url = `/api/appointments?month=${year}-${month}`;

      if (currentUser?.role === "ADMIN" && selectedDentistIds.length > 0) {
        url += `&dentistIds=${selectedDentistIds.join(",")}`;
      }

      const res = await fetch(url);
      const data = await res.json();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao buscar agendamentos:", error);
    } finally {
      setLoading(false);
    }
  }, [currentMonth, currentUser, selectedDentistIds]);

  useEffect(() => {
    if (currentUser) {
      fetchAppointments();
    }
  }, [fetchAppointments, currentUser]);

  // Consultas filtradas para o dia selecionado
  const appointmentsForSelectedDate = useMemo(() => {
    const selYear = selectedDate.getFullYear();
    const selMonth = selectedDate.getMonth();
    const selDay = selectedDate.getDate();

    return appointments
      .filter((appt) => {
        const apptDate = new Date(appt.date);
        return (
          apptDate.getFullYear() === selYear &&
          apptDate.getMonth() === selMonth &&
          apptDate.getDate() === selDay
        );
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [appointments, selectedDate]);

  // Mapa de contagem de consultas por dia no mês para os indicadores (dots) do calendário
  const appointmentsCountByDay = useMemo(() => {
    const map = new Map<number, number>();
    appointments.forEach((appt) => {
      const d = new Date(appt.date);
      if (
        d.getFullYear() === currentMonth.getFullYear() &&
        d.getMonth() === currentMonth.getMonth()
      ) {
        const day = d.getDate();
        map.set(day, (map.get(day) || 0) + 1);
      }
    });
    return map;
  }, [appointments, currentMonth]);

  // Matriz do Calendário
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 = Dom, 1 = Seg...
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    const prevMonthTotalDays = new Date(year, month, 0).getDate();

    const days: { day: number; isCurrentMonth: boolean; date: Date }[] = [];

    // Dias do mês anterior para completar a primeira semana
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const d = prevMonthTotalDays - i;
      days.push({
        day: d,
        isCurrentMonth: false,
        date: new Date(year, month - 1, d),
      });
    }

    // Dias do mês atual
    for (let d = 1; d <= totalDaysInMonth; d++) {
      days.push({
        day: d,
        isCurrentMonth: true,
        date: new Date(year, month, d),
      });
    }

    // Dias do próximo mês para fechar a grade (múltiplo de 7)
    const remainingDays = 7 - (days.length % 7);
    if (remainingDays < 7) {
      for (let d = 1; d <= remainingDays; d++) {
        days.push({
          day: d,
          isCurrentMonth: false,
          date: new Date(year, month + 1, d),
        });
      }
    }

    return days;
  }, [currentMonth]);

  // Checadores de data
  const isToday = (date: Date) => {
    const now = new Date();
    return (
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  };

  const isSelected = (date: Date) => {
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  // Navegação
  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleGoToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today);
  };

  const handleSelectDay = (cell: { day: number; isCurrentMonth: boolean; date: Date }) => {
    setSelectedDate(cell.date);
    if (!cell.isCurrentMonth) {
      setCurrentMonth(new Date(cell.date.getFullYear(), cell.date.getMonth(), 1));
    }
  };

  // Toggle filtro de dentista (Admin)
  const toggleDentistFilter = (id: string) => {
    setSelectedDentistIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleOpenCreateModal = () => {
    const dateFormatted = `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, "0")}-${String(selectedDate.getDate()).padStart(2, "0")}`;
    setEditingAppointmentId(null);
    setFormData({
      patientId: "",
      dentistId: currentUser?.role === "DENTISTA" ? currentUser.id : (selectedDentistIds[0] || ""),
      procedure: "Avaliação Inicial / Check-up",
      status: "CONFIRMADO",
      date: dateFormatted,
      time: "09:00",
    });
    setIsModalOpen(true);
  };

  const handleEdit = (appt: Appointment) => {
    const date = new Date(appt.date);
    const dateFormatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const timeFormatted = `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;

    setEditingAppointmentId(appt.id);
    setFormData({
      patientId: appt.patient.id,
      dentistId: appt.dentistId || "",
      procedure: appt.procedure || "",
      status: appt.status || "CONFIRMADO",
      date: dateFormatted,
      time: timeFormatted,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja desmarcar ou excluir esta consulta?")) return;

    try {
      const res = await fetch(`/api/appointments/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchAppointments();
      }
    } catch (error) {
      console.error("Erro ao excluir agendamento:", error);
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
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: formData.patientId,
          dentistId: formData.dentistId || undefined,
          procedure: formData.procedure || undefined,
          status: formData.status || "CONFIRMADO",
          date: fullDate.toISOString(),
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        setEditingAppointmentId(null);
        fetchAppointments();
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Erro ao salvar consulta");
      }
    } catch (error) {
      console.error("Erro ao salvar consulta:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-10">
      {/* CABEÇALHO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
        <div className="space-y-1 sm:space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">Agenda</h2>
            {currentUser?.role === "ADMIN" ? (
              <span className="px-3 py-1 bg-purple-50 text-purple-700 text-[10px] sm:text-xs font-black rounded-full uppercase tracking-wider border border-purple-100">
                Visão Macro Geral
              </span>
            ) : (
              <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] sm:text-xs font-black rounded-full uppercase tracking-wider border border-blue-100">
                Agenda Individual
              </span>
            )}
          </div>
          <p className="text-slate-500 text-xs sm:text-sm font-medium">
            {currentUser?.role === "ADMIN"
              ? "Gerencie as consultas e visualize o fluxo clínico de todos os dentistas."
              : `Bem-vindo(a), ${currentUser?.name || "Dr(a)"}. Exibindo apenas suas consultas e procedimentos.`}
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-3.5 sm:py-4 rounded-xl sm:rounded-[1.5rem] font-black flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-100 hover:scale-105 active:scale-95 cursor-pointer self-start sm:self-auto text-xs sm:text-sm w-full sm:w-auto"
        >
          <Plus className="w-5 h-5 stroke-[3]" />
          Agendar Consulta
        </button>
      </div>

      {/* BARRA DE FILTROS EXCLUSIVA DO ADMINISTRADOR */}
      {currentUser?.role === "ADMIN" && (
        <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] border border-slate-100 shadow-premium flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="flex items-center gap-2 text-slate-400 font-black text-[10px] sm:text-xs uppercase tracking-wider mr-1 sm:mr-2">
              <Filter className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
              Filtrar por Dentista:
            </div>

            <button
              onClick={() => setSelectedDentistIds([])}
              className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-black transition-all flex items-center gap-2 ${
                selectedDentistIds.length === 0
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-100 scale-105"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100"
              }`}
            >
              {selectedDentistIds.length === 0 && <Check className="w-3.5 h-3.5 stroke-[3]" />}
              Todos os Dentistas ({dentists.length})
            </button>

            {dentists.map((d) => {
              const active = selectedDentistIds.includes(d.id);
              return (
                <button
                  key={d.id}
                  onClick={() => toggleDentistFilter(d.id)}
                  className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-black transition-all flex items-center gap-2 ${
                    active
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-100 scale-105"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-100"
                  }`}
                >
                  <Stethoscope className={`w-3.5 h-3.5 ${active ? "text-white" : "text-blue-500"}`} />
                  {d.name}
                  {active && <Check className="w-3.5 h-3.5 stroke-[3] ml-1" />}
                </button>
              );
            })}
          </div>

          {selectedDentistIds.length > 0 && (
            <button
              onClick={() => setSelectedDentistIds([])}
              className="text-xs font-black text-slate-400 hover:text-rose-600 transition-colors self-end md:self-auto"
            >
              Limpar Filtro
            </button>
          )}
        </div>
      )}

      {/* GRADE PRINCIPAL: LISTA DE CONSULTAS DO DIA + CALENDÁRIO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
        {/* LISTAGEM DO DIA SELECIONADO */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-[2.5rem] border border-slate-100 shadow-premium flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black shrink-0">
                <Clock3 className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-400">
                  Consultas do Dia
                </span>
                <h3 className="text-base sm:text-xl font-black text-slate-900 tracking-tight capitalize">
                  {selectedDate.toLocaleDateString("pt-BR", {
                    weekday: "long",
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <span className="px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-50 text-slate-600 text-[10px] sm:text-xs font-black rounded-xl border border-slate-100">
                {appointmentsForSelectedDate.length} agendamento(s)
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl sm:rounded-[3rem] border border-slate-100 shadow-premium overflow-hidden">
            {loading ? (
              <div className="p-12 sm:p-20 text-center text-slate-400">
                <Loader2 className="w-8 h-8 sm:w-10 sm:h-10 animate-spin mx-auto mb-3 sm:mb-4 text-blue-500" />
                <p className="font-bold text-xs sm:text-sm tracking-tight text-slate-500">Sincronizando agenda...</p>
              </div>
            ) : appointmentsForSelectedDate.length === 0 ? (
              <div className="p-8 sm:p-20 text-center space-y-4">
                <div className="bg-slate-50 w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center mx-auto text-slate-300">
                  <CalendarIcon className="w-8 h-8 sm:w-10 sm:h-10" />
                </div>
                <div>
                  <p className="text-slate-600 font-black text-base sm:text-lg tracking-tight">
                    Nenhuma consulta para este dia.
                  </p>
                  <p className="text-slate-400 text-xs font-medium mt-1">
                    {currentUser?.role === "ADMIN" && selectedDentistIds.length > 0
                      ? "Nenhum agendamento encontrado para os dentistas filtrados nesta data."
                      : "Sua agenda está livre neste dia."}
                  </p>
                </div>
                <button
                  onClick={handleOpenCreateModal}
                  className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl text-xs font-black transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Agendar para este dia
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {appointmentsForSelectedDate.map((appointment) => {
                  const date = new Date(appointment.date);
                  const statusInfo = STATUS_CONFIG[appointment.status || "CONFIRMADO"] || STATUS_CONFIG.CONFIRMADO;

                  return (
                    <div
                      key={appointment.id}
                      className="p-4 sm:p-6 md:p-8 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 hover:bg-slate-50/60 transition-all group"
                    >
                      {/* Horário */}
                      <div className="flex sm:flex-col items-center justify-between sm:justify-center bg-slate-50 group-hover:bg-blue-600 group-hover:text-white px-4 py-2 sm:px-0 sm:py-0 w-full sm:w-20 sm:h-20 rounded-xl sm:rounded-[1.75rem] border border-slate-100 group-hover:border-blue-600 shadow-sm transition-all duration-300 shrink-0">
                        <span className="text-base sm:text-xl font-black text-slate-900 group-hover:text-white transition-colors tracking-tighter">
                          {date.getHours().toString().padStart(2, "0")}:{date.getMinutes().toString().padStart(2, "0")}
                        </span>
                        <span className="text-[8px] font-black text-blue-600 group-hover:text-blue-100 uppercase tracking-widest sm:mt-0.5">
                          HORÁRIO
                        </span>
                      </div>

                      {/* Informações da Consulta */}
                      <div className="flex-1 min-w-0 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`px-2.5 sm:px-3 py-0.5 sm:py-1 text-[9px] sm:text-[10px] font-black rounded-full uppercase tracking-wider border shadow-sm ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
                          >
                            {statusInfo.label}
                          </span>
                          {appointment.patient.phone && (
                            <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-300" />
                              {appointment.patient.phone}
                            </span>
                          )}
                        </div>

                        <h4 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors tracking-tight truncate">
                          {appointment.patient.name}
                        </h4>

                        <div className="flex items-center gap-4 flex-wrap text-xs font-bold text-slate-500">
                          {/* Procedimento */}
                          <div className="flex items-center gap-1.5 text-blue-600 bg-blue-50/70 px-3 py-1 rounded-xl">
                            <Activity className="w-3.5 h-3.5" />
                            <span>{appointment.procedure || "Consulta Odontológica Geral"}</span>
                          </div>

                          {/* Dentista Responsável (Visível sempre, especialmente para Admin) */}
                          <div className="flex items-center gap-1.5 text-slate-500 bg-slate-100/60 px-3 py-1 rounded-xl">
                            <Stethoscope className="w-3.5 h-3.5 text-slate-400" />
                            <span>{appointment.dentist?.name || "Dentista da Clínica"}</span>
                          </div>
                        </div>
                      </div>

                      {/* Ações */}
                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <Link
                          href={`/prontuario?patientId=${appointment.patient.id}`}
                          title="Abrir Prontuário"
                          className="px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 text-xs font-black flex items-center gap-1.5 border border-slate-100 transition-all"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          Prontuário
                        </Link>

                        <button
                          onClick={() => handleEdit(appointment)}
                          title="Editar Consulta"
                          className="p-2.5 rounded-xl hover:bg-blue-600 hover:text-white text-slate-400 transition-all border border-slate-100 shadow-sm cursor-pointer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(appointment.id)}
                          title="Desmarcar Consulta"
                          className="p-2.5 rounded-xl hover:bg-rose-600 hover:text-white text-slate-400 transition-all border border-slate-100 shadow-sm cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* CALENDÁRIO INTERATIVO */}
        <div className="space-y-6">
          <div className="bg-white p-4 sm:p-6 md:p-8 rounded-2xl sm:rounded-[3rem] border border-slate-100 shadow-premium space-y-4 sm:space-y-6">
            {/* Controles do Mês */}
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Navegação</span>
                <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight capitalize">
                  {currentMonth.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                </h3>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrevMonth}
                  title="Mês anterior"
                  className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-100 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                </button>
                <button
                  onClick={handleGoToToday}
                  title="Ir para hoje"
                  className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 text-[10px] sm:text-xs font-black rounded-xl transition-all cursor-pointer"
                >
                  Hoje
                </button>
                <button
                  onClick={handleNextMonth}
                  title="Próximo mês"
                  className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center hover:bg-slate-50 rounded-xl transition-all border border-transparent hover:border-slate-100 cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                </button>
              </div>
            </div>

            {/* Cabeçalho dos Dias da Semana */}
            <div className="grid grid-cols-7 text-center">
              {["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"].map((d) => (
                <span key={d} className="text-[8px] sm:text-[10px] font-black text-slate-300 tracking-widest py-1">
                  {d}
                </span>
              ))}
            </div>

            {/* Matriz dos Dias do Mês */}
            <div className="grid grid-cols-7 gap-y-1.5 sm:gap-y-2 gap-x-1">
              {calendarDays.map((cell, i) => {
                const active = isSelected(cell.date);
                const today = isToday(cell.date);
                const count = cell.isCurrentMonth ? appointmentsCountByDay.get(cell.day) || 0 : 0;

                return (
                  <div key={i} className="flex flex-col items-center">
                    <button
                      onClick={() => handleSelectDay(cell)}
                      className={`w-8 h-8 sm:w-10 sm:h-10 text-xs sm:text-sm font-black rounded-xl sm:rounded-2xl transition-all relative flex flex-col items-center justify-center group cursor-pointer ${
                        active
                          ? "bg-blue-600 text-white shadow-xl shadow-blue-200 scale-105"
                          : today
                          ? "border-2 border-blue-500 text-blue-600 font-extrabold hover:bg-blue-50"
                          : cell.isCurrentMonth
                          ? "text-slate-700 hover:bg-slate-50 hover:text-blue-600"
                          : "text-slate-300 hover:text-slate-500 hover:bg-slate-50/50"
                      }`}
                    >
                      <span>{cell.day}</span>

                      {/* Dot Indicador de Consultas */}
                      {count > 0 && (
                        <span
                          className={`absolute bottom-1 w-1.5 h-1.5 rounded-full transition-colors ${
                            active ? "bg-white" : "bg-blue-500"
                          }`}
                        />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Legenda */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-slate-400">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full border border-blue-500"></span>
                <span>Hoje</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                <span>Com consultas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-md bg-blue-600"></span>
                <span>Selecionado</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE AGENDAR / EDITAR CONSULTA */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingAppointmentId ? "Editar Agendamento" : "Agendar Nova Consulta"}
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Paciente */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
              Paciente <span className="text-rose-500">*</span>
            </label>
            <select
              required
              className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-8 focus:ring-blue-50 transition-all outline-none font-bold text-slate-700"
              value={formData.patientId}
              onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
            >
              <option value="">Selecione um paciente...</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} {p.phone ? `(${p.phone})` : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Procedimento */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
              Procedimento / Motivo
            </label>
            <input
              type="text"
              list="procedures-list"
              placeholder="Ex: Avaliação Inicial, Restauração..."
              className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-8 focus:ring-blue-50 transition-all outline-none font-bold text-slate-700"
              value={formData.procedure}
              onChange={(e) => setFormData({ ...formData, procedure: e.target.value })}
            />
            <datalist id="procedures-list">
              {COMMON_PROCEDURES.map((proc) => (
                <option key={proc} value={proc} />
              ))}
            </datalist>
          </div>

          {/* Dentista */}
          {currentUser?.role === "DENTISTA" ? (
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                Dentista Responsável
              </label>
              <div className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-100 font-black text-slate-700 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-blue-600" />
                {currentUser.name} (Você)
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                Dentista Responsável
              </label>
              <select
                className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-8 focus:ring-blue-50 transition-all outline-none font-bold text-slate-700"
                value={formData.dentistId}
                onChange={(e) => setFormData({ ...formData, dentistId: e.target.value })}
              >
                <option value="">Qualquer dentista disponível</option>
                {dentists.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Status */}
          <div className="space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
              Status da Consulta
            </label>
            <select
              className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-8 focus:ring-blue-50 transition-all outline-none font-bold text-slate-700"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="CONFIRMADO">Confirmado</option>
              <option value="AGENDADO">Agendado (Aguardando confirmação)</option>
              <option value="EM_ATENDIMENTO">Em Atendimento</option>
              <option value="CONCLUIDO">Concluído</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>

          {/* Data e Horário */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                Data <span className="text-rose-500">*</span>
              </label>
              <input
                required
                type="date"
                className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-8 focus:ring-blue-50 transition-all outline-none font-bold text-slate-700"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
                Horário <span className="text-rose-500">*</span>
              </label>
              <input
                required
                type="time"
                className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-8 focus:ring-blue-50 transition-all outline-none font-bold text-slate-700"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || !formData.patientId || !formData.date || !formData.time}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-5 rounded-2xl shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : editingAppointmentId ? (
              <Save className="w-5 h-5" />
            ) : (
              <CalendarIcon className="w-5 h-5" />
            )}
            {editingAppointmentId ? "SALVAR ALTERAÇÕES" : "CONFIRMAR AGENDAMENTO"}
          </button>
        </form>
      </Modal>
    </div>
  );
}
