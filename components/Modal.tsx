"use client";

import { X } from "lucide-react";
import { useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="bg-white dark:bg-[#131d33] border border-slate-100 dark:border-slate-800 rounded-2xl sm:rounded-[2rem] shadow-2xl w-full max-w-lg relative z-10 overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200 max-h-[92vh] flex flex-col text-slate-900 dark:text-slate-100">
        <div className="px-5 sm:px-8 py-4 sm:py-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between shrink-0 bg-white dark:bg-[#131d33]">
          <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white truncate pr-2">{title}</h3>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>
        <div className="p-4 sm:p-8 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
