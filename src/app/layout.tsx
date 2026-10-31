import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OrçaBase.lab - GPR | Engenharia de Orçamentos e AI Matching",
  description: "Módulo Inteligente de Compatibilização Semântica e AI Matching com openpyxl",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-navy-950 text-gray-100 antialiased selection:bg-gold-500 selection:text-navy-950">
        {children}
      </body>
    </html>
  );
}
