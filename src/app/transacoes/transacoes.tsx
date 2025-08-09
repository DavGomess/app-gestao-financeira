import { useState } from 'react';
import styles from './transacoes.module.css';
import CategoriaModal from '../components/CategoriaModal'; 
import PeriodoModal from '../components/PeriodoModal';
export default function Transacoes() {
    const [openModal, setOpenModal] = useState<null | 'categoria' | 'periodo'>(null);
    const [selectedCategoria, setSelectedCategoria] = useState<string[]>([]);
    const [selectedPeriodo, setSelectedPeriodo] = useState("");

    const handleOpenCategoriaModal = () => setOpenModal('categoria');
    const handleOpenPeriodoModal = () => setOpenModal('periodo');
    const handleCloseModal = () => setOpenModal(null);

    const handleSelectCategoria = (categorias: string[]) => {
        setSelectedCategoria(categorias);
        handleCloseModal();
    };

    const handleSelectPeriodo = (periodo: string) => {
        setSelectedPeriodo(periodo);
        handleCloseModal();
    };

    const displayCategorias = () => {
    if (selectedCategoria.length === 0) return "Categoria";
    if (selectedCategoria.length === 1) return selectedCategoria[0];
    return `${selectedCategoria[0]}, +${selectedCategoria.length - 1}`;
};



    return (
        <div className={styles.main}>
            <div className={styles.cardFiltro}>
                <h2><i className="bi bi-funnel"></i> Filtros</h2>
                <form action="">
                    <div className={styles.groupInputs}>
                        <div className={styles.inputPesquisar}>
                            <label htmlFor="pesquisar"></label>
                            <i className="bi bi-search"></i>
                            <input type="text" id="pesquisar" name="pesquisar" placeholder="Pesquisar" />
                        </div>
                        <div className={styles.inputPeriodo}>
                            <label htmlFor="periodo"></label>
                            <button type="button" onClick={handleOpenPeriodoModal}>
                                {selectedPeriodo || "Período"}
                                <i className="bi bi-chevron-down"></i>
                            </button>
                        </div>

                        <div className={styles.inputCategoria}>
                            <label htmlFor="categoria"></label>
                            <button type="button" onClick={handleOpenCategoriaModal}>
                                {displayCategorias()}
                                <i className="bi bi-chevron-down"></i>
                                
                            </button>
                        </div>
                    </div>
                </form>
            </div>

            {openModal === 'periodo' && (
                <PeriodoModal onClose={handleCloseModal} onSelect={handleSelectPeriodo} />
            )}

            {openModal === 'categoria' && (
                <CategoriaModal onClose={handleCloseModal} onSelect={handleSelectCategoria} />
            )}
        </div>
    )
}