"use client";

import { useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../contexts/ToastContext";
import styles from "./login.module.css";
import Image from "next/image";
import Link from "next/link";

export default function Login() {
    const { login } = useAuth();
    const { showToast } = useToast();
    const [email, setEmail] = useState("");
    const [senha, setSenha] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !senha || !email.includes("@")) {
            showToast("Email e senha são obrigatórios", "danger");
            return;
        }

        setLoading(true);
        try {
            await login(email, senha);
            showToast("Login realizado com sucesso!", "success");
        } catch {
            showToast("Erro no login", "danger");
        } finally {
            setLoading(false);
        }
    };  

    const isDisabled = loading || email.trim() === "" || senha.trim() === "";

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit} className={styles.card}>
                <div className={styles.infoHeader}>
                    {<Image
                        src="/image/logo.png"
                        alt="logo"
                        width={60}
                        height={60}>
                    </Image>}
                    <p className="">meuSaldo</p>
                </div>
                <div className={styles.subTitulo}>
                    <h5>Entre na sua conta para continuar.</h5>
                </div>
                <div className={styles.infoInput}>
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        placeholder="Insira seu E-mail"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className={styles.infoInput}>
                    <label htmlFor="senha">Senha</label>
                    <input
                        type="password"
                        placeholder="Insira sua Senha"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" disabled={isDisabled}><i className="bi bi-box-arrow-right me-2"></i>
                {loading ? "Entrando..." : "Login"}
                </button>
                <div className={styles.infoFooter}>
                    <Link href={"/register"} className={styles.link}><p className={styles.linkregister}>Não tem uma conta? Criar conta</p></Link>
                    <Link href={"/recuperarSenha"} className={styles.link}><p className={styles.linkRecuperarSenha}>Esquecer senha?</p></Link>
                </div>
            </form>
        </div>
    )
} 