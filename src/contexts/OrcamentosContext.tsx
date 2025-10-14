"use client";

import { Orcamento } from "@/types/CriarContaInput";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface OrcamentosContextType {
    orcamentos: Orcamento[];
    adicionarOrcamento: (categoria: string, valor: number) => void;
    removerOrcamento: (id: number) => void;
    editarOrcamento: (id: number, categoria: string, valor: number) => void
}

const OrcamentosContext = createContext<OrcamentosContextType | undefined>(undefined);

export function OrcamentosProvider({ children }: { children: ReactNode }) {
    const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem("orcamentos");
        if (saved) {
            try {
                setOrcamentos(JSON.parse(saved));
            } catch (error) {
                console.error("Error ao carregar orçamentos", error);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("orcamentos", JSON.stringify(orcamentos));
    }, [orcamentos]);

    const adicionarOrcamento = (categoria: string, valor: number) => {
        const novo: Orcamento = {
            id: Date.now(),
            categoria,
            valor
        }
        setOrcamentos([novo]);
    };

    const removerOrcamento = (id: number) => {
        setOrcamentos((prev) => prev.filter((o) => o.id !== id));
    };

    const editarOrcamento = (id: number, categoria: string, valor: number) => {
        setOrcamentos((prev) => prev.map((o) => o.id === id ? { ...o, categoria, valor } : o))
    };



    return (
        <OrcamentosContext.Provider value={{ orcamentos, adicionarOrcamento, removerOrcamento, editarOrcamento }}>
            {children}
        </OrcamentosContext.Provider>
    );
}

export function useOrcamentos() {
    const context = useContext(OrcamentosContext);
    if (!context) {
        throw new Error("useOrcamentos deve ser usado dentro de OrcamentosProvider");
    }
    return context;
}