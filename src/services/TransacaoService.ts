import { TransacaoLocal, TransacaoFromAPI, TransacaoTipo, TransacaoStatus } from "@/types";
import { TransacaoRepository } from "../repository/TransacaoRepository";
import { StatusConta } from "@/utils/status";

export class TransacaoService {
    async listar(userId: number): Promise<TransacaoLocal[]> {
        const transacoes = await TransacaoRepository.findAllByUser(userId);
        return this.formatTransacoes(transacoes);
    }

    async filtrar(userId: number, search: string): Promise<TransacaoLocal[]> {
        const termo = search.trim().toLowerCase();
        if (!termo) {
            return this.listar(userId);
        }
        
        const transacoes = await TransacaoRepository.filterBySearch(userId, termo);
        return this.formatTransacoes(transacoes);
    }

    private formatTransacoes(transacoes: TransacaoFromAPI[]): TransacaoLocal[] {
        const isStatusValid = (s: string): s is StatusConta => ["pendente", "paga", "vencida"].includes(s);

        return transacoes.map((t) => {
            if (!isStatusValid(t.status)) {
                throw new Error(`Status inválido: ${t.status}`);
            }

            return {
                id: t.id,
                valor: t.valor,
                tipo: t.tipo as TransacaoTipo,
                data: t.data.toISOString(),
                status: t.status as TransacaoStatus,
                categoria: t.categoria?.nome || "Sem categoria",
                categoriaId: t.categoriaId,
                contaNome: t.conta?.nome || "Sem conta"
            }
        })
    }
}
