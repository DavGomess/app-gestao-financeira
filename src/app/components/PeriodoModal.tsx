import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from '../transacoes/transacoes.module.css';


type PeriodoModalProps = {
    onClose: () => void;
    onSelect: (periodo: string) => void;
};

export default function PeriodoModal({ onClose, onSelect }: PeriodoModalProps) {
    const [selectedTemp, setSelectedTemp] = useState<string | null>(null);
    const [dataInicial, setDataInicial] = useState<Date | null>(null);
    const [dataFinal, setDataFinal] = useState<Date | null>(null);
    
    const periodos = ["7 Dias", "15 Dias", "30 Dias", "90 Dias"];

    const handleConfirm = () => {
        if (selectedTemp) {
            onSelect(selectedTemp);
        }else if (dataInicial && dataFinal) {
            const formatar = (d: Date) => d.toLocaleDateString("pt-BR");
            onSelect(`${formatar(dataInicial)} - ${formatar(dataFinal)}`);
        }
        onClose();
    }

    const isBotaoConfirmarAtivo = selectedTemp !== null || (dataInicial !== null && dataFinal !== null);

    return (
        <div
            className="modal fade show d-block"
            tabIndex={-1}
            role="dialog"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
            <div className="modal-dialog modal-dialog-centered" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h4 className="modal-title">Período</h4>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <ul className="modalList">
                            {periodos.map((periodo) => (
                                <li
                                    key={periodo}
                                    className={`modalItem ${selectedTemp === periodo ? "active" : ""}`}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => {
                                        setSelectedTemp(periodo)
                                        setDataInicial(null);
                                        setDataInicial(null);
                                    }}
                                >
                                    {periodo}
                                </li>
                            ))}
                        </ul>
                        <div className="mt-4">
                            <h5>Personalizar</h5>
                            <p className="fw-light">Você só pode consultar períodos de até 2 anos</p>
                            <div className="d-flex flex-column gap-2 w-100">
                                <div className={styles.containerDate}>
                                <DatePicker
                                    selected={dataInicial}
                                    onChange={(date) => {
                                        setDataInicial(date);
                                        setSelectedTemp(null); // limpa seleção rápida
                                    }}
                                    placeholderText="Data Inicial"
                                    className={styles.inputDate}
                                    dateFormat="dd/MM/yyyy"
                                    maxDate={new Date()}
                                />
                                <i className="bi bi-calendar-week fs-4 me-2"></i>
                                </div>
                                
                                <div className={styles.containerDate}>
                                <DatePicker
                                    selected={dataFinal}
                                    onChange={(date) => {
                                        setDataFinal(date);
                                        setSelectedTemp(null); 
                                    }}
                                    placeholderText="Data Final"
                                    className={styles.inputDate}
                                    dateFormat="dd/MM/yyyy"
                                    maxDate={new Date()}
                                />
                                <i className="bi bi-calendar-week fs-4 me-2"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-primary" onClick={handleConfirm}
                        disabled={!isBotaoConfirmarAtivo}>
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