"use client";

import { Meta } from "@/types/CriarContaInput"
import { createContext, ReactNode, useContext, useState } from "react";

interface MetasContextType {
    metas: Meta[];
    adicionarMeta: (meta: Omit<Meta, "id">) => void;
    removerMeta: (id: number) => void;
    adicionarValorMeta: (id: number, valor: number) => void;
}

const MetasContext = createContext<MetasContextType | undefined>(undefined);

export function MetasProvider({ children }: { children: ReactNode }) {
    const [metas, setMetas] = useState<Meta[]>([]);

    const adicionarMeta = (meta: Omit<Meta, "id" | "valorAtual">) => {
        setMetas((prev) => [
            ...prev,
            { ...meta, id: Date.now(), valorAtual: 0 } 
        ]);
    };

    const removerMeta = (id: number) => {
        setMetas((prev) => prev.filter((m) => m.id !== id));
    };

    const adicionarValorMeta = (id: number, valor: number) => {
        setMetas((prev) => 
        prev.map((m) => m.id === id ? {...m, valorAtual: m.valorAtual + valor } : m)
        )
    }

    return(
        <MetasContext.Provider value={{ metas, adicionarMeta, removerMeta, adicionarValorMeta }}>
            {children}
        </MetasContext.Provider>
    );
}

export function useMetas() {
    const context = useContext(MetasContext);
    if (!context) throw new Error("useMetas deve ser usado dentro de MetasProvider");
    return context;
}