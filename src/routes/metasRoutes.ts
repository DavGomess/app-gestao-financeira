import { MetasController } from "@/controllers/MetasController";
import { authenticateToken } from "@/middlewares/authMiddleware";
import { Router } from "express";

const router = Router();
const metasController = new MetasController();

router.use(authenticateToken);

router.post("/", metasController.criar.bind(metasController));
router.get("/", metasController.listar.bind(metasController));
router.post("/:id/valor", metasController.adicionarValor.bind(metasController));
router.put("/", metasController.editar.bind(metasController));
router.delete("/:id", metasController.deletar.bind(metasController));

export default router;