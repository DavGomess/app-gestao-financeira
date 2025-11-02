import CategoriaModal from "../components/CategoriaModal";
import styles from "./orcamentos.module.css"
import { useCategorias } from "../../contexts/CategoriaContext";
import { useTransacoes } from "../../contexts/TransacoesContext";
import { useOrcamentos } from "../../contexts/OrcamentosContext";
import { useToast } from "../../contexts/ToastContext";
import { useState } from "react";
import { useDisplayPreferences } from '../../contexts/DisplayPreferencesContext';
import { formatarValor } from "../../utils/formatarValor";


export default function Orcamento() {
    const { categorias } = useCategorias();
    const { transacoes } = useTransacoes();
    const { orcamentos, upsert, remover } = useOrcamentos();
    const { showToast } = useToast();
    const { exibirAbreviado } = useDisplayPreferences();

    const [selectedCategoria, setSelectedCategoria] = useState<string>("");
    const [openModal, setOpenModal] = useState<null | 'categoria'>(null);
    const [editandoOrcamentoId, setEditandoOrcamentoId] = useState<number | null>(null);
    const [valorInput, setValorInput] = useState<number | "">("");

    const categoriaMap = new Map<string, number>();
    categorias.forEach(c => categoriaMap.set(c.nome, c.id));

    const categoriasParaModal = {
        Receita: categorias.filter(c => c.tipo === "receita").map(c => c.nome),
        Despesa: categorias.filter(c => c.tipo === "despesa").map(c => c.nome),
    };

    const calcularProgresso = (categoriaId: number, limite: number) => {
        const cat = categorias.find(c => c.id === categoriaId);
        if (!cat) return { gasto: 0, restante: limite, porcentagem: 0, nome: "Desconhecida" };

        const gasto = transacoes.filter(t => t.categoriaId === categoriaId).reduce((acc, t) => acc + t.valor, 0);

        const porcentagem = limite > 0 ? (gasto / limite) * 100 : 0;
        const restante = limite - gasto;

        return { gasto, restante, porcentagem, nome: cat.nome };
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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const categoriaId = categoriaMap.get(selectedCategoria);
        if (!categoriaId) {
            showToast("Selecione uma categoria válida", "danger");
            return;
        }

        const valor = Number(e.currentTarget.valor.value);
        if (valor <= 0) {
            showToast("Informe um valor válido", "danger");
            return;
        }

        try {
            await upsert(categoriaId, valor);
            showToast("Orçamento salvo com sucesso!", "success");
            e.currentTarget.reset();
            setSelectedCategoria("");
            setValorInput("");
            setEditandoOrcamentoId(null);
        } catch {
            showToast("Erro ao salvar orçamento", "danger");
        }
    };

    const handleEditClick = (orcamento: typeof orcamentos[0]) => {
        const cat = categorias.find(c => c.id === orcamento.categoriaId);
        if (!cat) return;
        setSelectedCategoria(cat.nome);
        setValorInput(orcamento.valor);
        setEditandoOrcamentoId(orcamento.categoriaId);
    };

    const handleRemover = async (categoriaId: number) => {
        if (!confirm("Tem certeza que deseja remover este orçamento?")) return;
        try {
            await remover(categoriaId);
            showToast("Orçamento removido", "success");
        } catch {
            showToast("Erro ao remover", "danger");
        }
    };

    const totalOrcado = orcamentos.reduce((acc, o) => acc + o.valor, 0);
    const totalGasto = orcamentos.reduce((acc, o) => {
        const { gasto } = calcularProgresso(o.categoriaId, o.valor);
        return acc + gasto;
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
                <form className="d-flex justify-content-between" onSubmit={handleSubmit}>
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
                            <input type="number" name="valor" placeholder="Insira um valor" value={valorInput} onChange={(e) => setValorInput(e.target.value === "" ? "" : Number(e.target.value))} />
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
                    const { gasto, restante, porcentagem, nome } = calcularProgresso(orcamento.categoriaId, orcamento.valor);
                    const excedido = gasto > orcamento.valor;
                    return (
                        <div
                            key={orcamento.id}
                            className={`${styles.cardOrcamento} ${excedido ? styles.cardOrcamentoExcedente : ""}`}
                        >
                            <div className={styles.headerOrcamento}>
                                <h5>{nome}</h5>
                                <div className={styles.iconsOrcamento}>
                                    <i
                                        className="bi bi-pencil iconPencil"
                                        onClick={() => handleEditClick(orcamento)}
                                    ></i>
                                    <i
                                        className="bi bi-trash iconTrash"
                                        onClick={() => handleRemover(orcamento.categoriaId)}
                                    ></i>
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

                                {excedido && (
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
                        categorias={categoriasParaModal}
                    />
                )
            }
        </div >
    )
}