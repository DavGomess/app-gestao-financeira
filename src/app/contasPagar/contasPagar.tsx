import { useEffect, useState } from "react";
import styles from "./contasPagar.module.css"
import { CriarContaInput }  from "../../types/CriarContaInput";


export default function ContasPagar() {
    const [contas, setContas] = useState<CriarContaInput[]>([])
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
            nome: formData.get("nome"),
            valor: formData.get("valor"),
            categoria: formData.get("categoria"),
            data: formData.get("data")
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

    const renderLista = (status: string, titulo: string) => (
        <div className={styles.card}>
            <div className={styles.titulosStatus}>
            <h4>{titulo}</h4>
            </div>
            <ul className={styles.listaContas}>
                {contas.filter((conta) => conta.status === status).map((conta, index) => (
                    <li
                        key={index}
                        className={styles.itemLista}
                        onClick={() => setSelectedConta(conta)}
                    >
                        {conta.nome}
                        <input type="checkbox" name="checkboxConta" id="checkboxConta" />
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
                        <h3>{selectedConta.nome}</h3>
                        <p>Valor: R$ {selectedConta.valor}</p>
                        <p>Categoria: {selectedConta.categoria}</p>
                        <p>Data: {new Date(selectedConta.data).toLocaleDateString()}</p>
                        <button onClick={() => setSelectedConta(null)}>Fechar</button>
                    </div>
                </div>
            )}
        </div>
    )
}