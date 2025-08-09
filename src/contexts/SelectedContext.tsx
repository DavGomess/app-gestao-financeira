"use client"

import React, { createContext, useState, useContext, ReactNode } from "react";

interface SelectedContextType {
    selected: string;
    setSelected: React.Dispatch<React.SetStateAction<string>>;
}

const SelectedContext = createContext<SelectedContextType | undefined>(undefined);

interface SelectedProviderProps {
    children: ReactNode;
}

export function SelectedProvider({ children }: SelectedProviderProps) {
    const [selected, setSelected] = useState("dashboard");

    return (
        <SelectedContext.Provider value={{ selected, setSelected }}>
            {children}
        </SelectedContext.Provider>
    )
}

export function useSelected() {
    const context = useContext(SelectedContext);
    if (!context) {
        throw new Error("useSelected deve ser usado dentro de SelectedProvider");
    }
    return context;
}