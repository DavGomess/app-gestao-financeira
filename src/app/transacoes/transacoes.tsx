import { useState, useEffect } from "react";
import styles from "./transacoes.module.css";
import CategoriaModal from "../components/CategoriaModal";
import PeriodoModal from "../components/PeriodoModal";
import { PeriodoSelecionado, TransacaoLocal } from "../../types";
import { categorias as categoriasFixas } from "../data/categorias";
import { useCategorias } from "../../contexts/CategoriaContext";
import { useTransacoes } from "../../contexts/TransacoesContext";
import { useDisplayPreferences } from '../../contexts/DisplayPreferencesContext';
import { formatarValor } from "../../utils/formatarValor";
import { useToast } from "../../contexts/ToastContext";


export default function Transacoes() {
    const { categorias } = useCategorias();
    const { transacoes, setTransacoes } = useTransacoes();
    const { showToast } = useToast();
    const [openModal, setOpenModal] = useState<null | "categoria" | "periodo">(null);
    const [selectedCategoria, setSelectedCategoria] = useState<string[]>([]);
    const [selectedPeriodo, setSelectedPeriodo] = useState<PeriodoSelecionado | null>(null);
    const [pesquisa, setPesquisa] = useState("");
    const { exibirAbreviado } = useDisplayPreferences();


    useEffect(() => {
        const carregarTodas = async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                const res = await fetch("http://localhost:4000/transacoes", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.ok) {
                    const data: TransacaoLocal[] = await res.json();
                    setTransacoes(data);
                    localStorage.setItem("transacoes", JSON.stringify(data));
                }
            } catch {
                showToast("Erro ao carregar transações", "danger");
            }
        };
        carregarTodas();
    }, [setTransacoes, showToast]);

    useEffect(() => {
        if (!pesquisa) return;

        setSelectedCategoria([]);
        setSelectedPeriodo(null);

        const timer = setTimeout(async () => {
            const token = localStorage.getItem("token");
            if (!token) return;

            try {
                const res = await fetch(
                    `http://localhost:4000/transacoes/filtrar?termo=${encodeURIComponent(pesquisa)}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                if (res.ok) {
                    const data: TransacaoLocal[] = await res.json();
                    setTransacoes(data);
                }
            } catch {
                showToast("Erro na pesquisa", "danger");
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [pesquisa, setTransacoes, showToast]);

    const transacoesFiltradas = transacoes.filter((t) => {
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

        return matchCategoria && matchPeriodo;
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
                <div className={styles.containerFiltro}>
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
                                            <h6>{conta.contaNome}</h6>
                                            <p>{conta.categoria} • {conta.status}</p>
                                        </div>
                                        <div className={styles.dataTransacao}>
                                            <span>{new Date(conta.data).toLocaleDateString("pt-BR")}</span>
                                        </div>
                                    </div>
                                    <div className={styles.ladoDireitoTransacao}>
                                        <div className={styles.valorTransacao}>
                                            {categoriasCombinadas.Despesa.includes(conta.categoria) ? (
                                                <h5 className={styles.vermelhoTextoValor}>- {formatarValor(conta.valor, exibirAbreviado)}</h5>
                                            ) : (
                                                <h5 className={styles.verdeTextoValor}>+ {formatarValor(conta.valor, exibirAbreviado)}</h5>
                                            )}
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