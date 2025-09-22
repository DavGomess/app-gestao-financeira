"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Transacao } from "@/types/CriarContaInput";

interface TransacoesContextType {
    transacoes: Transacao[];
    setTransacoes: React.Dispatch<React.SetStateAction<Transacao[]>>;
}

const TransacoesContext = createContext<TransacoesContextType | undefined>(undefined);

export const TransacoesProvider = ({ children }: { children: React.ReactNode }) => {
    const [transacoes, setTransacoes] = useState<Transacao[]>([]);

    useEffect(() => {
        const fetchTransacoes = async () => {
            try {
                const res = await fetch("http://localhost:4000/transacoes");
                if (!res.ok) throw new Error("Erro ao buscar transações");
                const data: Transacao[] = await res.json();
                setTransacoes(data);
            } catch (error) {
                console.error(error);
            }
        };

        fetchTransacoes();
    }, []);


    return (
        <TransacoesContext.Provider value={{ transacoes, setTransacoes }}>
            {children}
        </TransacoesContext.Provider>
    );
}

export function useTransacoes() {
    const context = useContext(TransacoesContext);
    if (!context) {
        throw new Error("useTransacoes deve ser usado dentro de TransacoesProvider");
    }
    return context;
}