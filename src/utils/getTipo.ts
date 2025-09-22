import { categorias as categoriasFixas } from "../app/data/categorias";

export function getTipo(categoria: string): "receita" | "despesa" {
    return categoriasFixas.Receita.includes(categoria) ? "receita" : "despesa";
}