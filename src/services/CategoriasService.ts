import { CategoriasRepository } from "../repository/CategoriasRepository.ts";

export class CategoriasService {
    private repository: CategoriasRepository;

    constructor(repository: CategoriasRepository) {
        this.repository = repository;
    }

    async criarCategoriasService({ nome, tipo }: { nome: string; tipo: string}) {
        return this.repository.criar(nome, tipo);
    }

    async listarCategoriasService() {
        return this.repository.listar();
    }

    async deletarCategoriasService(id: number) {
        return this.repository.deletar(id);
    }


}
