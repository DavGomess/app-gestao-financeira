import { useCategorias } from "../../contexts/CategoriaContext";
import styles from "./categorias.module.css";
import { useToast } from "../../contexts/ToastContext";
import React from "react";
import { nomesFixosReceita, nomesFixosDespesa } from "../data/categorias";

export default function Categorias() {
    const { categorias, addCategoria, deletarCategoria } = useCategorias();
    const { showToast } = useToast();

    const categoriasReceita = [
        ...nomesFixosReceita,
        ...categorias
            .filter(c => c.tipo === "receita" && c.nome !== "Todos")
            .filter(c => !nomesFixosReceita.includes(c.nome))
            .map(c => c.nome),
    ];

    const categoriasDespesa = [
        ...nomesFixosDespesa,
        ...categorias
            .filter(c => c.tipo === "despesa" && c.nome !== "Todos")
            .filter(c => !nomesFixosDespesa.includes(c.nome))
            .map(c => c.nome),
    ];

    const handleAdd = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const nomeRaw = form.nome.value.trim();
        const tipo = form.tipo.value.trim().toLowerCase();
        if (!nomeRaw || !tipo) return;

        const nomeLower = nomeRaw.toLowerCase();

        const fixas = tipo === "receita" ? nomesFixosReceita : nomesFixosDespesa;
        if (fixas.some(f => f.toLowerCase() === nomeLower)) {
            showToast("Esta categoria fixa já existe!", "danger");
            return;
        }

        if (categorias.some(c => c.nome.toLowerCase() === nomeLower)) {
            showToast("Esta categoria já existe em outro tipo!", "danger");
            return;
        }
        
        try {
            await addCategoria(nomeLower, tipo); 
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
                        {categoriasReceita.map((nome) => {
                            const isFixa = nomesFixosReceita.includes(nome);
                            const categoriaObj = !isFixa ? categorias.find(c => c.nome === nome && c.tipo === "receita") : null;
                            return (
                                <li key={isFixa ? `fixa-${nome}` : categoriaObj!.id} className={styles.renderizacaoItemReceita}>
                                    {nome}
                                    {!isFixa && categoriaObj && (
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
                        {categoriasDespesa.map((nome) => {
                            const isFixa = nomesFixosDespesa.includes(nome);
                            const categoriaObj = !isFixa ? categorias.find(c => c.nome === nome && c.tipo === "despesa") : null;
                            return (
                                <li key={isFixa ? `fixa-${nome}` : categoriaObj!.id} className={styles.renderizacaoItemDespesa}>
                                    {nome}
                                    {!isFixa && categoriaObj && (
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
