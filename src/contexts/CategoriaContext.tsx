"use client";
import { Categoria } from "../types/CriarContaInput.ts"
import { createContext, useContext, useEffect, useState } from "react";


type CategoriaContextType = {
    categorias: Categoria[];
    addCategoria: (categoria: Omit<Categoria, "id">) => Promise<void>;
    deletarCategoria: (categoria: Categoria) => Promise<void>;
};

const CategoriaContext = createContext<CategoriaContextType | undefined>(undefined);

export const CategoriaProvider = ({ children }: { children: React.ReactNode }) => {
    const [categorias, setCategorias] = useState<Categoria[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem("categorias");
        if (saved) {
            try {
                setCategorias(JSON.parse(saved));
                return;
            } catch (error) {
                console.error("Error ao carregar categorias do localStorage", error)
            }
        }

        const fetchCategorias = async () => {
            try {
                const res = await fetch("http://localhost:4000/categorias");
                if (!res.ok) throw new Error("Erro ao buscar categorias");
                const data: Categoria[] = await res.json();
                setCategorias(data);
            } catch (err) {
                console.error("Erro ao carregar categorias:", err);
            }
        };
        fetchCategorias();
    }, []);

    useEffect(() => {
        localStorage.setItem("categorias", JSON.stringify(categorias))
    }, [categorias])

    const addCategoria = async (categoria: Omit<Categoria, "id">) => {
        try {
            const res = await fetch("http://localhost:4000/categorias", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(categoria),
            });

            if (!res.ok) throw new Error("Erro ao criar categoria");
            const nova: Categoria = await res.json();
            setCategorias((prev) => [...prev, nova]);
        } catch (err) {
            console.error("Erro ao adicionar categoria:", err);
        }
    };

    const deletarCategoria = async (categoria: Categoria) => {
        try {
            const res = await fetch(`http://localhost:4000/categorias/${categoria.id}`, {
                method: "DELETE",
            });
            if (!res.ok) throw new Error("Erro ao deletar categoria");
            setCategorias((prev) => prev.filter((c) => c.id !== categoria.id));
        } catch (err) {
            console.error("Erro ao deletar categoria:", err);
        }
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
