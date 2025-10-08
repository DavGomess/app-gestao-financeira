import { useCategorias } from "@/contexts/CategoriaContext";
import styles from "./categorias.module.css";
import { categorias as categoriasFixas } from "../data/categorias";

export default function Categorias() {
    const { categorias, addCategoria, deletarCategoria } = useCategorias();

    const categoriasCompletas = {
        Receita: [
            ...categoriasFixas.Receita.filter((c) => c !== "Todos"),
            ...categorias.filter((c) => c.tipo === "receita").map((c) => c.nome),
        ],
        Despesa: [
            ...categoriasFixas.Despesa.filter((c) => c !== "Todos"),
            ...categorias.filter((c) => c.tipo === "despesa").map((c) => c.nome),
        ],
    };

    const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const nome = form.nome.value.trim();
        const tipo = form.tipo.value.trim();
        if (!nome || !tipo) return;
        addCategoria({ nome, tipo });
        form.reset();
    };

    return (
        <div className={styles.main}>
            <div className={styles.cardAddCategorias}>
                <h2 className="fs-3"><i className="bi bi-tags"></i>Adicionar Nova Categoria</h2>
                <form onSubmit={handleAdd}>
                    <div className={styles.infoAddCategorias}>
                        <input type="text" placeholder="Insira o nome" name="nome" required />
                        <select className="form-select w-25 h-25" defaultValue="" name="tipo" required>
                            <option value="" disabled>Selecione a Categoria</option>
                            <option value="receita">Receita</option>
                            <option value="despesa">Despesa</option>
                        </select>
                        <button className={styles.buttonAdd} type="submit">+ Adicionar</button>
                    </div>
                </form>
            </div>

            <div className={styles.containerCategorias}>
                <div className={styles.categoriasReceitas}>
                    <div className='d-flex gap-2'>
                        <i className="bi bi-arrow-up iconArrowUp"></i>
                        <h2>Categorias de Receitas</h2>
                    </div>
                    <ul className={styles.renderizacaoTodasCategorias}>
                        {categoriasCompletas.Receita.map((categoria, index) => {
                            const categoriaObj = categorias.find(c => c.nome === categoria && c.tipo === "receita");
                            return (
                                <li key={index} className={styles.renderizacaoItemReceita}>
                                    {categoria}
                                    {categoriaObj && (
                                        <button 
                                            className="btn p-0"
                                            onClick={() => deletarCategoria(categoriaObj)}>
                                            <i className="bi bi-trash iconTrash"></i>
                                        </button>
                                    )}
                                </li>
                            )
                            
                        })}
                    </ul>
                </div>

                <div className={styles.categoriasDespesas}>
                    <div className='d-flex gap-2'>
                        <i className="bi bi-arrow-down iconArrowDown"></i>
                        <h2>Categorias de Despesas</h2>
                    </div>
                    <ul className={styles.renderizacaoTodasCategorias}>
                        {categoriasCompletas.Despesa.map((categoria, index) => {
                            const categoriaObj = categorias.find(c => c.nome === categoria && c.tipo === "despesa");
                            return (
                                <li key={index} className={styles.renderizacaoItemDespesa}>
                                    {categoria}
                                    {categoriaObj && (
                                        <button
                                            className="btn p-0"
                                            onClick={() => deletarCategoria(categoriaObj)}>
                                            <i className="bi bi-trash iconTrash"></i>
                                        </button>
                                    )}
                                </li>
                            )
                        })}
                    </ul>
                </div>
            </div>
        </div>
    );
}
