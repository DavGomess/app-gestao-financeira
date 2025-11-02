"use client";

import { OrcamentoLocal } from "../types";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface OrcamentosContextType {
    orcamentos: OrcamentoLocal[];
    upsert: (categoriaId: number, valor: number) => Promise<void>;
    remover: (categoriaId: number) => Promise<void>;
}

const OrcamentosContext = createContext<OrcamentosContextType | undefined>(undefined);

export const OrcamentosProvider = ({ children }: { children: ReactNode }) => {
    const [orcamentos, setOrcamentos] = useState<OrcamentoLocal[]>([]);
    const API = "http://localhost:4000/orcamentos";
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const sync = async () => {
    if (!token) return;
    try {
      const res = await fetch(API, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setOrcamentos(await res.json());
    } catch {}
  };

    useEffect(() => {
        sync()
    }, [token]);

    const upsert = async (categoriaId: number, valor: number) => {
    if (!token) return;
    await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ categoriaId, valor }),
    });
    await sync();
  };

  const remover = async (categoriaId: number) => {
    if (!token) return;
    await fetch(`${API}/${categoriaId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    await sync();
  };


    return (
        <OrcamentosContext.Provider value={{ orcamentos, upsert, remover }}>
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