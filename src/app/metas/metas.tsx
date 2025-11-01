import styles from "./metas.module.css"
import { useCategorias } from "../../contexts/CategoriaContext";
import { useMetas } from "../../contexts/MetasContext";
import { useToast } from "../../contexts/ToastContext"
import { useState } from "react";
import CategoriaModal from "../components/CategoriaModal";
import DatePicker from "react-datepicker";
import { MetaLocal } from "../../types";


export default function Metas() {
    const { categorias } = useCategorias();
    const { metas, adicionarMeta, removerMeta, editarMeta, adicionarValorMeta } = useMetas();
    const { showToast } = useToast();
    const [titulo, setTitulo] = useState("");
    const [valorDesejado, setValorDesejado] = useState<string>("");
    const [openModal, setOpenModal] = useState<null | 'categoria'>(null);
    const [selectedCategoria, setSelectedCategoria] = useState<string>("");
    const [novaData, setNovaData] = useState<Date | null>(null);
    const [valorAdicionar, setValorAdicionar] = useState<Record<number, string>>({});
    const [editandoMetaId, setEditandoMetaId] = useState<number | null>(null);
    const [modoEdicao, setModoEdicao] = useState(false);

    const categoriaMap = new Map<string, number>();
    categorias.forEach(c => categoriaMap.set(c.nome, c.id));

    const resetForm = () => {
        setTitulo("");
        setValorDesejado("");
        setSelectedCategoria("");
        setNovaData(null);
    };

    const displayCategoriaNome = (categoriaId: number | null) => {
        if (categoriaId === null) return "Sem categoria";
        const cat = categorias.find(c => c.id === categoriaId);
        return cat?.nome ?? "Desconhecida";
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const categoriaId = categoriaMap.get(selectedCategoria) ?? null;
        try {
            await adicionarMeta({
                titulo,
                categoriaId,
                valor: Number(valorDesejado),
                prazo: novaData!.toISOString(),
            });
            showToast("Meta criada!", "success");
            resetForm();
        } catch {
            showToast("Erro ao criar", "danger");
        }
    }

    const handleAdicionarValor = async (metaId: number) => {
        const valorDigitado = valorAdicionar[metaId] ?? "";
        const valor = valorDigitado === "" ? 0 : Number(valorDigitado.replace(",", "."));

        if (isNaN(valor) || valor <= 0) return;

        try {
            await adicionarValorMeta(metaId, valor); // ← await
            setValorAdicionar(prev => ({ ...prev, [metaId]: "" }));
            showToast("Valor adicionado!", "success");
        } catch {
            showToast("Erro ao adicionar valor", "danger");
        }
    };

    const handleOpenCategoriaModal = () => setOpenModal("categoria");
    const handleCloseModal = () => setOpenModal(null);

    const handleSelectCategoria = (categorias: string[]) => {
        setSelectedCategoria(categorias[0] || "");
        handleCloseModal();
    };

    const categoriasParaModal = {
    Receita: categorias.filter(c => c.tipo === "receita").map(c => c.nome),
    Despesa: categorias.filter(c => c.tipo === "despesa").map(c => c.nome),
};

    const displayCategorias = () => {
        if (!selectedCategoria) return "Categoria";
        return selectedCategoria;
    };

    const calcularProgresso = (valorAtual: number, limite: number) => {
        const porcentagem = limite > 0 ? (valorAtual / limite) * 100 : 0;
        const restante = limite - valorAtual;
        return { restante, porcentagem }
    }

    function calcularDiasRestantes(prazo?: string | Date | null): number {
        if (!prazo) return Infinity;

        const data = prazo instanceof Date ? new Date(prazo) : new Date(prazo);
        if (Number.isNaN(data.getTime())) return Infinity;

        const msPorDia = 24 * 60 * 60 * 1000;
        const hoje = new Date();
        const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
        const inicioPrazo = new Date(data.getFullYear(), data.getMonth(), data.getDate());

        const diffDias = Math.ceil((inicioPrazo.getTime() - inicioHoje.getTime()) / msPorDia);
        return diffDias;
    };

    const handleEditClick = (meta: MetaLocal) => {
        setModoEdicao(true);
        setEditandoMetaId(meta.id);
        setTitulo(meta.titulo);
        setSelectedCategoria(displayCategoriaNome(meta.categoriaId));
        setValorDesejado(meta.valor.toString());
        setNovaData(meta.prazo ? new Date(meta.prazo) : null);
    }

    const handleEdit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editandoMetaId) return;
        const categoriaId = categoriaMap.get(selectedCategoria) ?? null;
        const metaAtualizada: MetaLocal = {
            id: editandoMetaId,
            titulo,
            categoriaId,
            valor: Number(valorDesejado),
            valorAtual: metas.find(m => m.id === editandoMetaId)?.valorAtual ?? 0,
            prazo: novaData!.toISOString(),
        };
        try {
            await editarMeta(metaAtualizada);
            showToast("Meta editada!", "success");
            resetForm();
            setModoEdicao(false);
            setEditandoMetaId(null);
        } catch {
            showToast("Erro ao editar", "danger");
        }
    }

    return (
        <div className={styles.main}>
            <div className={styles.cardNovaMeta}>
                <h2><i className="bi bi-bullseye"></i>Criar Nova Meta</h2>
                <form className={styles.formularioNovaMeta} onSubmit={(e) => {
                    if (modoEdicao) {
                        handleEdit(e);
                    } else {
                        handleSubmit(e);
                    }
                }}>
                    <div className={styles.infoNovaMeta}>
                        <div className={styles.grupoInput}>
                            <label htmlFor="titulo">Título</label>
                            <input type="text" required value={titulo} onChange={(e) => setTitulo((e.target.value))} />
                        </div>
                        <div className={styles.inputCategoria}>
                            <label htmlFor="categoria">Categoria</label>
                            <button type="button" onClick={handleOpenCategoriaModal}>
                                {displayCategorias()}
                                <i className="bi bi-chevron-down"></i>
                            </button>
                        </div>
                    </div>

                    <div className={styles.infoNovaMeta}>
                        <div className={styles.grupoInput}>
                            <label htmlFor="valorDesejado">Valor Desejado</label>
                            <input type="number" required value={valorDesejado} onChange={(e) => setValorDesejado(e.target.value)} />
                        </div>
                        <div className={styles.grupoInput}>
                            <label htmlFor="prazo">Prazo</label>
                            <DatePicker
                                selected={novaData}
                                onChange={(date: Date | null) => setNovaData(date)}
                                dateFormat="dd/MM/yyyy"
                                className={styles.inputEditar}
                                required
                            />
                        </div>
                    </div>
                    <button className={`btn ${modoEdicao ? "btn-success" : "btn-primary"}`} type="submit">
                        {modoEdicao ? "+ Salvar" : "+ Criar"}
                    </button>
                </form>
            </div>
            <div className={styles.containerCardsMetas}>
                {metas.map((meta) => {
                    const { porcentagem } = calcularProgresso(meta.valorAtual, meta.valor);
                    return (
                        <div key={meta.id} className={styles.cardMetas}>
                            <div className={styles.headerMetas}>
                                <h5 className="m-0">{meta.titulo}</h5>
                                <div className={styles.categoriaMetas}>
                                    <h6 className="m-0">{displayCategoriaNome(meta.categoriaId)}</h6>
                                </div>
                                <div className={styles.iconsMetas}>
                                    <i className="bi bi-pencil iconPencil" onClick={() => handleEditClick(meta)}></i>
                                    <i className="bi bi-trash iconTrash" onClick={() => removerMeta(meta.id)}></i>
                                </div>
                            </div>
                            <div className={styles.bodyMetas}>
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
                                <div className={styles.containerValoresMetas}>
                                    <div>
                                        <label htmlFor="valor">Valor adicionar</label>
                                        <input type="number" value={valorAdicionar[meta.id] ?? ""} onChange={(e) => setValorAdicionar((prev) => ({
                                            ...prev,
                                            [meta.id]: (e.target.value)
                                        }))}
                                            disabled={meta.valorAtual >= meta.valor || calcularDiasRestantes(meta.prazo) <= 0}
                                        />
                                    </div>
                                    <button
                                        className="btn btn-primary h-50"
                                        onClick={() => handleAdicionarValor(meta.id)}
                                        type="button"
                                        disabled={meta.valorAtual >= meta.valor || calcularDiasRestantes(meta.prazo) <= 0}
                                    >+ adicionar</button>
                                    <div>
                                        <label htmlFor="meta">Meta</label>
                                        <input type="number" value={meta.valor} disabled />
                                    </div>
                                </div>
                                <div className={styles.linhaDivisoria}><hr /></div>
                                <div className={styles.containerPrazoMetas}>
                                    {meta.valorAtual >= meta.valor ? (
                                        <h6 className={styles.metaConcluida}>
                                            🎉 Parabéns, meta concluída!
                                        </h6>
                                    ) : calcularDiasRestantes(meta.prazo) <= 0 ? (
                                        <h6 className={styles.prazoEncerrado}>
                                            ⚠️ Prazo Encerrado!
                                        </h6>
                                    ) : (
                                        <h6 className={calcularDiasRestantes(meta.prazo) <= 3 ? styles.diasRestantesAlerta : styles.diasRestantesNormal}>
                                            <span>Prazo:</span>
                                            {calcularDiasRestantes(meta.prazo)} dias restantes
                                        </h6>
                                    )
                                    }
                                </div>
                            </div>
                        </div>
                    )
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
        </div>
    )
}