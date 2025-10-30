"use client";

import { CategoriaLocal } from "../types"
import { createContext, useContext, ReactNode, useState } from "react";


interface CategoriaContextType {
    categorias: CategoriaLocal[];
    addCategoria: (nome: string, tipo: "receita" | "despesa") => Promise<void>;
    deletarCategoria: (id: number) => Promise<void>;
};

const CategoriaContext = createContext<CategoriaContextType | undefined>(undefined);

export const CategoriaProvider = ({ children }: { children: ReactNode }) => {
    const [categorias, setCategorias] = useState<CategoriaLocal[]>([]);

    const carregar = async () => {
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
            const res = await fetch("http://localhost:4000/categorias", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setCategorias(data.receita.concat(data.despesa));
            }
        } catch {}
    }


    const addCategoria = async (nome: string, tipo: "receita" | "despesa") => {
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
            const res = await fetch("http://localhost:4000/categorias", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, 
                body: JSON.stringify({ nome, tipo }),
            });

            if (res.ok) {
                carregar();
            }
    } catch {}
};
    const deletarCategoria = async (id: number) => {
        const token = localStorage.getItem("token");
        if (!token) return;
        try {
            const res = await fetch(`http://localhost:4000/categorias/${id}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                carregar();
            }
        } catch {}
    };  

    return (
        <CategoriaContext.Provider value={{ categorias, addCategoria, deletarCategoria }}>
            {children}
        </CategoriaContext.Provider>
    );
};

export const useCategorias = () => {
    const ctx = useContext(CategoriaContext);
    if (!ctx) throw new Error("useCategorias deve ser usado dentro de CategoriaProvider");
    return ctx;
};
