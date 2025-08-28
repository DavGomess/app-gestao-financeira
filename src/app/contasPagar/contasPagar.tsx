import { useEffect, useState } from "react";
import styles from "./contasPagar.module.css"
import { CriarContaInput, ContaLocal } from "../../types/CriarContaInput";



export default function ContasPagar() {
    const [contas, setContas] = useState<ContaLocal[]>([])
    const [selectedConta, setSelectedConta] = useState<CriarContaInput | null>(null)

    useEffect(() => {
        const contasLocal = localStorage.getItem("contas");
        if (contasLocal) {
            setContas(JSON.parse(contasLocal))
        }

        const carregarBanco = async () => {
            const res = await fetch("http://localhost:4000/contasPagar");
            if (res.ok) {
                const contasBanco = await res.json();
                setContas(contasBanco);
                localStorage.setItem("contas", JSON.stringify(contasBanco))
            }
        }
        carregarBanco();
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;

        const formData = new FormData(form);
        const data = {
            id: Date.now(),
            nome: formData.get("nome"),
            valor: formData.get("valor"),
            categoria: formData.get("categoria"),
            data: formData.get("data"),
            status: "pendente"
        };
        const res = await fetch("http://localhost:4000/contasPagar", {
            method: "POST",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" },
        });

        if (res.ok) {
            const novaConta = await res.json();

            const contasAtualizadas = [...contas, novaConta];
            setContas(contasAtualizadas)

            localStorage.setItem("contas", JSON.stringify(contasAtualizadas));

            form.reset();
        }
    };

    const toggleStatus = (conta: ContaLocal) => {
        let novoStatus = conta.status;
        let statusAnterior = conta.statusAnterior;

        if (conta.status === "pendente" || conta.status === "vencida") {
            statusAnterior = conta.status;
            novoStatus = "paga";
        } else if (conta.status === "paga") {
            novoStatus = statusAnterior || "pendente";
        }

        const contasAtualizadas = contas.map(c => c.id === conta.id ? { ...c, status: novoStatus, statusAnterior } : c);

        setContas(contasAtualizadas);
        localStorage.setItem("contas", JSON.stringify(contasAtualizadas))

        fetch(`http://localhost:4000/contasPagar/${conta.id}`, {
            method: "PUT",
            body: JSON.stringify({ ...conta, status: novoStatus }),
            headers: { "content-Type": "application/json" },
        });
    };

    const deletarLista = async (conta: ContaLocal) => {

        const res = await fetch(`http://localhost:4000/contasPagar/${conta.id}`, {
            method: "DELETE"
        });

        if(res.ok) {
            const contasDeletas = contas.filter(c => c.id !== conta.id)
            setContas(contasDeletas)
            localStorage.setItem("contas", JSON.stringify(contasDeletas))
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
                        onClick={() => setSelectedConta(conta)}
                    >
                        {conta.nome}
                        <div className={styles.listaContasButtons}>
                            <button className="btn"><i className="bi bi-pencil"></i></button>
                            <button className="btn">
                                <i className="bi bi-trash" onClick={(e) => {
                                e.stopPropagation();
                                deletarLista(conta)}}>
                                </i>
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
        </div>
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
                        <div className={styles.inputFormulario}>
                            <label htmlFor="categoria">Categoria</label>
                            <input type="text" id="categoria" name="categoria" required />
                        </div>
                        <div className={styles.inputFormulario}>
                            <label htmlFor="data">Data</label>
                            <input type="date" id="data" name="data" required />
                        </div>
                    </div>
                    <button type="submit" className={styles.buttonAdd}>+ Adicionar</button>
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
                            <h3>{selectedConta.nome}</h3>
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
                                    {campo === "data" && (
                                        <>
                                            <i className="fa-solid fa-calendar-days"></i>
                                            <p>{new Date(selectedConta.data).toLocaleDateString()}</p>
                                        </>
                                    )}
                                    {campo === "categoria" && (
                                        <>
                                            <i className="fa-solid fa-tag"></i>
                                            <p>{selectedConta.categoria}</p>
                                        </>
                                    )}
                                    {campo === "valor" && (
                                        <>
                                            <i className="fa-solid fa-dollar-sign"></i>
                                            <p>R$ {selectedConta.valor.toFixed(2)}</p>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>

                        <button className={styles.closeButton} onClick={() => setSelectedConta(null)}>Fechar</button>
                    </div>
                </div>
            )}

        </div>
    )
}