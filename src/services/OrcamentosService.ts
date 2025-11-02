import { OrcamentosRepository } from "@/repository/OrcamentosRepository";
import { OrcamentoFromAPI, OrcamentoInput, OrcamentoLocal } from "@/types";

export class OrcamentosSerivice {
    private repository = new OrcamentosRepository();

    async upsert(input: OrcamentoInput, userId: number): Promise<OrcamentoLocal> {
        const data = await this.repository.criar({ ...input, userId });
        return this.toLocal(data);
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