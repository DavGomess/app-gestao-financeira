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
    contaId: number;
    nome: string;
    valor: number;
    categoria: string;
    data: string;
    tipo: "receita" | "despesa"; 
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

export interface Categoria {
    id:number;
    nome: string;
    tipo: "receita" | "despesa";
}

export interface Orcamento {
    id: number;
    categoria: string;
    valor: number;
}

export interface Meta {
    id: number;
    titulo: string;
    categoria: string;
    valor: number;  
    valorAtual: number;
    prazo: string;   
}