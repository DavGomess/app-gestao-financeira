import { useState } from "react";

type CategoriaModalProps = {
    onClose: () => void;
    onSelect: (categoria: string[]) => void;
    multiple?: boolean;
};

export default function CategoriaModal({ onClose, onSelect, multiple = true }: CategoriaModalProps) {
    const [selectedTemp, setSelectedTemp] = useState<Array<{ tipo: string; categoria: string}>>([]);

    const categorias = {
        Entradas: ["Freelance", "Investimentos", "Salário", "Vendas", "Todos"], Saídas: ["Alimentação", "Educação", "Compras", "Entretenimento", "Saúde", "Transporte", "Moradia", "Carro", "Todos",]
    }

    const handleConfirm = () => {
        if (selectedTemp) {
            onSelect(selectedTemp.map((item) => item.categoria));
        }
        onClose();
    }

    const toggleCategoria = (tipo: string, categoria: string) => {
        if (!multiple) {
            setSelectedTemp([{ tipo, categoria }]);
            return;
        }

        const isTodos = categoria === "Todos";
        const todasCategorias = categorias[tipo as keyof typeof categorias];

        const estaSelecionado = selectedTemp.some((item) => item.tipo === tipo && item.categoria === categoria);

        if (isTodos) {
            if (estaSelecionado) {
                setSelectedTemp((prev) => prev.filter((item) => item.tipo !== tipo));
            } else {
                const novasSelecoes = todasCategorias.map((c) => ({ tipo, categoria: c }));
                setSelectedTemp((prev) => [
                    ...prev.filter((item) => item.tipo !== tipo),
                    ...novasSelecoes,
                ]);
            }
        } else {
            setSelectedTemp((prev) => {
                const jaSelecionado = prev.some((item) => item.tipo === tipo && item.categoria === categoria);

                if (jaSelecionado) {
                    return prev.filter((item) => !(item.tipo === tipo && item.categoria === categoria));
                } else {
                    return [...prev, { tipo, categoria }]
                }
            })
        }
    };



return (
    <div
        className="modal fade show d-block"
        tabIndex={-1}
        role="dialog"
        style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
    >
        <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title">Categoria</h5>
                    <button type="button" className="btn-close" onClick={onClose}></button>
                </div>
                <div className="modal-body">
                    {Object.entries(categorias).map(([tipo, lista]) => (
                        <div key={tipo}>
                            <h6>{tipo}</h6>
                            <ul className=" mb-3 modalList">
                                {lista.map((categoria) => {
                                    const isSelecionado = selectedTemp.some(
                                        (item) => item.tipo === tipo && item.categoria === categoria);
                                        if (!multiple && categoria === "Todos") return null;

                                    return (
                                        <li
                                            key={categoria}
                                            className={` modalItem ${isSelecionado ? "liModalAtivo" : ""}`}
                                            style={{ cursor: "pointer" }}
                                            
                                            onClick={() => toggleCategoria(tipo, categoria)}
                                        >
                                            {categoria}
                                        </li>
                                )
                                })}
                            </ul>
                        </div>
                    ))}
                </div>
                
                <div className="modal-footer">
                    <button className="btn btn-primary" onClick={handleConfirm} disabled={selectedTemp.length === 0}>
                        Confirmar
                    </button>
                    <button className="btn btn-danger" onClick={onClose}>
                        Fechar
                    </button>
                </div>
            </div>
        </div>
        
    </div>
)
}