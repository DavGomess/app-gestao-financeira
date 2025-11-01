import { prisma } from "@/lib/prisma";
import { MetaFromAPI } from "@/types";

export class MetasRepository {
    async criar(data: { titulo: string; categoriaId: number | null; valor: number; prazo: Date; userId: number }): Promise<MetaFromAPI> {
        return prisma.meta.create({ data });
    }

    async listarPorUser(userId: number): Promise<MetaFromAPI[]> {
        return prisma.meta.findMany({
            where: { userId },
            orderBy: { prazo: "asc" }
        });
    }
    
    async atualizarValor(id: number, valorAtual: number, userId: number): Promise<MetaFromAPI> {
        const result = await prisma.meta.updateMany({
            where: { id, userId },
            data: { valorAtual }
        });
        if (result.count === 0) throw new Error("Meta não encontrada");
        return prisma.meta.findUniqueOrThrow({ where: { id } });
    }

    async atualizar(data: { id: number; titulo: string; categoriaId: number | null; valor: number; valorAtual: number; prazo: Date },
    userId: number): Promise<MetaFromAPI> {
    const result = await prisma.meta.updateMany({
        where: { id: data.id, userId },
            data: {
                titulo: data.titulo,
                categoriaId: data.categoriaId,
                valor: data.valor,
                valorAtual: data.valorAtual,
                prazo: new Date(data.prazo),
            },
        });
    if (result.count === 0) throw new Error("Meta não encontrada");
    return prisma.meta.findUniqueOrThrow({ where: { id: data.id } });
    }

    async deletar(id: number, userId: number): Promise<void> {
        const result = await prisma.meta.deleteMany({ where: { id, userId } });
        if (result.count === 0) throw new Error("Meta não encontrada");
    }
}