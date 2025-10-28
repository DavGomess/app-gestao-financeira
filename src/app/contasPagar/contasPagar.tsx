import { useEffect, useState } from "react";
import styles from "./contasPagar.module.css"
import { ContaLocal } from "../../types";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { definirStatus, StatusConta } from "../../utils/status";
import { categorias as categoriasFixas } from "../data/categorias";
import { useCategorias } from "../../contexts/CategoriaContext";
import CategoriaModal from "../components/CategoriaModal";
import { useTransacoes } from "../../contexts/TransacoesContext";
import { useToast } from "../../contexts/ToastContext";
import { ContaFromAPI } from "../../types";

export default function ContasPagar() {
    const { categorias } = useCategorias();
    const { setTransacoes } = useTransacoes();
    const { showToast } = useToast();
    const [contas, setContas] = useState<ContaLocal[]>([])
    const [selectedConta, setSelectedConta] = useState<ContaLocal | null>(null)
    const [isEditing, setIsEditing] = useState(false);
    const [novaData, setNovaData] = useState<Date | null>(null);
    const [selectedCategoria, setSelectedCategoria] = useState<string>("");
    const [openModal, setOpenModal] = useState<null | 'categoria'>(null);
    const [selectedCategoriaId, setSelectedCategoriaId] = useState<number | null>(null);
    const [editCategoriaId, setEditCategoriaId] = useState<number | null>(null);

    const handleOpenCategoriaModal = () => setOpenModal('categoria');
    const handleCloseModal = () => setOpenModal(null);

    const handleSelectCategoria = (categoriasSelecionadas: string[]) => {
        const nomeCategoria = categoriasSelecionadas[0];
        if (!nomeCategoria) {
            handleCloseModal();
            return;
        }

        const categoria = categorias.find(c => c.nome === nomeCategoria);
        if (!categoria) {
            showToast("Categoria não encontrada", "danger");
            handleCloseModal();
            return;
        }

        if (isEditing && selectedConta) {
            setSelectedConta({
                ...selectedConta,
                categoria: nomeCategoria,
                categoriaId: categoria.id,
            });
            setEditCategoriaId(categoria.id);
        } else {
            setSelectedCategoriaId(categoria.id);
            setSelectedCategoria(nomeCategoria);
        }

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

    useEffect(() => {
        const contasLocal = localStorage.getItem("contas");
        if (contasLocal) {
            setContas(JSON.parse(contasLocal))
        }

        const carregarBanco = async () => {
            const token = localStorage.getItem("token");
            const res = await fetch("http://localhost:4000/contasPagar", {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (res.ok) {
                const contasBanco: ContaFromAPI[] = await res.json();

                const isStatusValid = (s: string): s is StatusConta =>
                    s === "pendente" || s === "paga" || s === "vencida";

                const contasFormatadas: ContaLocal[] = contasBanco.map((c) => {
                    if (!isStatusValid(c.status)) {
                        throw new Error(`Status inválido: ${c.status}`);
                    }

                    return {
                        id: c.id,
                        nome: c.nome,
                        valor: c.valor,
                        data: c.data,
                        status: c.status,
                        statusAnterior: c.statusAnterior as StatusConta | undefined,
                        categoria: c.categoria?.nome || "Sem categoria",
                        categoriaId: c.categoriaId,
                    };
                });

                setContas(contasFormatadas);
                localStorage.setItem("contas", JSON.stringify(contasFormatadas));
            }
        };
        carregarBanco();
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);
        const dataConta = novaData ? novaData.toISOString() : "";

        if (!selectedCategoriaId) {
            showToast("Selecione uma categoria", "danger");
            return;
        }

        const conta = {
            nome: formData.get("nome") as string,
            valor: Number(formData.get("valor")),
            categoriaId: selectedCategoriaId,
            data: dataConta,
        };

        const token = localStorage.getItem("token");
        if (!token) {
            showToast("Token não encontrado", "danger");
            return;
        }

        const res = await fetch("http://localhost:4000/contasPagar", {
            method: "POST",
            body: JSON.stringify(conta),
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
        });

        if (res.ok) {
            const contaSalva = await res.json();
            const contasAtualizadas = [...contas, contaSalva];
            setContas(contasAtualizadas)
            localStorage.setItem("contas", JSON.stringify(contasAtualizadas));

            const categoriaObj = categorias.find(c => c.id === contaSalva.categoriaId);
            const novaTransacao = {
                valor: contaSalva.valor,
                tipo: categoriaObj?.tipo || "despesa",
                data: contaSalva.data,
                status: contaSalva.status,
                categoriaId: contaSalva.categoriaId,
                userId: contaSalva.userId
            };

            const transacaoRes = await fetch("http://localhost:4000/transacoes", {
                method: "POST",
                body: JSON.stringify(novaTransacao),
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (transacaoRes.ok) {
                const transacaoSalva = await transacaoRes.json();
                setTransacoes((prev) => {
                    const atualizadas = [...prev, transacaoSalva];
                    localStorage.setItem("transacoes", JSON.stringify(atualizadas));
                    return atualizadas;
                });
            }

            showToast("Conta criada com sucesso!", "success");
            form.reset();
            setNovaData(null);
            setSelectedCategoria("");
        } else {
            const erro = await res.json();
            showToast(erro.error || "Erro ao criar conta", "danger");
        }
    };

    const toggleStatus = async (conta: ContaLocal) => {
        const statusAnterior = conta.status;
        let novoStatus: "paga" | "pendente" | "vencida" = statusAnterior;

        if (statusAnterior === "pendente" || statusAnterior === "vencida") {
            novoStatus = "paga";
        } else if (statusAnterior === "paga") {
            novoStatus = conta.statusAnterior || "pendente";
        }

        const contasAtualizadas = contas.map(c => c.id === conta.id ? { ...c, status: novoStatus, statusAnterior } : c);

        setContas(contasAtualizadas);
        localStorage.setItem("contas", JSON.stringify(contasAtualizadas))

        const token = localStorage.getItem("token");
        if (!token) {
            showToast("Erro: token não encontrado", "danger");
            return;
        }

        const res = await fetch(`http://localhost:4000/contasPagar/${conta.id}`, {
            method: "PUT",
            body: JSON.stringify({ status: novoStatus }),
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (res.ok) {
            showToast(`Conta marcada como ${novoStatus}!`, "success");
        } else {
            setContas(contas.map(c => (c.id === conta.id ? { ...c, status: statusAnterior } : c)));
            localStorage.setItem("contas", JSON.stringify(contas));
            const erro = await res.json();
            showToast(erro.error || "Erro ao atualizar status", "danger");
        }
    };

    const deletarConta = async (conta: ContaLocal) => {

        const token = localStorage.getItem("token");
        const res = await fetch(`http://localhost:4000/contasPagar/${conta.id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (res.ok) {
            const contasDeletadas = contas.filter(c => c.id !== conta.id)
            setContas(contasDeletadas)
            localStorage.setItem("contas", JSON.stringify(contasDeletadas))

            setTransacoes(prev => {
                const atualizado = prev.filter(t => t.contaId !== conta.id)
                localStorage.setItem("transacoes", JSON.stringify(atualizado))
                return atualizado;
            })
        }
    }

    const renderLista = (status: string, titulo: string) => (
        <div className={styles.card}>
            <div className={styles.titulosStatus}>
                <h4>{titulo}</h4>
            </div>
            <ul className={styles.listaContas}>
                {contas.filter((conta) => conta.status === status).map((conta) => (
                    <li
                        key={conta.id}
                        className={styles.itemLista}
                        onClick={() => {
                            setSelectedConta(conta)
                            setIsEditing(false);
                        }}
                    >

                        <span>{conta.nome}</span>

                        <div className={styles.listaContasButtons}>
                            <button className="btn">
                                <i
                                    className="bi bi-pencil iconPencil"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedConta(conta);
                                        setIsEditing(true);
                                    }}
                                ></i>
                            </button>
                            <button className="btn">
                                <i
                                    className="bi bi-trash iconTrash"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        deletarConta(conta);
                                    }}
                                ></i>
                            </button>
                            <input
                                type="checkbox"
                                checked={conta.status === "paga"}
                                onClick={(e) => e.stopPropagation()}
                                onChange={() => toggleStatus(conta)}
                            />
                        </div>
                    </li>
                ))}
            </ul>
        </div >
    )


    return (
        <div className={styles.main}>
            <div className={styles.formularioContasPagar}>
                <h2>Criar conta</h2>
                <form className={styles.formulario} onSubmit={handleSubmit}>
                    <div className={styles.grupoInputs}>
                        <div className={styles.inputFormulario}>
                            <label htmlFor="nome">Nome</label>
                            <input type="text" id="nome" name="nome" placeholder="Insira o nome da conta" required />
                        </div>
                        <div className={styles.inputFormulario}>
                            <label htmlFor="valor">Valor</label>
                            <input type="number" id="valor" name="valor" placeholder="Insira o valor" required />
                        </div>
                        <div className={styles.inputFormularioCategoria}>
                            <label htmlFor="categoria">Categoria</label>
                            <button type="button" onClick={handleOpenCategoriaModal}>
                                {displayCategorias()}
                                <i className="bi bi-chevron-down"></i>

                            </button>
                        </div>
                        <div className={styles.inputFormulario}>
                            <label htmlFor="data">Data</label>
                            <DatePicker
                                selected={novaData}
                                onChange={(date: Date | null) => setNovaData(date)}
                                dateFormat="dd/MM/yyyy"
                                className={styles.inputEditar}
                            />
                        </div>
                    </div>
                    <button type="submit" className={styles.buttonAdd} >+ Adicionar</button>
                </form>
            </div>
            <div className={styles.renderizacaoContasPagar}>
                {renderLista("vencida", "Vencidas")}
                {renderLista("pendente", "Pendentes")}
                {renderLista("paga", "Pagas")}
            </div>

            {selectedConta && (
                <div className={styles.modalOverlay} onClick={() => setSelectedConta(null)}>
                    <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div className={styles.modalHeader}>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={selectedConta.nome}
                                    className={styles.inputEditar}
                                    onChange={(e) =>
                                        setSelectedConta({ ...selectedConta, nome: e.target.value })
                                    }
                                />
                            ) : (
                                <h3>{selectedConta.nome}</h3>
                            )}

                            <span
                                className={`${styles.statusBadge} ${styles[selectedConta.status]}`}
                            >
                                {selectedConta.status}
                            </span>
                        </div>
                        <div className={styles.modalBody}>
                            {["data", "categoria", "valor"].map((campo) => (
                                <div
                                    key={campo}
                                    className={styles.infoCard}
                                    style={{
                                        borderLeftColor:
                                            selectedConta.status === "vencida"
                                                ? "#dc3545"
                                                : selectedConta.status === "pendente"
                                                    ? "#ffc107"
                                                    : "#28a745",
                                    }}
                                >
                                    {campo === "data" &&
                                        (isEditing ? (
                                            <DatePicker
                                                selected={selectedConta.data ? new Date(selectedConta.data) : null}
                                                onChange={(date: Date | null) =>
                                                    setSelectedConta({
                                                        ...selectedConta,
                                                        data: date ? date.toISOString() : "",
                                                    })
                                                }
                                                dateFormat="dd/MM/yyyy"
                                                className={styles.inputEditarDate}
                                            />
                                        ) : (
                                            <>
                                                <i className="fa-solid fa-calendar-days"></i>
                                                <p>{new Date(selectedConta.data).toLocaleDateString()}</p>
                                            </>
                                        ))}
                                    {campo === "categoria" &&
                                        (isEditing ? (
                                            <div className={styles.categoriaEdit}>
                                                <button
                                                    type="button"
                                                    className={styles.categoriaButton}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setOpenModal('categoria');
                                                    }}
                                                >
                                                    {selectedConta.categoria || "Selecionar categoria"}
                                                    <i className="bi bi-chevron-down"></i>
                                                </button>
                                            </div>
                                        ) : (
                                            <>
                                                <i className="fa-solid fa-tag"></i>
                                                <p>{selectedConta.categoria || "Sem categoria"}</p>
                                            </>
                                        ))}
                                    {campo === "valor" &&
                                        (isEditing ? (
                                            <input
                                                type="number"
                                                value={selectedConta.valor}
                                                className={styles.inputEditar}
                                                onChange={(e) =>
                                                    setSelectedConta({
                                                        ...selectedConta,
                                                        valor: Number(e.target.value),
                                                    })
                                                }
                                            />
                                        ) : (
                                            <>
                                                <i className="fa-solid fa-dollar-sign"></i>
                                                <p>R$ {selectedConta.valor.toFixed(2)}</p>
                                            </>
                                        ))}
                                </div>
                            ))}
                        </div>
                        <div className={styles.modalFooter}>
                            {isEditing ? (
                                <>
                                    <button
                                        className="btn btn-success me-2"
                                        onClick={async () => {
                                            if (!selectedConta) return;

                                            const novoStatus = definirStatus(selectedConta.data);
                                            const categoriaId = editCategoriaId ?? selectedConta.categoriaId;

                                            const contaAtualizada = {
                                                ...selectedConta,
                                                status: novoStatus,
                                                categoriaId
                                            }


                                            const token = localStorage.getItem("token");
                                            const res = await fetch(`http://localhost:4000/contasPagar/${selectedConta.id}`, {
                                                method: "PUT",
                                                body: JSON.stringify(contaAtualizada),
                                                headers: {
                                                    "Content-Type": "application/json",
                                                    Authorization: `Bearer ${token}`
                                                },
                                            })

                                            if (res.ok) {
                                                const contaDoBanco = await res.json();
                                                const updated = contas.map(c => (c.id === contaDoBanco.id ? contaDoBanco : c));
                                                setContas(updated);
                                                localStorage.setItem("contas", JSON.stringify(updated));
                                                showToast("Conta editada com sucesso!", "success");
                                            } else {
                                                const erro = await res.json();
                                                showToast(erro.error || "Erro ao salvar", "danger");
                                            }

                                            setIsEditing(false);
                                            setSelectedConta(null);
                                            showToast("Conta Editada com sucesso!", "success");

                                        }}>
                                        Salvar
                                    </button>

                                    <button
                                        className="btn btn-danger"
                                        onClick={() => setIsEditing(false)}
                                    >
                                        Cancelar
                                    </button>
                                </>
                            ) : (
                                <button
                                    className="btn btn-primary"
                                    onClick={() => setSelectedConta(null)}
                                >
                                    Fechar
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
            {openModal === 'categoria' && (
                <CategoriaModal
                    multiple={false}
                    onClose={handleCloseModal}
                    onSelect={handleSelectCategoria}
                    categorias={categoriasCompletas}
                />
            )}
        </div>
    )
}