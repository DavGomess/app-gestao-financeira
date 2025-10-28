import { criarConta, listarConta, editarConta, deleteConta } from "../repository/ContasPagarRepository";
import { definirStatus } from "../utils/status";
import { CriarContaInput } from  "../types"


export class ContasService {
    async criarContaService(dados: CriarContaInput, userId: number) {
        const status = definirStatus(dados.data);
        return criarConta(
            {
                ...dados,
                status,
                categoriaId: dados.categoriaId,
            },
            userId
        );
}

    async listarContasService(userId: number) {
        return listarConta(userId);
    };

    async editarContaService(id: number, dados: Partial<CriarContaInput>, userId: number) {
        if (dados.valor && dados.valor <= 0) {
        throw new Error("O valor deve ser positivo");
    }
    const result = await editarConta(id, dados, userId);
    if (result === null) {
        throw new Error("Conta não encontrada ou sem permissão para editar");
    }
    return result;
}

    async deleteContaService(id: number, userId: number) {
        const result = await deleteConta(id, userId);
    if (result.count === 0) {
        throw new Error("Conta não encontrada ou sem permissão para deletar");
    }
        return { success: true };
    }
}

