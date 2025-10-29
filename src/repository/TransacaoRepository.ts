import { prisma } from "../lib/prisma";
import { TransacaoFromAPI } from "@/types";

export const TransacaoRepository = {
    async findAllByUser(userId: number): Promise<TransacaoFromAPI[]> {
        return prisma.transacao.findMany({
            where: { userId },
            include: { categoria: true, conta: true },
            orderBy: { data: "desc" }
        });
    },
    
    async filterBySearch(userId: number, search: string): Promise<TransacaoFromAPI[]> {
    return prisma.transacao.findMany({
        where: {
        userId,
        OR: [
            { conta: { nome: { contains: search, mode: "insensitive" } } },
            { categoria: { nome: { contains: search, mode: "insensitive" } } },
        ],
        },
        include: { categoria: true, conta: true },
        orderBy: { data: "desc" },
    });
},
}