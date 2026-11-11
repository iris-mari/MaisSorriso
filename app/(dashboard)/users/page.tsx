"use client";

import { useState, useEffect } from "react";
import { UserPlus, Mail, User, Shield, Loader2, CheckCircle2, CreditCard, Calendar, Phone, Trash2, Stethoscope } from "lucide-react";
import { cpf as cpfValidator } from "cpf-cnpj-validator";

export default function UsersPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cpf, setCpf] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("CLIENTE");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [users, setUsers] = useState<{ id: string, name: string, role: string }[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users");
      const data = await res.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    void fetchUsers();
  }, []);

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Tem certeza que deseja remover este acesso?")) return;
    try {
      const res = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (res.ok) {
        void fetchUsers();
      } else {
        alert("Erro ao remover usuário");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    
    if (!cpfValidator.isValid(cpf)) {
      setError("CPF inserido é inválido.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, cpf, dateOfBirth, phone, role }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setName("");
        setEmail("");
        setCpf("");
        setDateOfBirth("");
        setPhone("");
        setRole("CLIENTE");
        void fetchUsers();
      } else {
        setError(data.error || "Erro ao criar acesso");
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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 11) val = val.slice(0, 11);
    val = val.replace(/^(\d{2})(\d)/g, "($1) $2");
    val = val.replace(/(\d)(\d{4})$/, "$1-$2");
    setPhone(val);
  };

  return (
    <div className="space-y-6 sm:space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col gap-1 sm:gap-2">
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">Gerenciar Acessos</h1>
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[9px] sm:text-[10px]">Cadastre novos dentistas e pacientes no sistema</p>
      </header>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-6 sm:gap-8">
        <div className="lg:col-span-3 bg-white rounded-2xl sm:rounded-[3rem] p-5 sm:p-8 md:p-10 shadow-premium border border-slate-100 flex flex-col gap-6 sm:gap-8 h-fit">

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-50 rounded-xl sm:rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
              <UserPlus className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">Novo Acesso</h2>
              <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">Preencha as credenciais</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {error && (
              <div className="bg-red-50 text-red-500 p-3 sm:p-4 rounded-xl sm:rounded-2xl text-xs font-bold border border-red-100 text-center animate-shake">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-emerald-50 text-emerald-600 p-3 sm:p-4 rounded-xl sm:rounded-2xl text-xs font-bold border border-emerald-100 text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                ACESSO CRIADO COM SUCESSO!
              </div>
            )}

            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Nome Completo</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-300" />
                <input 
                  required
                  type="text" 
                  placeholder="Nome do usuário"
                  className="w-full pl-11 sm:pl-12 pr-4 sm:pr-6 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 sm:focus:ring-8 focus:ring-blue-50 transition-all outline-none font-bold text-slate-600 text-xs sm:text-sm"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">E-mail (opcional)</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-300" />
                  <input 
                    type="email" 
                    placeholder="exemplo@email.com"
                    className="w-full pl-11 sm:pl-12 pr-4 sm:pr-6 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 sm:focus:ring-8 focus:ring-blue-50 transition-all outline-none font-bold text-slate-600 text-xs sm:text-sm"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Telefone (opcional)</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-300" />
                  <input 
                    type="tel" 
                    placeholder="(00) 00000-0000"
                    className="w-full pl-11 sm:pl-12 pr-4 sm:pr-6 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 sm:focus:ring-8 focus:ring-blue-50 transition-all outline-none font-bold text-slate-600 text-xs sm:text-sm"
                    value={phone}
                    onChange={handlePhoneChange}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              </div>

              <div className="space-y-1.5 sm:space-y-2">
                <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Data de Nascimento</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-300" />
                  <input 
                    required
                    type="date" 
                    className="w-full pl-11 sm:pl-12 pr-4 sm:pr-6 py-3.5 sm:py-4 rounded-xl sm:rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 sm:focus:ring-8 focus:ring-blue-50 transition-all outline-none font-bold text-slate-600 text-xs sm:text-sm"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">Cargo do Usuário</label>
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                <button 
                  type="button"
                  onClick={() => setRole("ADMIN")}
                  className={`flex items-center justify-center gap-1.5 sm:gap-2 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-[10px] sm:text-xs uppercase tracking-wider border transition-all cursor-pointer ${role === "ADMIN" ? "bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-100" : "bg-white text-slate-400 border-slate-100 hover:bg-slate-50"}`}
                >
                  <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Admin
                </button>
                <button 
                  type="button"
                  onClick={() => setRole("DENTISTA")}
                  className={`flex items-center justify-center gap-1.5 sm:gap-2 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-[10px] sm:text-xs uppercase tracking-wider border transition-all cursor-pointer ${role === "DENTISTA" ? "bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-100" : "bg-white text-slate-400 border-slate-100 hover:bg-slate-50"}`}
                >
                  <Stethoscope className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Dentista
                </button>
                <button 
                  type="button"
                  onClick={() => setRole("CLIENTE")}
                  className={`flex items-center justify-center gap-1.5 sm:gap-2 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-[10px] sm:text-xs uppercase tracking-wider border transition-all cursor-pointer ${role === "CLIENTE" ? "bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-100" : "bg-white text-slate-400 border-slate-100 hover:bg-slate-50"}`}
                >
                  <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Paciente
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-slate-900 hover:bg-black text-white font-black py-3.5 sm:py-4 rounded-xl sm:rounded-2xl shadow-xl shadow-slate-100 transition-all flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 text-xs sm:text-sm cursor-pointer"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UserPlus className="w-5 h-5" />}
              CRIAR NOVO ACESSO
            </button>
          </form>
        </div>

        {/* User list block */}
        <div className="lg:col-span-2 bg-white rounded-2xl sm:rounded-[3rem] p-4 sm:p-8 shadow-premium border border-slate-100 flex flex-col h-[500px] sm:h-[700px]">
          <div className="mb-4 sm:mb-6 flex flex-col gap-0.5 sm:gap-1">
            <h2 className="text-lg sm:text-xl font-black text-slate-900">Acessos Cadastrados</h2>
            <p className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">Usuários listados na plataforma</p>
          </div>

          <div className="flex-1 overflow-y-auto space-y-6 sm:space-y-8 pr-1 sm:pr-2 custom-scrollbar">
            {loadingUsers ? (
              <div className="py-10 flex justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : (
              <>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Shield className="w-4 h-4" />
                    <span className="text-xs sm:text-sm font-black uppercase tracking-widest">Administradores ({users.filter(u => u.role === "ADMIN").length})</span>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    {users.filter(u => u.role === "ADMIN").map(user => (
                      <div key={user.id} className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100 group transition-all hover:bg-white hover:border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center font-black shrink-0 text-xs sm:text-sm">
                            {user.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 text-xs sm:text-sm truncate">{user.name}</p>
                            <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Admin</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white shrink-0 cursor-pointer"
                          title="Remover acesso"
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <Stethoscope className="w-4 h-4" />
                    <span className="text-xs sm:text-sm font-black uppercase tracking-widest">Dentistas ({users.filter(u => u.role === "DENTISTA").length})</span>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    {users.filter(u => u.role === "DENTISTA").map(user => (
                      <div key={user.id} className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100 group transition-all hover:bg-white hover:border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-black shrink-0 text-xs sm:text-sm">
                            {user.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 text-xs sm:text-sm truncate">{user.name}</p>
                            <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Dentista</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white shrink-0 cursor-pointer"
                          title="Remover acesso"
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center gap-2 text-slate-500">
                    <User className="w-4 h-4" />
                    <span className="text-xs sm:text-sm font-black uppercase tracking-widest">Pacientes ({users.filter(u => u.role === "CLIENTE").length})</span>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    {users.filter(u => u.role === "CLIENTE").map(user => (
                      <div key={user.id} className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 rounded-xl sm:rounded-2xl border border-slate-100 group transition-all hover:bg-white hover:border-slate-200 shadow-sm">
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-black shrink-0 text-xs sm:text-sm">
                            {user.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-900 text-xs sm:text-sm truncate">{user.name}</p>
                            <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest">Paciente</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white shrink-0 cursor-pointer"
                          title="Remover acesso"
                        >
                          <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
