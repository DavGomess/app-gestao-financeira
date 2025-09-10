import { StatusConta } from "@/utils/status";

export interface CriarContaInput {
    nome: string;
    valor: number;
    categoria: string;
    data: string;
    status: StatusConta;
}

export interface ContaLocal {
    id: number; 
    nome: string;
    valor: number;
    categoria: string;
    data: string;
    status: StatusConta;
    statusAnterior?: StatusConta;
}

export interface Transacao {
    id: number;
    nome: string;
    valor: number;
    categoria: string;
    data: string;
    status: string;
}

export interface PeriodoSelecionado  {
    tipo: "predefinido" | "personalizado";
    dias?: number; 
    inicio?: Date;
    fim?: Date;
};

export interface ToastProps {
    id: string;
    message: string;
    type?: "primary" | "success" | "danger" | "warning" | undefined;
};