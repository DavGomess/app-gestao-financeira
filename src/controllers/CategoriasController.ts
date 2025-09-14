import { Request, Response } from "express";   
import { CategoriasService } from "../services/CategoriasService.ts";
import { CategoriasRepository } from "../repository/CategoriasRepository.ts";


export class CategoriasController {
    private service: CategoriasService;

    constructor() {
        const repository = new CategoriasRepository();
        this.service = new CategoriasService(repository);
    }

    criar = async (req: Request, res: Response) => {
        try {
            const { nome, tipo } = req.body;
            if (!nome || !tipo) {
                return res.status(400).json({ error: "Todos os campos são obrigatórios" });
            }
            const categoria = await this.service.criarCategoriasService({ nome, tipo });
            return res.status(201).json(categoria);
        } catch (error: unknown) {
            return res.status(400).json({ error: error instanceof Error ? error.message : String(error) });
        }
    };

    listar = async (req: Request, res: Response) => {
        try {
            const categorias = await this.service.listarCategoriasService();
            return res.json(categorias);
        } catch (error: unknown) {
            return res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
        }
    };

    deletar = async (req: Request, res: Response) => {
        try {            
            const id = Number(req.params.id);
            await this.service.deletarCategoriasService(id);
            return res.status(204).send();
        } catch (error: unknown) {
            return res.status(400).json({ error: error instanceof Error ? error.message : String(error) });
        }
    };
}
