import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "OrçaBase.Lab - GPR | Gestão de Orçamentos e Memoriais Descritivos",
  description: "Módulo Inteligente de Compatibilização Semântica de Orçamentos e Geração Técnica de Memoriais Descritivos",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="antialiased selection:bg-[#ff861c] selection:text-black">
        {children}
      </body>
    </html>
  );
}
