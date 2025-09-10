import { Request, Response } from "express";
import { ContasService } from "../services/ContasPagarService.ts";

const contasService = new ContasService();

export class ContasPagarController {
    constructor() {
    this.criar = this.criar.bind(this);
    this.listar = this.listar.bind(this);
    this.editar = this.editar.bind(this);
    this.deletar = this.deletar.bind(this);
}

    async criar(req: Request, res: Response) {
        try {
            const { nome, valor, categoria, data } = req.body;

      // Validação básica no controller
            if (!nome || !valor || !categoria || !data) {
            return res.status(400).json({ error: "Todos os campos são obrigatórios" });
        }

        const conta = await contasService.criarContaService({
            nome,
            valor: Number(valor),
            categoria,
            data,
            status: "pendente",
        });

        return res.status(201).json(conta);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return res.status(400).json({ error: errorMessage });
        }
    }

    async listar(req: Request, res: Response) {
        const contas = await contasService.listarContasService();
        return res.json(contas)
    }

    async editar(req: Request, res: Response) {
    try {
        console.log("REQ BODY:", req.body);  // 👈 ver o que tá vindo
        console.log("REQ PARAM ID:", req.params.id);
        const conta = await contasService.editarContaService(Number(req.params.id), req.body);
        return res.json(conta);
    } catch (error: unknown) {
        console.error("ERRO NO PUT:", error); // 👈 logar o erro bruto
        const errorMessage = error instanceof Error ? error.message : String(error);
        return res.status(400).json({ error: errorMessage });
    }
}

    async deletar(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await contasService.deleteContaService(Number(id));
            return res.status(204).send();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return res.status(400).json({ error: errorMessage });
        }
    }
}