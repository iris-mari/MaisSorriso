"use client";

import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";
import { SidebarProvider } from "@/components/SidebarContext";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-slate-50/50">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 md:pl-72">
          <Header />
          <main className="flex-1 p-3 sm:p-6 md:p-10 overflow-x-hidden">
            <div className="max-w-7xl mx-auto w-full">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
