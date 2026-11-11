"use client";

import { useState } from "react";
import { PlusCircle, CreditCard, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { cpf as cpfValidator } from "cpf-cnpj-validator";

export default function LoginPage() {
  const [cpf, setCpf] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!cpfValidator.isValid(cpf)) {
      setError("CPF inserido é inválido.");
      setLoading(false);
      return;
    }
    
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cpf }),
      });

      const data = await res.json();

      if (res.ok) {
        window.location.href = (data.role === "ADMIN" || data.role === "DENTISTA") ? "/" : "/client/appointments";
      } else {
        setError(data.error || "Erro ao fazer login");
      }
    } catch {
      setError("Algo deu errado. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 11) val = val.slice(0, 11);
    val = val.replace(/(\d{3})(\d)/, "$1.$2");
    val = val.replace(/(\d{3})(\d)/, "$1.$2");
    val = val.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    setCpf(val);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-3 sm:p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-blue-100 via-slate-50 to-white">
      <div className="w-full max-w-md bg-white rounded-2xl sm:rounded-[3rem] shadow-premium p-6 sm:p-10 border border-slate-100">
        <div className="flex flex-col items-center mb-6 sm:mb-10">
          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-100 mb-3 sm:mb-4">
            <PlusCircle className="text-white w-7 h-7 sm:w-8 sm:h-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">+Sorriso</h1>
          <p className="text-slate-400 font-bold uppercase tracking-widest text-[9px] sm:text-[10px] mt-1 sm:mt-2">Acesso Rápido</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          {error && (
            <div className="bg-red-50 text-red-500 p-3 sm:p-4 rounded-xl sm:rounded-2xl text-xs font-bold border border-red-100 text-center">
              {error}
            </div>
          )}

          <div className="space-y-1.5 sm:space-y-2">
            <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">CPF</label>
            <div className="relative">
              <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-300" />
              <input 
                required
                type="text" 
                placeholder="000.000.000-00"
                className="w-full pl-11 sm:pl-12 pr-4 sm:pr-6 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 sm:focus:ring-8 focus:ring-blue-50 transition-all outline-none font-bold text-slate-600 text-xs sm:text-sm"
                value={cpf}
                onChange={handleCpfChange}
              />
            </div>
            <p className="text-[10px] font-bold text-slate-400 ml-2 mt-1">Apenas números são necessários.</p>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-3.5 sm:py-4 rounded-xl sm:rounded-2xl shadow-xl shadow-blue-100 transition-all flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 text-xs sm:text-sm cursor-pointer"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
            ENTRAR NO SISTEMA
          </button>
        </form>

        <div className="mt-8 sm:mt-10 text-center">
          <p className="text-slate-400 font-bold text-[10px] sm:text-xs uppercase tracking-widest">Ainda não tem conta?</p>
          <Link href="/signup" className="text-blue-600 font-black text-xs sm:text-sm mt-1 sm:mt-2 inline-block hover:underline">
            CRIAR CONTA AGORA
          </Link>
        </div>
      </div>
    </div>
  );
}
