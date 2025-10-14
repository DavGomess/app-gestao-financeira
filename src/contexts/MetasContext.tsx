"use client";

import { Meta } from "@/types/CriarContaInput"
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface MetasContextType {
    metas: Meta[];
    adicionarMeta: (meta: Omit<Meta, "id">) => void;
    removerMeta: (id: number) => void;
    adicionarValorMeta: (id: number, valor: number) => void;
    editarMeta: (meta: Meta) => void;
}

const MetasContext = createContext<MetasContextType | undefined>(undefined);

export function MetasProvider({ children }: { children: ReactNode }) {
    const [metas, setMetas] = useState<Meta[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem("metas");
        if (saved) {
            try {
                setMetas(JSON.parse(saved));
            } catch (error) {
                console.error("Error ao carregar metas", error)
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("metas", JSON.stringify(metas));
    }, [metas])

    const adicionarMeta = (meta: Omit<Meta, "id" | "valorAtual">) => {
        setMetas((prev) => [
            ...prev,
            { ...meta, id: Date.now(), valorAtual: 0 } 
        ]);
    };

    const removerMeta = (id: number) => {
        setMetas((prev) => prev.filter((m) => m.id !== id));
    };

    const editarMeta = (metaEditada: Meta) => {
        setMetas((prev) => 
            prev.map((m) => m.id === metaEditada.id ? {...m, ...metaEditada} : m)
        );
    };

    const adicionarValorMeta = (id: number, valor: number) => {
        setMetas((prev) => 
        prev.map((m) => m.id === id ? {...m, valorAtual: m.valorAtual + valor } : m)
        )
    }

    return(
        <MetasContext.Provider value={{ metas, adicionarMeta, removerMeta, adicionarValorMeta, editarMeta }}>
            {children}
        </MetasContext.Provider>
    );
}

export function useMetas() {
    const context = useContext(MetasContext);
    if (!context) throw new Error("useMetas deve ser usado dentro de MetasProvider");
    return context;
}