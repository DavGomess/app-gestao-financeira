// import { Transacao } from "@/types/CriarContaInput";
import styles from "./metas.module.css"
import { useCategorias } from "@/contexts/CategoriaContext";
// import { useTransacoes } from "@/contexts/TransacoesContext";
import { useMetas } from "@/contexts/MetasContext";
import { useState } from "react";
import CategoriaModal from "../components/CategoriaModal";
import { categorias as categoriasFixas } from "../data/categorias";
import DatePicker from "react-datepicker";


export default function Metas() {
    const { categorias } = useCategorias();
    // const { transacoes } = useTransacoes();
    const { metas, adicionarMeta, removerMeta, adicionarValorMeta } = useMetas();
    const [titulo, setTitulo] = useState("");
    const [valorDesejado, setValorDesejado] = useState<string>("");
    const [openModal, setOpenModal] = useState<null | 'categoria'>(null);
    const [selectedCategoria, setSelectedCategoria] = useState<string>("");
    const [novaData, setNovaData] = useState<Date | null>(null);
    const [valorAdicionar, setValorAdicionar] = useState<Record<number, string>>({});


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        adicionarMeta({
            titulo,
            categoria: selectedCategoria,
            valor: Number(valorDesejado),
            valorAtual: 0,
            prazo: novaData ? novaData.toISOString() : "",
        });
        setTitulo("");
        setValorDesejado("");
        setSelectedCategoria("");
        setNovaData(null);
    }

    const handleAdicionarValor = (metaId: number) => {
        const valorDigitado = valorAdicionar[metaId] ?? "";
        const valor = valorDigitado === "" ? 0 : Number(valorDigitado.replace(",", "."));

        if (isNaN(valor) || valor <= 0) return;

        adicionarValorMeta(metaId, valor);
        setValorAdicionar((prev) => ({ ...prev, [metaId]: "" }))
    }

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

    return (
        <div className={styles.main}>
            <div className={styles.cardNovaMeta}>
                <h3><i className="bi bi-bullseye"></i>Criar Nova Meta</h3>
                <form className={styles.formularioNovaMeta} onSubmit={handleSubmit}>
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
                            />
                        </div>
                    </div>
                    <button className="btn btn-primary" type="submit">+ Criar</button>
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
                                    <h6 className="m-0">{meta.categoria}</h6>
                                </div>
                                <div className={styles.iconsMetas}>
                                    <i className="bi bi-pencil iconPencil"></i>
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
                                        }))} />
                                    </div>
                                    <button className="btn btn-primary h-50" onClick={() => handleAdicionarValor(meta.id)} type="button">+ adicionar</button>
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
                                            <span className="text-black">Prazo:</span>
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
                        categorias={categoriasCompletas}
                    />
                )
            }
        </div>
    )
}