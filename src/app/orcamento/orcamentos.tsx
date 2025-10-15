import CategoriaModal from "../components/CategoriaModal";
import styles from "./orcamentos.module.css"
import { categorias as categoriasFixas } from "../data/categorias";
import { Transacao } from "@/types/CriarContaInput";
import { useCategorias } from "@/contexts/CategoriaContext";
import { useTransacoes } from "@/contexts/TransacoesContext";
import { useOrcamentos } from "@/contexts/OrcamentosContext";
import { useToast } from "@/contexts/ToastContext";
import { useState } from "react";
import { useDisplayPreferences } from '@/contexts/DisplayPreferencesContext';
import { formatarValor } from "@/utils/formatarValor";


export default function Orcamento() {
    const { categorias } = useCategorias();
    const { transacoes } = useTransacoes();
    const { orcamentos, adicionarOrcamento, removerOrcamento, editarOrcamento } = useOrcamentos();
    const { showToast } = useToast();
    const {exibirAbreviado } = useDisplayPreferences();

    const [selectedCategoria, setSelectedCategoria] = useState<string>("");
    const [openModal, setOpenModal] = useState<null | 'categoria'>(null);
    const [editandoOrcamentoId, setEditandoOrcamentoId] = useState<number | null>(null);
    const [valorInput, setValorInput] = useState<number | "">("");

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (orcamentos.length >= 1 && editandoOrcamentoId === null) {
            showToast("Já existe um orçamento ativo. Edite ou remova antes de criar outro.", "warning");
            return;
        }

        if (!selectedCategoria) {
            showToast("Selecione uma categoria antes de criar o orçamento.", "danger");
            return;
        }

        const formData = new FormData(e.currentTarget);
        const valor = Number(formData.get("valor"));

        if (valor <= 0) {
            showToast("Informe um valor válido para o orçamento.", "danger");
            return;
        }

        adicionarOrcamento(selectedCategoria, valor);
        showToast("Orçamento criado com sucesso!", "success");

        e.currentTarget.reset();
        setSelectedCategoria("")
    };

    const calcularProgresso = (categoria: string, limite: number, transacoes: Transacao[]) => {
        const gasto = transacoes.filter((t: Transacao) => t.categoria.toLowerCase() === categoria.toLowerCase()).reduce((acc, t) => acc + t.valor, 0);

        const porcentagem = limite > 0 ? (gasto / limite) * 100 : 0;
        const restante = limite - gasto;

        return { gasto, restante, porcentagem };
    };

    const handleOpenCategoriaModal = () => setOpenModal("categoria");
    const handleCloseModal = () => setOpenModal(null);

    const handleSelectCategoria = (categorias: string[]) => {
        setSelectedCategoria(categorias[0] || "");
        handleCloseModal();
    };

    const displayCategorias = () => {
        if (!selectedCategoria) return "Categoria";
        return selectedCategoria;
    };

    const handleEdit = (e: React.FormEvent<HTMLFormElement>, id: number) => {
        e.preventDefault();

        if (!selectedCategoria) return;

        const formData = new FormData(e.currentTarget);
        const categoria = formData.get("categoria") as string || selectedCategoria;
        const valor = Number(formData.get("valor"))

        if (valor <= 0) return;

        editarOrcamento(id, categoria, valor);
        showToast("Orçamento editado com sucesso!", "success");

        setEditandoOrcamentoId(null);
        e.currentTarget.reset();
        setSelectedCategoria("");
        setValorInput("");

    }


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

    const totalOrcado = orcamentos.reduce((acc, o) => acc + o.valor, 0);
    const totalGasto = orcamentos.reduce((acc, o) => {
        const { gasto } = calcularProgresso(o.categoria, o.valor, transacoes);
        return acc + gasto
    }, 0);
    const saldoRestante = totalOrcado - totalGasto

    return (
        <div className={styles.main}>
            <div className={styles.cardBalancoMes}>
                <h5 className="fs-3"><i className="bi bi-pencil"></i>Balanço do mês</h5>

                <div className={styles.containerInfoValores}>
                    <div className={styles.cardInfoValor}>
                        <h5>Total Orçado</h5>
                        <p className="fs-5">{formatarValor(totalOrcado, exibirAbreviado)}</p>
                    </div>
                    <div className={styles.cardInfoValor}>
                        <h5>Total Gasto</h5>
                        <p className="fs-5 text-danger">{formatarValor(totalGasto, exibirAbreviado)}</p>
                    </div>
                    <div className={styles.cardInfoValor}>
                        <h5>Saldo Restante</h5>
                        <p className="fs-5 text-success">R$ {formatarValor(saldoRestante, exibirAbreviado)}</p>
                    </div>
                </div>
            </div>
            <div className={styles.cardAddOrcamento}>
                <h4>Novo Orçamento</h4>
                <form className="d-flex justify-content-between" onSubmit={(e) => {
                    if (editandoOrcamentoId !== null) {
                        handleEdit(e, editandoOrcamentoId);
                    } else {
                        handleSubmit(e);
                    }
                }}>
                    <div className={styles.grupoInputs}>
                        <div className={styles.inputCategoria}>
                            <label htmlFor="categoria">Categoria</label>
                            <button type="button" onClick={handleOpenCategoriaModal}>
                                {displayCategorias()}
                                <i className="bi bi-chevron-down"></i>
                            </button>
                        </div>
                        <div className={styles.inputValor}>
                            <label htmlFor="valor">Valor do Orçamento</label>
                            <input type="number" name="valor" placeholder="Insira um valor" value={valorInput} onChange={(e) => setValorInput(Number(e.target.value))} />
                        </div>
                        <div className={styles.inputButton}>
                            <button type="submit" className={`btn ${editandoOrcamentoId ? "btn-success" : "btn-primary"}`}>
                                {editandoOrcamentoId !== null ? "+ Salvar" : "+ Criar"}
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            <div className={styles.containerOrcamento}>
                {orcamentos.map((orcamento) => {
                    const { gasto, restante, porcentagem } = calcularProgresso(orcamento.categoria, orcamento.valor, transacoes);
                    return (
                        <div key={orcamento.id} className={`${styles.cardOrcamento} ${gasto > orcamento.valor ? styles.cardOrcamentoExcedente : ""}`}>
                            <div className={styles.headerOrcamento}>
                                <h5>{orcamento.categoria}</h5>
                                <div className={styles.iconsOrcamento}>
                                    <i className="bi bi-pencil iconPencil" onClick={() => { setSelectedCategoria(orcamento.categoria); setValorInput(orcamento.valor); setEditandoOrcamentoId(orcamento.id) }}></i>
                                    <i className="bi bi-trash iconTrash" onClick={() => removerOrcamento(orcamento.id)}></i>
                                </div>
                            </div>
                            <div className={styles.bodyOrcamento}>
                                <div className={styles.infoProgresso}>
                                    <h6>Progresso</h6>
                                    <p>{porcentagem.toFixed(0)}%</p>
                                </div>

                                <div className={styles.progressBar}>
                                    <div
                                        className={styles.progressFill}
                                        style={{ width: `${Math.min(porcentagem, 100)}%` }}
                                    />
                                </div>

                                <div className={styles.infoGasto}>
                                    <h6>Gasto:</h6>
                                    <p className="text-danger">{formatarValor(gasto, exibirAbreviado)}</p>
                                </div>

                                <div className={styles.infoOrcamento}>
                                    <h6>Orçamento:</h6>
                                    <p>{formatarValor(orcamento.valor, exibirAbreviado)}</p>
                                </div>

                                <div className={styles.infoRestante}>
                                    <h6>Restante:</h6>
                                    <p className="text-success">{formatarValor(restante, exibirAbreviado)}</p>
                                </div>

                                {gasto > orcamento.valor && (
                                    <div className={styles.infoMensagem}>
                                        <h6>Orçamento Excedido!</h6>
                                    </div>
                                )}
                            </div>

                        </div>
                    );
                })}
            </div>

            {
                openModal === 'categoria' && (
                    <CategoriaModal
                        multiple={false}
                        onClose={handleCloseModal}
                        onSelect={handleSelectCategoria}
                        categorias={categoriasCompletas}
                    />
                )
            }
        </div >
    )
}