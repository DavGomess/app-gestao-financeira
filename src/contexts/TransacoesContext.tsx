"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { TransacaoLocal } from "../types";

interface TransacoesContextType {
    transacoes: TransacaoLocal[];
    setTransacoes: React.Dispatch<React.SetStateAction<TransacaoLocal[]>>;
}

const TransacoesContext = createContext<TransacoesContextType | undefined>(undefined);

export const TransacoesProvider = ({ children }: { children: ReactNode }) => {
    const [transacoes, setTransacoes] = useState<TransacaoLocal[]>([]);

    return (
    <TransacoesContext.Provider value={{ transacoes, setTransacoes }}>
        {children}
    </TransacoesContext.Provider>
    );
};

export function useTransacoes() {
    const context = useContext(TransacoesContext);
    if (!context) {
    throw new Error("useTransacoes deve ser usado dentro de TransacoesProvider");
    }
    return context;
}