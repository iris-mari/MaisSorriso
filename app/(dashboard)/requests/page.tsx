"use client";

import { useState, useEffect } from "react";
import { Loader2, CheckCircle, XCircle, Search, User } from "lucide-react";

interface RequestItem {
  id: string;
  name: string;
  cpf: string;
  email: string;
  dateOfBirth: string;
  phone: string;
  createdAt: string;
  status: string;
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<RequestItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/requests");
      const data = await res.json();
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAction = async (id: string, action: "APPROVE" | "REJECT") => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/admin/requests/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      });
      if (res.ok) {
        fetchRequests();
      } else {
        alert("Erro ao processar solicitação.");
      }
    } catch (error) {
      console.error("Action error:", error);
    } finally {
      setActionLoading(null);
    }
  };

  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  return (
    <div className="space-y-6 sm:space-y-12 max-w-7xl mx-auto px-1 sm:px-4 md:px-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col gap-1 sm:gap-2">
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">Solicitações de Cadastro</h2>
          <p className="text-slate-500 text-xs sm:text-base font-medium tracking-tight">Gerencie aprovação de novos pacientes na plataforma.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl sm:rounded-[3rem] border border-slate-100 shadow-premium overflow-hidden">
        <div className="p-4 sm:p-8 border-b border-slate-50 flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-6 bg-slate-50/30">
          <div className="flex items-center gap-3 sm:gap-4 bg-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl sm:rounded-2xl border border-slate-200/60 flex-1 max-w-lg shadow-sm focus-within:ring-4 focus-within:ring-blue-50 transition-all">
            <Search className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 shrink-0" />
            <input 
              type="text" 
              placeholder="Pesquisar por nome ou CPF..." 
              className="bg-transparent border-none outline-none text-slate-600 placeholder:text-slate-400 w-full text-xs sm:text-sm font-bold"
            />
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1.5 rounded-full">Total Pendentes: {requests.length}</span>
          </div>
        </div>

        <div className="overflow-x-auto px-2 sm:px-4 pb-4 mt-2 sm:mt-4">
          <table className="w-full text-left border-separate border-spacing-y-2 min-w-[650px]">
            <thead>
              <tr>
                <th className="px-4 sm:px-8 py-4 sm:py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Iniciais</th>
                <th className="px-4 py-4 sm:py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nome / Email</th>
                <th className="px-4 py-4 sm:py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">CPF</th>
                <th className="px-4 py-4 sm:py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contatos / Nasc.</th>
                <th className="px-4 sm:px-8 py-4 sm:py-6 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center text-slate-400">
                    <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4 text-blue-500" />
                    <p className="font-bold text-sm tracking-tight">Buscando solicitações...</p>
                  </td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <User className="w-10 h-10 text-slate-200" />
                    </div>
                    <p className="text-slate-400 font-bold text-lg">Nenhuma solicitação pendente.</p>
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="group hover:bg-slate-50 transition-all rounded-xl sm:rounded-[1.5rem]">
                    <td className="bg-white group-hover:bg-slate-50 py-4 sm:py-5 pl-4 sm:pl-8 text-center rounded-l-xl sm:rounded-l-[1.5rem]">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black shadow-sm mx-auto text-xs sm:text-base">
                        {req.name.charAt(0)}
                      </div>
                    </td>
                    <td className="bg-white group-hover:bg-slate-50 py-4 sm:py-5 px-4">
                      <p className="font-black text-slate-900 text-sm sm:text-lg tracking-tight">{req.name}</p>
                      <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate max-w-[200px]">{req.email}</p>
                    </td>
                    <td className="bg-white group-hover:bg-slate-50 py-4 sm:py-5 px-4">
                      <span className="font-bold text-slate-600 text-xs sm:text-sm">{formatCPF(req.cpf)}</span>
                    </td>
                    <td className="bg-white group-hover:bg-slate-50 py-4 sm:py-5 px-4">
                      <p className="text-xs sm:text-sm font-bold text-slate-600">{req.phone || "N/A"}</p>
                      <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase">
                        {new Date(req.dateOfBirth).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="bg-white group-hover:bg-slate-50 py-4 sm:py-5 pr-4 sm:pr-8 text-right rounded-r-xl sm:rounded-r-[1.5rem]">
                      <div className="flex flex-col sm:flex-row items-end sm:items-center justify-end gap-1.5 sm:gap-2">
                        {actionLoading === req.id ? (
                          <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
                        ) : (
                          <>
                            <button 
                              onClick={() => handleAction(req.id, "APPROVE")}
                              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-green-50 text-green-600 hover:bg-green-600 hover:text-white font-bold text-[10px] sm:text-xs transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer"
                            >
                              <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Aprovar
                            </button>
                            <button 
                              onClick={() => handleAction(req.id, "REJECT")}
                              className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white font-bold text-[10px] sm:text-xs transition-all flex items-center gap-1.5 sm:gap-2 cursor-pointer"
                            >
                              <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> Rejeitar
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
