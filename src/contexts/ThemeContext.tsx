"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface ThemeContextType {
    theme: "light" | "dark";
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<"light" | "dark">("light");

    useEffect(() => {
        setTheme("light");
        document.body.classList.remove("dark-theme", "light-theme");
        document.body.classList.add("light-theme");
    }, []);

    const toggleTheme = () => {
        const newTheme = theme === "light" ? "dark" : "light";
        setTheme(newTheme);
        document.body.classList.remove("light-theme", "dark-theme");
        document.body.classList.add(`${newTheme}-theme`);
        localStorage.setItem("theme", newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error("useTheme deve ser usado dentro de ThemeProvider")
    return context;
}