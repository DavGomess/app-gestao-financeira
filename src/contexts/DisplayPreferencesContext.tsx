"use client";

import { createContext, useContext, useEffect, useState } from "react";

type DisplayPreferences = {
    exibirAbreviado: boolean;
    setExibirAbreviado: (v: boolean) => void;
};

const STORAGE_KEY = "display_preferences_v1"; 
const DisplayPreferencesContext = createContext<DisplayPreferences | undefined>(undefined);

export function DisplayPreferencesProvider({ children }: { children: React.ReactNode }) {
    const [exibirAbreviado, setExibirAbreviadoState] = useState<boolean>(false);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                const parsed = JSON.parse(raw);
                if (typeof parsed.exibirAbreviado === "boolean") setExibirAbreviadoState(parsed.exibirAbreviado);
            }
        } catch (err) {
            console.error("Erro ao carregar display preferences:", err);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ exibirAbreviado }));
        } catch (err) {
            console.error("Erro ao salvar display preferences:", err);
        }
    }, [exibirAbreviado]);

    const setExibirAbreviado = (v: boolean) => setExibirAbreviadoState(v);

    return (
        <DisplayPreferencesContext.Provider value={{ exibirAbreviado, setExibirAbreviado }}>
            {children}
        </DisplayPreferencesContext.Provider>
    );
}

export function useDisplayPreferences() {
    const ctx = useContext(DisplayPreferencesContext);
    if (!ctx) throw new Error("useDisplayPreferences deve ser usado dentro do DIspalyPreferencesProvider");
    return ctx;
}