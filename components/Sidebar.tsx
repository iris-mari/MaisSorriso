"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Stethoscope,
  Settings,
  X,
  FileText,
  FileImage
} from "lucide-react";
import { useSidebar } from "./SidebarContext";

const adminLinks = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Pacientes", href: "/patients", icon: Users },
  { name: "Agenda", href: "/agenda", icon: Calendar },
  { name: "Prontuário", href: "/prontuario", icon: Stethoscope },
  { name: "Orçamentos", href: "/budgets", icon: FileText },
  { name: "Raio-x", href: "/xrays", icon: FileImage },
  { name: "Acessos", href: "/users", icon: Users },
];

const clientLinks = [
  { name: "Minhas Consultas", href: "/client/appointments", icon: Calendar },
  { name: "Meus Documentos", href: "/client/documents", icon: FileText },
  { name: "Meus Orçamentos", href: "/client/budgets", icon: FileText },
  { name: "Meu Prontuário", href: "/client/records", icon: Stethoscope },
  { name: "Meu Raio-x", href: "/client/xrays", icon: FileImage },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { isOpen, close } = useSidebar();
  const [role, setRole] = useState("ADMIN");

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.role) setRole(data.role);
      })
      .catch(() => { });
  }, []);

  const linksToMap = role === "CLIENTE"
    ? clientLinks
    : (role === "DENTISTA"
      ? adminLinks.filter(link => link.href !== "/users")
      : adminLinks);

  const isSettingsActive = pathname === "/settings";

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={`fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={close}
      />

      <aside className={`fixed left-0 top-0 h-full w-72 bg-white dark:bg-[#11192b] flex flex-col z-50 transition-transform duration-300 ease-in-out border-r border-slate-200/60 dark:border-slate-800/80 shadow-2xl md:shadow-none ${
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      }`}>
        <div className="p-6 sm:p-8 pb-4">
          <div className="flex flex-col items-center gap-2">
            <div className="w-full flex justify-between items-center md:justify-center">
              <Link href="/" className="inline-block">
                <Image 
                  src="/maisSorriso.png" 
                  alt="+Sorriso Logo" 
                  width={150}
                  height={150}
                  className="object-contain transform hover:scale-105 transition-transform duration-500"
                  priority
                />
              </Link>
              <button
                onClick={close}
                className="md:hidden p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400"
                aria-label="Fechar menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
          {linksToMap.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => {
                  if (window.innerWidth < 768) close();
                }}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 group ${
                  isActive 
                    ? "bg-theme-primary text-white shadow-xl shadow-theme-primary" 
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Icon className={`w-5 h-5 transition-colors ${isActive ? "text-white" : "text-slate-400 dark:text-slate-500 group-hover:text-theme-primary"}`} />
                <span className="font-bold text-sm tracking-tight">{link.name}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></div>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800/60">
          <Link
            href="/settings"
            onClick={() => {
              if (window.innerWidth < 768) close();
            }}
            className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-bold text-sm group ${
              isSettingsActive
                ? "bg-theme-primary text-white shadow-xl shadow-theme-primary"
                : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Settings className={`w-5 h-5 transition-colors ${isSettingsActive ? "text-white" : "text-slate-400 dark:text-slate-500 group-hover:text-theme-primary"}`} />
            <span>Configurações</span>
            {isSettingsActive && (
              <div className="ml-auto w-1.5 h-1.5 bg-white rounded-full"></div>
            )}
          </Link>
        </div>
      </aside>
    </>
  );
}
