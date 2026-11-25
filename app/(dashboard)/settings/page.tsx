"use client";

import React, { useState } from "react";
import { 
  Sun, 
  Moon, 
  Monitor, 
  Palette, 
  Check, 
  Sparkles, 
  Calendar, 
  Clock, 
  User, 
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  Stethoscope,
  Smile,
  Layers,
  Eye
} from "lucide-react";
import { useTheme, ThemeMode, AccentColorId } from "@/components/ThemeContext";

export default function SettingsPage() {
  const { 
    theme, 
    resolvedTheme, 
    accent, 
    accentConfig, 
    setTheme, 
    setAccent, 
    palette 
  } = useTheme();

  const [savedFeedback, setSavedFeedback] = useState(false);

  const showSavedIndicator = () => {
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  const handleThemeChange = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    showSavedIndicator();
  };

  const handleAccentChange = (newAccent: AccentColorId) => {
    setAccent(newAccent);
    showSavedIndicator();
  };

  const handleReset = () => {
    setTheme("light");
    setAccent("blue");
    showSavedIndicator();
  };

  const themeOptions: { id: ThemeMode; label: string; desc: string; icon: React.ElementType }[] = [
    {
      id: "light",
      label: "Modo Claro",
      desc: "Superfícies nítidas e limpas em tons suaves de ardósia (#f8fafc), ideal para ambientes bem iluminados.",
      icon: Sun,
    },
    {
      id: "dark",
      label: "Modo Escuro",
      desc: "Tons escuros balanceados (#0b1120 / #131d33) que protegem a visão e evitam o preto absoluto estourado.",
      icon: Moon,
    },
    {
      id: "system",
      label: "Padrão do Sistema",
      desc: "Adapta-se automaticamente à preferência configurada no seu sistema operacional (Windows, macOS ou mobile).",
      icon: Monitor,
    },
  ];

  return (
    <div className="space-y-8 sm:space-y-10 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200/60 dark:border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 rounded-lg bg-theme-primary-light text-theme-primary">
              <Palette className="w-5 h-5" />
            </span>
            <span className="text-xs font-black uppercase tracking-wider text-theme-primary">
              Configurações do Sistema
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Personalização de Aparência
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base font-medium mt-1">
            Escolha entre temas claro/escuro e personalize a cor de destaque para refletir a identidade visual do seu consultório.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {savedFeedback && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 animate-in fade-in slide-in-from-right duration-200">
              <Check className="w-3.5 h-3.5" />
              Salvo no navegador
            </span>
          )}
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700 shadow-sm transition-all"
            title="Restaurar padrão clínico"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restaurar Padrão
          </button>
        </div>
      </div>

      {/* Seção 1: Tema Claro / Escuro */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Sun className="w-5 h-5 text-amber-500" />
              1. Modo de Exibição
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              Controle o contraste geral da interface do software odontológico.
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            Atual: <strong className="text-theme-primary uppercase ml-1">{theme === "system" ? `Sistema (${resolvedTheme})` : theme}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {themeOptions.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.id;

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => handleThemeChange(opt.id)}
                className={`relative flex flex-col p-5 rounded-2xl text-left transition-all duration-200 border-2 cursor-pointer group ${
                  isSelected
                    ? "bg-white dark:bg-[#131d33] border-theme-primary shadow-lg shadow-theme-primary"
                    : "bg-white/80 dark:bg-[#131d33]/60 hover:bg-white dark:hover:bg-[#131d33] border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`p-3 rounded-xl transition-all ${
                      isSelected
                        ? "bg-theme-primary text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  {isSelected && (
                    <div className="w-6 h-6 rounded-full bg-theme-primary text-white flex items-center justify-center shadow-md">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>

                <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight mb-1">
                  {opt.label}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                  {opt.desc}
                </p>

                {/* Mini Preview bar inside card */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center gap-1.5">
                  <span className={`w-3 h-3 rounded-full ${opt.id === "light" ? "bg-amber-400" : opt.id === "dark" ? "bg-indigo-400" : "bg-sky-400"}`} />
                  <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                    {opt.id === "light" ? "Contraste Claro" : opt.id === "dark" ? "Descanso Visual" : "Dinâmico"}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Seção 2: Paleta de Cores Odontológicas */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Palette className="w-5 h-5 text-theme-primary" />
              2. Cor Principal de Destaque (Paleta Odontológica)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              Escolha a tonalidade de destaque aplicada dinamicamente aos botões, ícones ativos, abas e agendas.
            </p>
          </div>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            Selecionada: <strong className="text-theme-primary ml-1">{accentConfig.name}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {palette.map((item) => {
            const isSelected = accent === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleAccentChange(item.id)}
                className={`relative flex flex-col p-5 rounded-2xl text-left transition-all duration-200 border-2 cursor-pointer group ${
                  isSelected
                    ? "bg-white dark:bg-[#131d33] border-theme-primary shadow-lg shadow-theme-primary"
                    : "bg-white/80 dark:bg-[#131d33]/60 hover:bg-white dark:hover:bg-[#131d33] border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700"
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-110"
                      style={{ backgroundColor: item.primary }}
                    >
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white tracking-tight">
                        {item.name}
                      </h3>
                      <p className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tight">
                        {item.tagline}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <div 
                      className="w-6 h-6 rounded-full text-white flex items-center justify-center shadow-md shrink-0"
                      style={{ backgroundColor: item.primary }}
                    >
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed mt-1 flex-1">
                  {item.description}
                </p>

                {/* Swatch & Preview Samples */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span 
                      className="w-4 h-4 rounded-full shadow-inner border border-black/10" 
                      style={{ backgroundColor: item.primary }} 
                      title={item.primary}
                    />
                    <span 
                      className="w-4 h-4 rounded-full shadow-inner border border-black/10" 
                      style={{ backgroundColor: item.primaryHover }} 
                      title={item.primaryHover}
                    />
                    <span 
                      className="w-4 h-4 rounded-full shadow-inner border border-black/10" 
                      style={{ backgroundColor: item.primaryBorder }} 
                      title={item.primaryBorder}
                    />
                  </div>

                  <span 
                    className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md"
                    style={{ 
                      backgroundColor: resolvedTheme === "dark" ? item.darkLight : item.primaryLight,
                      color: resolvedTheme === "dark" ? item.darkText : item.primaryText
                    }}
                  >
                    {item.id}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Seção 3: Pré-visualização em Tempo Real (Live Preview) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <Eye className="w-5 h-5 text-theme-primary" />
              3. Pré-visualização em Tempo Real (Live Preview)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
              Veja exatamente como os elementos clínicos, botões e abas se comportam com a combinação atual.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-xs font-bold text-slate-400">
            <Layers className="w-4 h-4" />
            Aplicação Imediata
          </div>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#131d33] border border-slate-200/80 dark:border-slate-800 shadow-xl transition-all">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
            {/* Coluna 1: Controles e Botões */}
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Botões & Ações Principais
                </span>
                <span className="text-[10px] font-bold text-theme-primary">
                  {accentConfig.name}
                </span>
              </div>

              <div className="flex flex-wrap gap-3">
                <button 
                  type="button"
                  className="px-4 py-2.5 rounded-xl font-bold text-sm text-white bg-theme-primary hover:bg-theme-primary-hover shadow-lg shadow-theme-primary transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Smile className="w-4 h-4" />
                  Agendar Consulta
                </button>

                <button 
                  type="button"
                  className="px-4 py-2.5 rounded-xl font-bold text-sm bg-theme-primary-light text-theme-primary border border-theme-primary-border hover:opacity-90 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Stethoscope className="w-4 h-4" />
                  Ver Prontuário
                </button>

                <button 
                  type="button"
                  className="px-4 py-2.5 rounded-xl font-bold text-sm text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  Cancelar
                </button>
              </div>

              {/* Abas e Pills */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Navegação & Abas Selecionadas
                </span>
                <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 max-w-fit">
                  <button 
                    type="button"
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-white bg-theme-primary shadow-sm transition-all"
                  >
                    Semanal
                  </button>
                  <button 
                    type="button"
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-all"
                  >
                    Mensal
                  </button>
                  <button 
                    type="button"
                    className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-all"
                  >
                    Lista Geral
                  </button>
                </div>
              </div>

              {/* Badges de Status */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Status & Tags Clínicas
                </span>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-theme-primary-light text-theme-primary border border-theme-primary-border flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-theme-primary animate-pulse" />
                    Atendimento Ativo
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                    Confirmado
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    Aguardando
                  </span>
                </div>
              </div>
            </div>

            {/* Coluna 2: Card de Consulta Simulado */}
            <div className="space-y-4">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Card de Agendamento da Agenda
              </span>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 space-y-4 relative overflow-hidden">
                {/* Linha de destaque lateral */}
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1.5"
                  style={{ backgroundColor: accentConfig.primary }}
                />

                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-sm"
                      style={{ backgroundColor: accentConfig.primary }}
                    >
                      MS
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-slate-900 dark:text-white">
                        Mariana Santos Silva
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Profilaxia e Raspagem (Limpeza)
                      </p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-theme-primary-light text-theme-primary border border-theme-primary-border">
                    14:30
                  </span>
                </div>

                <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200/50 dark:border-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-theme-primary" />
                    45 minutos
                  </span>
                  <span className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-theme-primary" />
                    Dr. Roberto Lima
                  </span>
                  <span className="flex items-center gap-1.5 ml-auto text-emerald-600 dark:text-emerald-400 font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Confirmado
                  </span>
                </div>
              </div>

              {/* Input com foco dinâmico */}
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  Campo de Pesquisa / Formulário (Foco com Cor Ativa)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    readOnly
                    value="Busca inteligente por paciente ou procedimento..."
                    className="w-full px-4 py-2.5 rounded-xl text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-theme-primary focus:border-theme-primary transition-all"
                  />
                  <div className="absolute right-3 top-2.5">
                    <span className="w-2 h-2 rounded-full bg-theme-primary inline-block animate-ping" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Seção 4: Garantia de Persistência */}
      <div className="p-5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/50 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 shrink-0">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-black text-slate-900 dark:text-white">
            Persistência Automática Ativada
          </h4>
          <p className="text-xs text-slate-600 dark:text-slate-300 font-medium leading-relaxed mt-0.5">
            Suas preferências de tema (<strong>{theme}</strong>) e paleta (<strong>{accentConfig.name}</strong>) ficam salvas com segurança no <code>localStorage</code> do seu navegador. Ao fechar e reabrir o sistema ou atualizar a página, sua personalização permanecerá exatamente como você definiu.
          </p>
        </div>
      </div>
    </div>
  );
}
