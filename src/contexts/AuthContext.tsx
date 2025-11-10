"use client";

import { useRouter } from "next/navigation";
import { useToast } from "../contexts/ToastContext"
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface AuthContextType {
    user: string | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (email: string, senha: string) => Promise<boolean>;
    register: (email: string, senha: string) => Promise<boolean>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);


export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { showToast } = useToast();
    
    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";    
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const res = await fetch(`${API_URL}/auth/me`, {
                    method: "GET",
                    credentials: "include", 
                });
                if (res.ok) {
                    const data = await res.json();
                    setUser(data.email);
                } else {
                    setUser(null);
                }
            } catch {
                setUser(null);
            } finally {
                setLoading(false);
            }
        }
        checkAuth();
    }, []);


    const login = async (email: string, senha: string): Promise<boolean> => {
        try {
            const res = await fetch(`${API_URL}/auth/login`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password: senha })
            });

            const data = await res.json();

            if (!res.ok) {
                return false;
            }

            setUser(data.user.email);
            router.push("/");
            return true;
        } catch (err) {
            console.log("Erro no login:", err);
            return false;
        }
    };

    const register = async (email: string, senha: string): Promise<boolean> => {
        try {
            const res = await fetch(`${API_URL}/auth/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password: senha })
            });

            const data = await res.json();

            if (!res.ok) {
                showToast(data.error || "Email ao registrar!", "danger");
                return false;
            }

            showToast("Conta criada com sucesso! Faça login.", "success");
            router.push("/login");
            return true;
        } catch (err) {
            console.error("Erro no registro:", err);
            showToast("Erro ao registrar!", "danger");
            return false;
        }
    }

    const logout = async () => {
        try {
            await fetch(`${API_URL}/auth/logout`, {
                method: "POST",
                credentials: "include",
            });
        } catch {
        } finally {
            setUser(null);
            router.push("/login");
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, isAuthenticated: !!user, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth deve ser usado dentor do AuthProvider");
    return context;
}