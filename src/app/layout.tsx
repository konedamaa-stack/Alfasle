import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { ToastProvider } from "@/lib/toast-context";
import { ToastContainer } from "@/components/common/Toast";

export const metadata: Metadata = {
  title: "AlFasle — Plateforme de Gestion de Classes, Cours & Devoirs",
  description:
    "Créez vos classes, validez les préinscriptions, publiez vos cours et vidéos, donnez des devoirs et corrigez-les au même endroit.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="light">
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-500/20 selection:text-indigo-900">
        <StoreProvider>
          <ToastProvider>
            {children}
            <ToastContainer />
          </ToastProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
