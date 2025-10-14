"use client";

import * as XLSX from "xlsx-js-style";
import { jsPDF } from "jspdf";
import autoTable from 'jspdf-autotable';
import { useState } from "react";
import styles from "./relatorios.module.css"
import { useTransacoes } from "@/contexts/TransacoesContext";
import { categorias } from "../data/categorias";
import { Transacao } from "@/types/CriarContaInput";


export default function Relatorios() {
    const { transacoes } = useTransacoes();
    const [formato, setFormato] = useState("");
    const [mes, setMes] = useState("");
    const [ano, setAno] = useState("");
    const [todosPeriodos, setTodosPeriodos] = useState(false);

    const isValidToDownload = todosPeriodos || (formato && mes && ano);

    function filtrarTransacoes(transacao: Transacao[]): Transacao[] {
        let filtradas = transacao;
        const mesNum = mes ? Number(mes) : null

        if (!todosPeriodos) {
            filtradas = filtradas.filter((t) => {
                const data = new Date(t.data);
                const anoMatch = ano ? String(data.getFullYear()) === ano : true;
                const mesMatch = mesNum ? (data.getMonth() + 1) === mesNum : true;
                return anoMatch && mesMatch;
            });
        }

        if (formato === "receita") {
            filtradas = filtradas.filter((t) => categorias.Receita.includes(t.categoria));
        } else if (formato === "despesa") {
            filtradas = filtradas.filter((t) => categorias.Despesa.includes(t.categoria));
        }

        return filtradas;
    }

    const getTituloRelatorio = () => {
        if (todosPeriodos) return "Relatorio Completo";
        if (mes && ano) return `Relatorio de ${mes}/${ano}`;
        if (ano) return `Relatorio de ${ano}`;
        return "Relatorio Completo";
    }

    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
    ];
    const getNomeAquivo = (ext: string) => {
        if (todosPeriodos) return `relatorio_completo.${ext}`;
        if (mes && ano) {
            const mesNome = Number(mes)
            return `relatorio-${monthNames[mesNome - 1]}-${ano}.${ext}`;
        }
        if (ano) return `relatorio-${ano}.${ext}`;
        return `relatorio.${ext}`;
    }

    const handleDownloadExecel = () => {
        const dados = filtrarTransacoes(transacoes);

        const totalReceitas = dados.filter(d => d.tipo?.toLowerCase() === "receita").length;
        const totalDespesas = dados.filter(d => d.tipo?.toLowerCase() === "despesa").length;

        const dadosFormatados = dados.map((d) => ({
            Nome: d.nome,
            Categoria: d.categoria,
            Valor: d.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
            Tipo: d.tipo ? d.tipo.toLowerCase() : categorias.Despesa.includes(d.categoria) ? "despesa" : "receita",
            Date: new Date(d.data).toLocaleDateString("pt-BR")
        }))
        const worksheet = XLSX.utils.json_to_sheet(
            [
                { Nome: `Receitas: ${totalReceitas}`, Categoria: `Despesas: ${totalDespesas}` },
                {},
                ...dadosFormatados
            ],
            { skipHeader: false }
        );

        const range = XLSX.utils.decode_range(worksheet['!ref'] || '');

        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cellAddress = XLSX.utils.encode_cell({ r: 2, c: C });
            if (!worksheet[cellAddress]) continue;
            worksheet[cellAddress].s = {
                font: { bold: true, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "2563EB" } },
                alignment: { horizontal: "center" },
                border: {
                    top: { style: "thin", color: { rgb: "000000" } },
                    bottom: { style: "thin", color: { rgb: "000000" } },
                    left: { style: "thin", color: { rgb: "000000" } },
                    right: { style: "thin", color: { rgb: "000000" } },
                },
            };
        }

        if (worksheet["A1"]) {
            worksheet["A1"].s = {
                font: { bold: true, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "22C55E" } },
                alignment: { horizontal: "center" },
            };
        }
        if (worksheet["B1"]) {
            worksheet["B1"].s = {
                font: { bold: true, color: { rgb: "FFFFFF" } },
                fill: { fgColor: { rgb: "EF4444" } },
                alignment: { horizontal: "center" },
            };
        }

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Relatório");

        const nomeArquivo = todosPeriodos
            ? "relatorio-completo.xlsx"
            : `relatorio-${mes || "mes"}-${ano || "ano"}.xlsx`;

        XLSX.writeFile(workbook, nomeArquivo);
    };

    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        const dados = filtrarTransacoes(transacoes);
        const pageWidth = doc.internal.pageSize.getWidth();

        const titulo = getTituloRelatorio();

        doc.setFillColor(37, 99, 235);
        doc.rect(0, 10, pageWidth, 15, "F");
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.setTextColor(255, 255, 255);
        doc.text(titulo, pageWidth / 2, 20, { align: "center" });

        const parseValor = (valor: string | number): number => {
            if (typeof valor === "string") {
                return parseFloat(valor.replace(/\./g, "").replace(",", "."));
            }
            return Number(valor) || 0;
        }

        const totalReceitas = dados
            .filter(d => (d.tipo?.toLowerCase() === "receita") || categorias.Receita.includes(d.categoria))
            .reduce((acc, cur) => acc + parseValor(cur.valor), 0);

        const totalDespesas = dados
            .filter(d => (d.tipo?.toLowerCase() === "despesa") || categorias.Despesa.includes(d.categoria))
            .reduce((acc, cur) => acc + parseValor(cur.valor), 0);

        const cardWidth = 80;
        const cardHeight = 12;
        const gap = 20;
        const totalWidth = cardWidth * 2 + gap;
        const startX = (pageWidth - totalWidth) / 2;

        doc.setFillColor(34, 197, 94);
        doc.rect(startX, 35, cardWidth, cardHeight, "F");
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(15);
        doc.text(`Receitas: ${totalReceitas.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })}`, startX + 5, 43);

        doc.setFillColor(239, 68, 68);
        doc.rect(startX + cardWidth + gap, 35, cardWidth, cardHeight, "F");
        doc.setTextColor(255, 255, 255);
        doc.text(`Despesas: ${totalDespesas.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })}`, startX + cardWidth + gap + 5, 43);

        autoTable(doc, {
            startY: 55,
            head: [["nome", "Categoria", "Valor (R$)", "Tipo", "Data"]],
            body: dados.map((d) => [
                d.nome,
                d.categoria,
                d.valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }),
                (d.tipo ? d.tipo.toLowerCase() : categorias.Despesa.includes(d.categoria) ? "despesa" : "receita"),
                new Date(d.data).toLocaleDateString("pt-BR")
            ]),
            theme: "grid",
            headStyles: { fillColor: [220, 38, 38] },
            styles: { halign: "center" },
        });

        doc.save(getNomeAquivo("pdf"))
    };

    return (
        <div className={styles.main}>
            <div className={styles.cardRelatorio}>
                <h2><i className="bi bi-file-earmark-arrow-down"></i>Opções de Exportação</h2>
                <form>
                    <div className={styles.containerInputs}>
                        <div className={styles.infoInputsRelatorio}>
                            <label htmlFor="relatorio">Formato do Relatório</label>
                            <div className="position-relative">
                                <select className="form-select" value={formato} onChange={(e) => setFormato(e.target.value)} required>
                                    <option value="" disabled>Selecione</option>
                                    <option value="completo">Relatório Completo</option>
                                    <option value="receita">Apenas Receitas</option>
                                    <option value="despesa">Apenas Gastos</option>
                                </select>
                                <i
                                    className="bi bi-chevron-down"
                                    style={{
                                        position: "absolute",
                                        right: "0.75rem",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        pointerEvents: "none",
                                        color: "var(--icon-color",
                                    }}
                                ></i>
                            </div>
                        </div>
                        <div className={styles.infoInputsMes}>
                            <label htmlFor="mes">Mês Escolhido</label>
                            <div className="position-relative">
                            <select className="form-select" value={mes} onChange={(e) => setMes(e.target.value)} required={!todosPeriodos} disabled={todosPeriodos}>
                                <option value="" disabled>Selecione</option>
                                <option value="1">Janeiro</option>
                                <option value="2">Fevereiro</option>
                                <option value="3">Março</option>
                                <option value="4">Abril</option>
                                <option value="5">Maio</option>
                                <option value="6">Junho</option>
                                <option value="7">Julho</option>
                                <option value="8">Agosto</option>
                                <option value="9">Setembro</option>
                                <option value="10">Outubro</option>
                                <option value="11">Novembro</option>
                                <option value="12">Dezembro</option>
                            </select>
                            <i
                                    className="bi bi-chevron-down"
                                    style={{
                                        position: "absolute",
                                        right: "0.75rem",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        pointerEvents: "none",
                                        color: "var(--icon-color",
                                    }}
                                ></i>
                            </div>
                        </div>
                        <div className={styles.infoInputsAno}>
                            <label htmlFor="ano">Ano Escolhido</label>
                            <div className="position-relative">
                            <select className="form-select" value={ano} onChange={(e) => setAno(e.target.value)} required={!todosPeriodos} disabled={todosPeriodos}>
                                <option value="" disabled>Selecione</option>
                                <option value="2025">2025</option>
                                <option value="2024">2024</option>
                            </select>
                            <i
                                    className="bi bi-chevron-down"
                                    style={{
                                        position: "absolute",
                                        right: "0.75rem",
                                        top: "50%",
                                        transform: "translateY(-50%)",
                                        pointerEvents: "none",
                                        color: "var(--icon-color",
                                    }}
                                ></i>
                            </div>
                        </div>
                        <div className={styles.infoInputsPeriodo}>
                            <label htmlFor="todosPeriodos">Todos os períodos</label>
                            <div className="form-check form-switch">
                                <input className="form-check-input w-50 m-0 text-white" type="checkbox" id="todosPeriodos" checked={todosPeriodos} onChange={(e) => setTodosPeriodos(e.target.checked)} />
                            </div>
                        </div>
                        <hr />
                    </div>
                </form>
            </div>
            <div className={styles.opcoesDisponiveis}>
                <h3>Opções Disponíveis</h3>
                <div className={styles.containerOpcoesDisponiveis}>
                    <div className={styles.cardOpcaoDisponivel}>
                        <i className="bi bi-file-earmark-spreadsheet-fill fs-1 text-success"></i>
                        <div className={styles.infoOpcaoDisponivel}>
                            <h6 className="m-0 fw-semibold">Excel/CSV</h6>
                            <p>Planilha adaptada para Excel e outros editores.</p>
                            <button className="btn btn-success" type="button" onClick={handleDownloadExecel} disabled={!isValidToDownload}>
                                <i className="bi bi-file-earmark-spreadsheet-fill"></i> Baixar Planilha
                            </button>
                        </div>
                    </div>
                    <div className={styles.cardOpcaoDisponivel}>
                        <i className="bi bi-file-earmark-pdf-fill fs-1 text-danger"></i>
                        <div className={styles.infoOpcaoDisponivel}>
                            <h6 className="m-0 fw-semibold">PDF</h6>
                            <p>Arquivo preparado para impressão.</p>
                            <button className="btn btn-danger" type="button" onClick={handleDownloadPDF} disabled={!isValidToDownload}>
                                <i className="bi bi-file-earmark-pdf-fill"></i> Baixar PDF
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}