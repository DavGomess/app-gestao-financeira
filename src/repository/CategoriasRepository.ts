export class CategoriasRepository {
    private categorias: { id: number; nome: string; tipo: string}[] = [];

    async criar(nome: string, tipo: string) {
        const novaCategoria = { id: Date.now(), nome, tipo };
        this.categorias.push(novaCategoria);
        return novaCategoria;
    }

    async listar() {
        return this.categorias;
    }

    async deletar(id: number) {
        this.categorias = this.categorias.filter(c => c.id !== id);
        return true;
    }
}

export const categoriasRepository = new CategoriasRepository();