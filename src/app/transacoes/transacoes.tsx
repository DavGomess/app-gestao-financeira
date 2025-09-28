import { useState } from "react";
import styles from "./transacoes.module.css";
import CategoriaModal from "../components/CategoriaModal";
import PeriodoModal from "../components/PeriodoModal";
import { ContaLocal, PeriodoSelecionado } from "@/types/CriarContaInput";
import { categorias as categoriasFixas } from "../data/categorias";
import { useCategorias } from "@/contexts/CategoriaContext";
import { useTransacoes } from "@/contexts/TransacoesContext";



export default function Transacoes() {
    const { categorias } = useCategorias();
    const { transacoes, setTransacoes } = useTransacoes();
    const [openModal, setOpenModal] = useState<null | "categoria" | "periodo">(null);
    const [selectedCategoria, setSelectedCategoria] = useState<string[]>([]);
    const [selectedPeriodo, setSelectedPeriodo] = useState<PeriodoSelecionado | null>(null);
    const [pesquisa, setPesquisa] = useState("");


    const transacoesFiltradas = transacoes.filter((t) => {
        const matchPesquisa = pesquisa === "" || t.nome.toLowerCase().includes(pesquisa.toLowerCase());

        const matchCategoria = selectedCategoria.length === 0 || selectedCategoria.includes(t.categoria);

        let matchPeriodo = true;
        if (selectedPeriodo) {
            const dataTransacao = new Date(t.data);

            if (selectedPeriodo.tipo === "predefinido" && selectedPeriodo.dias) {
                const limite = new Date();
                limite.setDate(limite.getDate() - selectedPeriodo.dias);
                matchPeriodo = dataTransacao >= limite;
            } else if (selectedPeriodo.tipo === "personalizado" && selectedPeriodo.inicio && selectedPeriodo.fim) {
                matchPeriodo = dataTransacao >= selectedPeriodo.inicio && dataTransacao <= selectedPeriodo.fim;
            }
        }

        return matchPesquisa && matchCategoria && matchPeriodo;
    });

    const handleOpenCategoriaModal = () => setOpenModal("categoria");
    const handleOpenPeriodoModal = () => setOpenModal("periodo");
    const handleCloseModal = () => setOpenModal(null);

    const handleSelectCategoria = (categorias: string[]) => {
        setSelectedCategoria(categorias);
        handleCloseModal();
    };

    const handleSelectPeriodo = (periodo: PeriodoSelecionado) => {
        setSelectedPeriodo(periodo);
        handleCloseModal();
    };

    const displayCategorias = () => {
        if (selectedCategoria.length === 0) return "Categoria";
        if (selectedCategoria.length === 1) return selectedCategoria[0];
        return `${selectedCategoria[0]}, +${selectedCategoria.length - 1}`;
    };

    const deletarConta = async (conta: ContaLocal) => {
        try {
            const res = await fetch(`http://localhost:4000/transacoes/${conta.id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setTransacoes((prev) => {
                    const atualizado = prev.filter((t) => t.id !== conta.id);
                    localStorage.setItem("transacoes", JSON.stringify(atualizado));
                    return atualizado;
                });
            } else {
                console.error("Erro ao deletar transação:", res.status);
            }
        } catch (error) {
            console.error("Erro ao deletar transação:", error);
        }
    };

    const categoriasCombinadas = {
        Receita: [
            ...categoriasFixas.Receita.filter(c => c !== "Todos"),
            ...categorias.filter(c => c.tipo === "receita").map(c => c.nome),
            "Todos"
        ],
        Despesa: [
            ...categoriasFixas.Despesa.filter(c => c !== "Todos"),
            ...categorias.filter(c => c.tipo === "despesa").map(c => c.nome),
            "Todos"
        ],
    };


    return (
        <div className={styles.main}>
            <div className={styles.cardFiltro}>
                <h2><i className="bi bi-funnel"></i> Filtros</h2>
                <form>
                    <div className={styles.groupInputs}>
                        <div className={styles.inputPesquisar}>
                            <label htmlFor="pesquisar"></label>
                            <i className="bi bi-search"></i>
                            <input
                                type="text"
                                id="pesquisar"
                                name="pesquisar"
                                placeholder="Pesquisar"
                                value={pesquisa}
                                onChange={(e) => setPesquisa(e.target.value)}
                            />
                        </div>
                        <div className={styles.inputPeriodo}>
                            <label htmlFor="periodo"></label>
                            <button type="button" onClick={handleOpenPeriodoModal}>
                                {selectedPeriodo
                                    ? selectedPeriodo.tipo === "predefinido"
                                        ? `Últimos ${selectedPeriodo.dias} dias`
                                        : `${selectedPeriodo.inicio?.toLocaleDateString("pt-BR")} - ${selectedPeriodo.fim?.toLocaleDateString("pt-BR")}`
                                    : "Periodo"}
                                <i className="bi bi-chevron-down"></i>
                            </button>
                        </div>
                        <div className={styles.inputCategoria}>
                            <label htmlFor="categoria"></label>
                            <button type="button" onClick={handleOpenCategoriaModal}>
                                {displayCategorias()}
                                <i className="bi bi-chevron-down"></i>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
            <div className={styles.cardTransacoes}>
                <h3 className="mb-3">Transações</h3>
                {transacoesFiltradas.length === 0 ? (
                    <p>Nenhuma transação encontrada...</p>
                ) : (
                    <ul className={styles.listaTransacoes}>
                        {transacoesFiltradas.map((conta) => (
                            <li key={conta.id} className={styles.itemTransacao}>
                                <div className={styles.infoTransacao}>
                                    <div className={styles.ladoEsquerdoTransacao}>
                                        <div className={styles.iconTransacao}>
                                            {categoriasCombinadas.Despesa.includes(conta.categoria) ? (
                                                <i className="bi bi-arrow-down iconArrowDown"></i>
                                            ) : (
                                                <i className="bi bi-arrow-up iconArrowUp"></i>
                                            )}
                                        </div>
                                        <div className={styles.textosTransacao}>
                                            <h6>{conta.nome}</h6>
                                            <p>{conta.categoria}</p>
                                        </div>
                                        <div className={styles.dataTransacao}>
                                            <span>{new Date(conta.data).toLocaleDateString("pt-BR")}</span>
                                        </div>
                                    </div>
                                    <div className={styles.ladoDireitoTransacao}>
                                        <div className={styles.valorTransacao}>
                                            {categoriasCombinadas.Despesa.includes(conta.categoria) ? (
                                                <h5 className={styles.vermelhoTextoValor}>-R$ {conta.valor}</h5>
                                            ) : (
                                                <h5 className={styles.verdeTextoValor}>+R$ {conta.valor}</h5>
                                            )}
                                            <i
                                                className="bi bi-trash iconTrash"
                                                onClick={() =>
                                                    deletarConta({
                                                        id: conta.id,
                                                        nome: conta.nome,
                                                        categoria: conta.categoria,
                                                        data: conta.data,
                                                        valor: conta.valor,
                                                        status: "pendente",
                                                    })
                                                }
                                            ></i>
                                        </div>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            {openModal === "periodo" && (
                <PeriodoModal onClose={handleCloseModal} onSelect={handleSelectPeriodo} />
            )}
            {openModal === "categoria" && (
                <CategoriaModal
                    onClose={handleCloseModal}
                    onSelect={handleSelectCategoria}
                    categorias={categoriasCombinadas}
                />
            )}
        </div>
    );
}