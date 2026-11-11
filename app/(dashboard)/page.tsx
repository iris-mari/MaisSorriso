"use client";

import { 
  Users, 
  Calendar, 
  TrendingUp, 
  ArrowRight,
  Stethoscope,
  Loader2
} from "lucide-react";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Appointment {
  id: string;
  date: string;
  patient: {
    name: string;
  };
}

interface DashboardData {
  totalPatients: number;
  appointmentsToday: number;
  totalRecords: number;
  nextAppointments: Appointment[];
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("");
  const router = useRouter();

  useEffect(() => {
    // Fetch stats
    fetch("/api/dashboard/stats")
      .then(res => res.json())
      .then(setData)
      .finally(() => setLoading(false));

    // Fetch user info
    fetch("/api/auth/me")
      .then(res => res.json())
      .then(userData => {
        if (userData.role === "CLIENTE") {
          router.push("/client/appointments");
          return;
        }
        if (userData.name) setUserName(userData.name);
      });
  }, [router]);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        <p className="text-slate-400 font-bold animate-pulse uppercase tracking-widest text-xs">Carregando dados reais...</p>
      </div>
    );
  }

  const dashboardStats = [
    { name: "Total de Pacientes", value: data?.totalPatients || 0, icon: Users, color: "bg-blue-600" },
    { name: "Agendamentos Hoje", value: data?.appointmentsToday || 0, icon: Calendar, color: "bg-emerald-500" },
    { name: "Registros Clínicos", value: data?.totalRecords || 0, icon: Stethoscope, color: "bg-purple-500" },
  ];

  return (
    <div className="space-y-8 sm:space-y-12">
      <div className="flex flex-col gap-1 sm:gap-2">
        <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">Painel de Controle</h2>
        <p className="text-slate-500 text-sm sm:text-base font-medium tracking-tight">
          Olá {userName || "Doutor(a)"}, veja o resumo real da sua clínica.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
        {dashboardStats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-[2.5rem] border border-slate-100 shadow-premium hover:shadow-premium-hover transition-all duration-300 group cursor-pointer">
            <div className={`w-12 h-12 sm:w-14 sm:h-14 ${stat.color} rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-xl shadow-blue-100 group-hover:scale-110 transition-transform duration-300`}>
              <stat.icon className="text-white w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <p className="text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest">{stat.name}</p>
            <div className="flex items-end gap-2 mt-1 sm:mt-2">
              <p className="text-3xl sm:text-4xl font-black text-slate-900">{stat.value}</p>
              <span className="text-emerald-500 text-[10px] sm:text-xs font-bold mb-1 flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> Real time
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:gap-10">
        <div className="bg-white p-5 sm:p-8 md:p-10 rounded-2xl sm:rounded-[3rem] border border-slate-100 shadow-premium">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-10">
            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">Próximas Consultas</h3>
            <Link href="/agenda" className="bg-slate-50 text-blue-600 px-4 py-2.5 rounded-xl text-xs font-black hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2 self-start sm:self-auto">
              AGENDA COMPLETA <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          
          <div className="space-y-6">
            {!data?.nextAppointments || data.nextAppointments.length === 0 ? (
              <div className="py-10 text-center bg-slate-50/50 rounded-2xl sm:rounded-3xl border border-dashed border-slate-200">
                <p className="text-slate-400 font-bold italic tracking-tight text-sm">Nenhuma consulta futura encontrada.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {data.nextAppointments.map((appt, i) => {
                  const date = new Date(appt.date);
                  return (
                    <div key={i} className="flex items-center gap-4 sm:gap-5 p-4 sm:p-5 rounded-2xl sm:rounded-3xl hover:bg-slate-50 transition-all cursor-pointer group border border-slate-50 hover:border-slate-200 bg-white shadow-sm">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-700 transition-all group-hover:scale-105 shrink-0">
                        <span className="text-xs font-black text-slate-900 group-hover:text-white">
                          {date.getHours().toString().padStart(2, '0')}:{date.getMinutes().toString().padStart(2, '0')}
                        </span>
                        <span className="text-[7px] font-black text-blue-500 group-hover:text-blue-100 uppercase tracking-tighter">
                          {date.toLocaleDateString("pt-BR", { day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                      <div className="flex-1 overflow-hidden">
                        <p className="font-bold text-slate-900 text-sm sm:text-base group-hover:text-blue-600 transition-colors truncate">{appt.patient.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Consulta</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
