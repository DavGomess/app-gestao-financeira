import { Response } from "express";   
import { CategoriasService } from "../services/CategoriasService";
import { AuthenticatedRequest } from "@/middlewares/authMiddleware";

const service = new CategoriasService();

export class CategoriasController {
    async criar(req: AuthenticatedRequest, res: Response) {
        try {
            if (!req.user) return res.status(401).json({ error: "Não autenticado." });
            const { nome, tipo } = req.body;
            if (!nome || ["receita", "despesa"].includes(tipo)) {
                return res.status(400).json({ error: "Dados inválidos." });
            }
            const categoria = await service.criar(nome, tipo as "receita" | "despesa", req.user.id);
            return res.status(201).json(categoria);
        } catch (error: unknown) {
            return res.status(400).json({ error: error instanceof Error ? error.message : String(error) });
        }
    };

    async listar(req: AuthenticatedRequest, res: Response) {
        try {
            if (!req.user) return res.status(401).json({ error: "Não autorizado" });
            const categorias = await service.listar(req.user.id);
            return res.json(categorias);
        } catch (error: unknown) {
            return res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
        }
    };

    async deletar(req: AuthenticatedRequest, res: Response) {
        try {
            if (!req.user) return res.status(401).json({ error: "Não autorizado" })
            const id = Number(req.params.id);
            await service.deletar(id, req.user.id);
            return res.status(204).send();
        } catch (error: unknown) {
            return res.status(400).json({ error: error instanceof Error ? error.message : String(error) });
        }
    };
}
