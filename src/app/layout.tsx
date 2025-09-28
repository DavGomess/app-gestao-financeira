import type { Metadata } from "next";
import { Poppins, Geist_Mono } from "next/font/google";
import "@/styles/globals.css";
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { SelectedProvider } from "@/contexts/SelectedContext";
import { CategoriaProvider } from "@/contexts/CategoriaContext";
import { TransacoesProvider } from "@/contexts/TransacoesContext";
import { OrcamentosProvider } from "@/contexts/OrcamentosContext";
import { MetasProvider } from "@/contexts/MetasContext";


const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "meuSaldo | Controle suas finanças de forma simples",
  description: "Controle suas finanças pessoais de forma prática com o MeuSaldo.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${poppins.variable} ${geistMono.variable}`}>
        <SelectedProvider>
          <CategoriaProvider>
            <TransacoesProvider>
              <OrcamentosProvider>
                <MetasProvider>
                {children}
                </MetasProvider>
              </OrcamentosProvider>
            </TransacoesProvider>
          </CategoriaProvider>
        </SelectedProvider>
      </body>
    </html>
  );
}
