import * as ContasPagarRepository from "../repository/ContasPagarRepository.ts";
import { definirStatus } from "../utils/status.ts";
import { CriarContaInput } from  "../types/CriarContaInput.ts"


export class ContasService {
    async criarContaService(dados: CriarContaInput) {
        if (dados.valor <= 0) {
            throw new Error("O valor da conta deve ser maior que zero")
        }

        const status = definirStatus(dados.data);

        return ContasPagarRepository.criarConta({ ...dados, status });
    };

    async listarContasService() {
        return ContasPagarRepository.listarConta();
    };

    async editarContaService(id: number, dados: Partial<CriarContaInput>) {
        if (dados.valor !== undefined && dados.valor <= 0) {
            throw new Error("O valor deve ser maior que zero");
        }
        return ContasPagarRepository.editarConta(id, dados);
    }

    async deleteContaService(id: number) {
        return ContasPagarRepository.deleteConta(id);
    }
}

