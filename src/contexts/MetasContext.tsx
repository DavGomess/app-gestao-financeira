"use client";

import { MetaLocal } from "../types"
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface MetasContextType {
    metas: MetaLocal[];
    adicionarMeta: (meta: Omit<MetaLocal, "id" | "valorAtual">) => Promise<void>;
    adicionarValorMeta: (id: number, valor: number) => Promise<void>;
    editarMeta: (meta: MetaLocal) => Promise<void>;
    removerMeta: (id: number) => Promise<void>;
}

const MetasContext = createContext<MetasContextType | undefined>(undefined);

export const MetasProvider = ({ children }: { children: ReactNode }) => {
    const [metas, setMetas] = useState<MetaLocal[]>([]);

    const API = "http://localhost:4000/metas";
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const sync = async () => {
        if (!token) return;
        try {
            const res = await fetch(API, { headers: { Authorization: `Bearer ${token}` } });
            if (res.ok) {
                setMetas(await res.json());
            }
        } catch (err) {
            console.error("Erro ao sincronizar metas:", err);
        }
    };

    useEffect(() => {
        sync();
    }, [token]);

    const adicionarMeta = async (meta: Omit<MetaLocal, "id" | "valorAtual">) => {
        if (!token) return;
        try {
            const res = await fetch(API, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(meta),
            });
            if (!res.ok) throw new Error("Erro ao criar");
            await sync();
        } catch (err) {
            console.error("Erro ao adicionar meta:", err);
        }
    }

    const adicionarValorMeta = async (id: number, valor: number) => {
        if (!token) return;
        try {
            const res = await fetch(`${API}/${id}/valor`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ valor }),
        });
        if (!res.ok) throw new Error("Erro ao adicionar valor");
        await sync();
        } catch (err) {
            console.error("Erro ao adicionar valor:", err);
        }        
    }

    const editarMeta = async (meta: MetaLocal) => {
        if (!token) return;
        try {
            const res = await fetch(API, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify(meta),
            });
            if (!res.ok) throw new Error("Erro ao editar");
            await sync();
        } catch (err) {
            console.error("Erro ao editar meta:", err);
        }
    };

    const removerMeta = async (id: number) => {
        if (!token) return;
        try {
            const res = await fetch(`${API}/${id}`, { 
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` } 
            });
            if (!res.ok) throw new Error("Erro ao deletar");
            await sync();
        } catch (err) {
            console.error("Erro ao deletar meta:", err);
        }
    };



    return (
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