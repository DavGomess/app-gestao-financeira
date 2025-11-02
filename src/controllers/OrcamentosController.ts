import { AuthenticatedRequest } from "@/middlewares/authMiddleware";
import { OrcamentosSerivice } from "@/services/OrcamentosService";
import { Response } from "express";

const service = new OrcamentosSerivice();

export class OrcamentosController {
    async upsert(req: AuthenticatedRequest, res: Response) {
        try {
            if (!req.user) return res.status(401).json({ error: "Não autenticado" });
            const { categoriaId, valor } = req.body;
            const orc = await service.upsert({ categoriaId, valor }, req.user.id);
            return res.json(orc);
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Erro ao salvar orçamento";
            return res.status(400).json({ error: msg });
        }
    }

    async listar(req: AuthenticatedRequest, res: Response) {
        try {
            if (!req.user) return res.status(401).json({ error: "Não autenticado" });
            const orcamentos = await service.listar(req.user.id);
            return res.json(orcamentos);
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Erro ao listar orçamento";
            return res.status(500).json({ error: msg });
        }
    }

    async deletar(req: AuthenticatedRequest, res: Response) {
        try {
            if (!req.user) return res.status(401).json({ error: "Não autenticado" });
            const { categoriaId } = req.params;
            await service.remover(Number(categoriaId), req.user.id);
            return res.status(204).send();
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Erro ao deletar orçamento";
            return res.status(400).json({ error: msg });
        }
    }
}
