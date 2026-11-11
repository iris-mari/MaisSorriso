"use client";

import { Bell, Search, User, LogOut, Menu, CheckCheck } from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useSidebar } from "./SidebarContext";

export default function Header() {
  const [userName, setUserName] = useState("...");
  const [userRole, setUserRole] = useState("...");
  const [isAdmin, setIsAdmin] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { toggle } = useSidebar();

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.name) {
          setUserName(data.name);
          if (data.role === "ADMIN") {
            setUserRole("Administrador");
            setIsAdmin(true);
            void fetch("/api/admin/requests")
              .then(res => res.json())
              .then(reqs => setPendingCount(Array.isArray(reqs) ? reqs.length : 0));
          } else if (data.role === "DENTISTA") {
            setUserRole("Dentista");
            setIsAdmin(false);
          } else if (data.role === "CLIENTE") {
            setUserRole("Paciente");
            setIsAdmin(false);
            fetchNotifications();
          }
        }
      })
      .catch(() => {
        setUserName("Acesso");
        setUserRole("Convidado");
      });
  }, []);

  useEffect(() => {
    if (!isDropdownOpen) return;
    const handleOutsideClick = () => setIsDropdownOpen(false);
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, [isDropdownOpen]);

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setNotifications(prev =>
          prev.map(n => (n.id === id ? { ...n, read: true } : n))
        );
      }
    } catch (error) {
      console.error(error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  return (
    <header className="h-20 sm:h-24 sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200/60 z-40 px-3 sm:px-6 md:px-10 flex items-center justify-between">
      <div className="flex items-center gap-2 sm:gap-4 flex-1">
        <button
          onClick={toggle}
          aria-label="Abrir menu"
          className="md:hidden p-2.5 hover:bg-slate-50 rounded-2xl text-slate-500 border border-slate-100 shadow-sm transition-all shrink-0"
        >
          <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>

        <div className="hidden md:flex items-center gap-4 bg-slate-50 hover:bg-white px-5 py-3 rounded-2xl border border-slate-200/50 flex-1 max-w-lg transition-all duration-300 group focus-within:ring-4 focus-within:ring-blue-50 focus-within:border-blue-200">
          <Search className="w-5 h-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          <input
            type="text"
            placeholder="Pesquisar registros..."
            className="bg-transparent border-none outline-none text-slate-600 placeholder:text-slate-400 w-full text-sm font-medium"
          />
          <div className="bg-slate-200 text-slate-500 px-2 py-1 rounded text-[10px] font-bold">
            ⌘K
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 md:gap-6 ml-2 sm:ml-4">
        {isAdmin ? (
          <Link 
            href="/requests" 
            title="Solicitações pendentes"
            className="flex p-2.5 sm:p-3 rounded-2xl hover:bg-slate-50 transition-all relative group bg-white shadow-sm border border-slate-100"
          >
            <Bell className="w-5 h-5 text-slate-500 group-hover:text-blue-600" />
            {pendingCount > 0 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white animate-pulse"></span>
            )}
          </Link>
        ) : (
          userName !== "..." && userName !== "Acesso" && (
            <div className="relative" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex p-2.5 sm:p-3 rounded-2xl hover:bg-slate-50 transition-all relative group bg-white shadow-sm border border-slate-100 cursor-pointer"
                aria-label="Notificações"
              >
                <Bell className="w-5 h-5 text-slate-500 group-hover:text-blue-600" />
                {notifications.filter((n) => !n.read).length > 0 && (
                  <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white animate-pulse"></span>
                )}
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-[calc(100vw-2rem)] max-w-sm sm:w-80 bg-white rounded-2xl border border-slate-100 shadow-2xl z-50 overflow-hidden transform origin-top-right transition-all animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                    <span className="text-[10px] font-black text-slate-700 uppercase tracking-wider">Notificações</span>
                    {notifications.filter((n) => !n.read).length > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[10px] font-black text-blue-600 hover:text-blue-700 transition-colors uppercase tracking-tight flex items-center gap-1 cursor-pointer"
                      >
                        <CheckCheck className="w-4 h-4" />
                        Lidas
                      </button>
                    )}
                  </div>
                  <div className="max-h-[300px] overflow-y-auto divide-y divide-slate-50 custom-scrollbar">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-slate-400">
                        <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                        <p className="text-xs font-bold">Nenhuma notificação</p>
                      </div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            if (!notif.read) markAsRead(notif.id);
                          }}
                          className={`p-4 transition-all cursor-pointer flex flex-col gap-1.5 text-left ${
                            notif.read ? "bg-white hover:bg-slate-50/50" : "bg-blue-50/20 hover:bg-blue-50/40"
                          }`}
                        >
                          <p className={`text-xs leading-relaxed ${notif.read ? "text-slate-500 font-medium" : "text-slate-800 font-bold"}`}>
                            {notif.message}
                          </p>
                          <div className="flex items-center justify-between text-[9px] font-bold text-slate-400 uppercase">
                            <span>{new Date(notif.createdAt).toLocaleDateString()}</span>
                            {!notif.read && (
                              <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-4 border-t border-slate-50 bg-slate-50/10 text-center">
                    <Link
                      href="/client/budgets"
                      onClick={() => setIsDropdownOpen(false)}
                      className="text-[10px] font-black text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-widest block"
                    >
                      Ver Meus Orçamentos
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )
        )}

        <div className="hidden sm:block h-8 w-px bg-slate-200"></div>

        <div className="flex items-center gap-2 sm:gap-4 pl-0 md:pl-2 group cursor-pointer relative">
          <div className="text-right hidden lg:block">
            <p className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight truncate max-w-[150px]">
              {userName}
            </p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
              {userRole}
            </p>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 p-0.5 shadow-inner transition-transform group-hover:scale-105 border border-slate-100/50 shrink-0">
            <div className="w-full h-full rounded-[14px] bg-white flex items-center justify-center text-blue-600">
              <User className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 sm:p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all shrink-0"
            title="Sair do sistema"
            aria-label="Sair"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
