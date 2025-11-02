import { OrcamentosController } from "@/controllers/OrcamentosController";
import { authenticateToken } from "@/middlewares/authMiddleware";
import { Router } from "express";

const router = Router();
const orcamentosController = new OrcamentosController();

router.use(authenticateToken);

router.post("/", orcamentosController.upsert.bind(orcamentosController));
router.get("/", orcamentosController.listar.bind(orcamentosController));
router.delete("/:categoriaId", orcamentosController.deletar.bind(orcamentosController));

export default router;