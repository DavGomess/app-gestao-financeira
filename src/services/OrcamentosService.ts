import { prisma } from "@/lib/prisma";
import { OrcamentosRepository } from "@/repository/OrcamentosRepository";
import { OrcamentoFromAPI, OrcamentoInput, OrcamentoLocal } from "@/types";

export class OrcamentosSerivice {
    private repository = new OrcamentosRepository();

    async upsert(input: OrcamentoInput, userId: number): Promise<{ orcamento: OrcamentoLocal; isCreated: boolean }> {
        const { categoriaId, valor } = input;

        if (!categoriaId || !valor || valor <= 0) {
            throw new Error("Categoria e valor positivo são obrigatórios.");
        }

        const categoria = await prisma.categoria.findUnique({
            where: { id: categoriaId, userId }
        });
        if (!categoria) {
            throw new Error("Categoria não encontrada.");
        }

        const orcamentoExistente = await prisma.orcamento.findFirst({
            where: { userId, categoriaId }
        })

        let data;
        let isCreated = false;

        if (orcamentoExistente) {
            data = await prisma.orcamento.update({
                where: { id: orcamentoExistente.id },
                data: { valor },
                include: { categoria: true }
            });
        } else {
            data = await prisma.orcamento.create({
                data: { valor, userId, categoriaId },
                include: { categoria: true }
            });
            isCreated = true;
        }

        return {
            orcamento: this.toLocal(data),
            isCreated
        };  
    }

    async listar(userId: number): Promise<OrcamentoLocal[]> {
        const orcamentos = await this.repository.listarPorUser(userId);
        return orcamentos.map(this.toLocal);
    }

    async remover(categoriaId: number, userId: number): Promise<void> {
        await this.repository.deletar(categoriaId, userId);
    }

    private toLocal(o: OrcamentoFromAPI): OrcamentoLocal {
        return {
            id: o.id,
            categoriaId: o.categoriaId,
            valor: Number(o.valor)
        }
    }
}