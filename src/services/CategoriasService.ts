import { CategoriaLocal } from "@/types";
import { CategoriasRepository } from "../repository/CategoriasRepository";
import { categorias as categoriasFixas, TipoCategoria } from "@/app/data/categorias";

export class CategoriasService {
    private repository = new CategoriasRepository();


    async criar(nome: string, tipo: "receita" | "despesa", userId: number): Promise<CategoriaLocal> {
        const categoria = await this.repository.criar(nome, tipo, userId);
        return { id: categoria.id, nome: categoria.nome, tipo: categoria.tipo as "receita" | "despesa" };
    }

    async listar(userId: number): Promise<{ receita: CategoriaLocal[]; despesa: CategoriaLocal[] }> {
        const doBanco = await this.repository.listarPorUser(userId);
        const doBancoLocal = doBanco.map(c => ({
            id: c.id,
            nome: c.nome,
            tipo: c.tipo as 'receita' | 'despesa'
        }));

        const fixas = (tipo: TipoCategoria): CategoriaLocal[] => {
            const lista = tipo === "Receita" ? categoriasFixas.Receita : categoriasFixas.Despesa;
            return lista.map(nome => ({
                id: 0,
                nome,
                tipo: tipo === "Receita" ? "receita" : "despesa",
            }));
        };

        const receitasFixas = fixas("Receita");
        const despesasFixas = fixas("Despesa");

        return { 
            receita: [...receitasFixas, ...doBancoLocal.filter(c => c.tipo === "receita")],
            despesa: [...despesasFixas, ...doBancoLocal.filter(c => c.tipo === "despesa")],
        };
    };

    async deletar(id: number, userId: number): Promise<void> {
        if (id === 0) throw new Error("Categoria fixa não pode ser deletada.");
        await this.repository.deletar(id, userId);
    }


}
