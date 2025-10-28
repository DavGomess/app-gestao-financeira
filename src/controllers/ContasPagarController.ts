import { Request, Response } from "express";
import { ContasService } from "../services/ContasPagarService";
import { AuthenticatedRequest } from "../middlewares/authMiddleware";
import { prisma } from "@/lib/prisma";

export class ContasPagarController {
    private contasService = new ContasService();

    
    async criar(req: AuthenticatedRequest, res: Response) {
        try {
            const { nome, valor, categoriaId, data } = req.body;

            if (!nome || !valor || !data) {
            return res.status(400).json({ error: "Todos os campos são obrigatórios" });
        }

            if (valor <= 0) {
            return res.status(400).json({ error: "Valor deve ser positivo" });
        }

            const userId = req.user?.id;
            if (!userId) return res.status(401).json({ error: "Usuário não autenticado" });

            if (categoriaId) {
                const categoria = await prisma.categoria.findFirst({
                    where: { id: categoriaId, userId },
                });
            if (!categoria) {
                return res.status(400).json({ error: "Categoria inválida ou não pertence ao usuário" });
            }
    }

        const conta = await this.contasService.criarContaService({
            nome,
            valor: Number(valor),
            categoriaId: categoriaId ? Number(categoriaId) : undefined,
            data,
            status: "pendente",
        },
        userId
    );

        return res.status(201).json(conta);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Erro ao criar conta";
            return res.status(400).json({ error: errorMessage });
        }
    }

    async listar(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) return res.status(401).json({ error: "Usuário não autenticado" });

            const contas = await this.contasService.listarContasService(userId);
            return res.json(contas);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return res.status(500).json({ error: errorMessage });
    }
    }

    async editar(req: AuthenticatedRequest, res: Response) {
    try {
        const userId = req.user?.id;
        if (!userId) return res.status(401).json({ error: "Usuário não autenticado" });

        const conta = await this.contasService.editarContaService(Number(req.params.id), req.body, userId);
        return res.json(conta);
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        return res.status(400).json({ error: errorMessage });
    }
}

    async deletar(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) return res.status(401).json({ error: "Usuário não autenticado" });

            await this.contasService.deleteContaService(Number(req.params.id), userId);
            return res.status(204).send();
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return res.status(400).json({ error: errorMessage });
        }
    }
}