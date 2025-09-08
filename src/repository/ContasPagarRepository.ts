import { prisma } from "../lib/prisma"
import { CriarContaInput } from "@/types/CriarContaInput";

export const criarConta = (dados: CriarContaInput) => {

    return prisma.contasPagar.create({ 
        data: {
            nome: dados.nome,
            valor: Number(dados.valor),
            categoria: dados.categoria,
            data: new Date(dados.data),
            status: dados.status
        } })
}

export const listarConta = () => {
    return prisma.contasPagar.findMany();
}

export const editarConta = (id: number, dados: Partial<CriarContaInput>) => {
    return prisma.contasPagar.update({
        data: {
            ...dados,
            ...(dados.data && { data: new Date(dados.data) }),
        },
        where: { id }
    })
}

export const deleteConta = (id: number) => {
    return prisma.contasPagar.delete({
        where: { id }
    })
}

