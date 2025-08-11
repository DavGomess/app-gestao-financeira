import styles from "./contasPagar.module.css"

export default function ContasPagar() {
    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = {
            nome: formData.get("nome"),
            valor: formData.get("valor"),
            categoria: formData.get("categoria"),
            data: formData.get("data")
        };
        await fetch("/api/contasPagar", {
            method: "POST",
            body: JSON.stringify(data),
            headers: { "Content-Type": "application/json" },
        });
    }


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
        </div>
    )
}