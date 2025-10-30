import { useCategorias } from "../../contexts/CategoriaContext";
import styles from "./categorias.module.css";
import { categorias as categoriasFixas } from "../data/categorias";
import { useToast } from "../../contexts/ToastContext";
import React from "react";

export default function Categorias() {
    const { categorias, addCategoria, deletarCategoria } = useCategorias();
    const { showToast } = useToast();

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

    const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const nome = form.nome.value.trim();
        const tipo = form.tipo.value.trim();
        if (!nome || !tipo) return;
        
        try {
            await addCategoria(nome, tipo); 
            showToast("Categoria criada com sucesso!", "success");
            form.reset();
        } catch {
            showToast("Erro ao criar categoria", "danger");
        }
    };

    const handleDeletar = async (categoria: { id: number }) => {
        try {
            await deletarCategoria(categoria.id);
            showToast("Categoria deletada!", "success");
        } catch {
            showToast("Erro ao deletar", "danger");
        }
};

    return (
        <div className={styles.main}>
            <div className={styles.cardAddCategorias}>
                <h2 className="fs-3"><i className="bi bi-tags"></i>Adicionar Nova Categoria</h2>
                <form onSubmit={handleAdd}>
                    <div className={styles.infoAddCategorias}>
                        <input type="text" placeholder="Insira o nome" name="nome" required />
                        <div className={styles.infoTipoCategorias}>
                        <select className="form-select" defaultValue="" name="tipo" required>
                            <option value="" disabled>Selecione a Categoria</option>
                            <option value="receita">Receita</option>
                            <option value="despesa">Despesa</option>
                        </select>
                        <i
                                    className="bi bi-chevron-down"
                                    style={{
                                        position: "absolute",
                                        right: "0.75rem",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        pointerEvents: "none",
                                        color: "var(--icon-color",
                                    }}
                                ></i>
                        </div>
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
                        {categoriasCompletas.Receita.map((nome) => {
                            const categoriaObj = categorias.find(c => c.nome === nome && c.tipo === "receita");
                            const key = categoriaObj?.id ?? nome;
                            return (
                                <li key={key} className={styles.renderizacaoItemReceita}>
                                    {nome}
                                    {categoriaObj && (
                                        <button 
                                            className="btn p-0"
                                            onClick={() => handleDeletar(categoriaObj)}>
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
                        {categoriasCompletas.Despesa.map((nome) => {
                            const categoriaObj = categorias.find(c => c.nome === nome && c.tipo === "despesa");
                            const key = categoriaObj?.id ?? nome;
                            return (
                                <li key={key} className={styles.renderizacaoItemDespesa}>
                                    {nome}
                                    {categoriaObj && (
                                        <button
                                            className="btn p-0"
                                            onClick={() => handleDeletar(categoriaObj)}>
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
