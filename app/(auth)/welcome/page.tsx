"use client";

import { PlusCircle, LogOut, CheckCircle2 } from "lucide-react";

export default function WelcomePage() {

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 sm:p-6 text-center">
      <div className="w-16 h-16 sm:w-24 sm:h-24 bg-blue-600 rounded-2xl sm:rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-200 mb-6 sm:mb-10 animate-bounce">
        <PlusCircle className="text-white w-8 h-8 sm:w-12 sm:h-12" />
      </div>
      
      <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight mb-3 sm:mb-4">Seja bem-vindo ao +Sorriso!</h1>
      <p className="text-slate-500 font-medium text-sm sm:text-lg max-w-md mb-8 sm:mb-12">
        Sua conta de <span className="text-blue-600 font-bold">Paciente</span> foi criada com sucesso. Em breve você poderá agendar suas consultas e ver seu histórico por aqui.
      </p>

      <div className="bg-slate-50 p-6 sm:p-8 rounded-2xl sm:rounded-[3rem] border border-slate-100 flex flex-col items-center gap-3 sm:gap-4 mb-8 sm:mb-12">
        <CheckCircle2 className="text-emerald-500 w-6 h-6 sm:w-8 sm:h-8" />
        <p className="text-[10px] sm:text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Painel do Paciente em Breve</p>
      </div>

      <button 
        onClick={handleLogout}
        className="flex items-center gap-3 px-6 sm:px-8 py-3.5 sm:py-4 bg-slate-100 hover:bg-red-50 hover:text-red-600 text-slate-600 rounded-xl sm:rounded-2xl font-black transition-all group text-xs sm:text-sm cursor-pointer"
      >
        <LogOut className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
        SAIR DA CONTA
      </button>
    </div>
  );
}
