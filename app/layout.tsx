import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "+Sorriso | Gestão Odontológica",
  description: "Sistema moderno e humanizado para controle de clínicas odontológicas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className="h-full">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('mais-sorriso-theme');
                  var supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (theme === 'dark' || (!theme && supportDarkMode) || (theme === 'system' && supportDarkMode)) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.colorScheme = 'dark';
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.colorScheme = 'light';
                  }

                  var accent = localStorage.getItem('mais-sorriso-accent');
                  var colors = {
                    blue: { primary: '#2563eb', hover: '#1d4ed8' },
                    mint: { primary: '#0d9488', hover: '#0f766e' },
                    ocean: { primary: '#0284c7', hover: '#0369a1' },
                    violet: { primary: '#7c3aed', hover: '#6d28d9' },
                    emerald: { primary: '#059669', hover: '#047857' },
                    slate: { primary: '#475569', hover: '#334155' }
                  };
                  if (accent && colors[accent]) {
                    document.documentElement.style.setProperty('--primary', colors[accent].primary);
                    document.documentElement.style.setProperty('--primary-hover', colors[accent].hover);
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${inter.className} min-h-screen bg-slate-50 dark:bg-[#0b1120] text-slate-900 dark:text-slate-100 antialiased transition-colors duration-200`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
