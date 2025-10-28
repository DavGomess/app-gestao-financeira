import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma"
import { CriarContaInput } from "../types";

export const criarConta = (dados: CriarContaInput, userId: number) => {
    return prisma.contasPagar.create({ 
        data: {
            nome: dados.nome,
            valor: dados.valor,
            data: new Date(dados.data),
            status: dados.status,
            user: { connect: { id: userId } },
            categoria: dados.categoriaId ? { connect: { id: dados.categoriaId } } : undefined,
        } })
}

export const listarConta = (userId: number) => {
    return prisma.contasPagar.findMany({
        where: { userId },
        include: { categoria: true }
    });
}

export const editarConta = async (id: number, dados: Partial<CriarContaInput>, userId: number) => {
    const dataToUpdate: Prisma.ContasPagarUpdateInput = {
        ...dados,
        ...(dados.data && { data: new Date(dados.data) }),
    };

    if (dados.categoriaId !== undefined) {
        dataToUpdate.categoria = dados.categoriaId === null ? { disconnect: true } : { connect: { id: dados.categoriaId } };
    }

    const result = await prisma.contasPagar.updateMany({
        where: { id, userId },
        data: dataToUpdate,
    });

    return result.count > 0
        ? await prisma.contasPagar.findUnique({ where: { id }, include: { categoria: true } })
        : null;
};

export const deleteConta = (id: number, userId: number) => {
    return prisma.contasPagar.deleteMany({
        where: { id, userId }
    })
}

