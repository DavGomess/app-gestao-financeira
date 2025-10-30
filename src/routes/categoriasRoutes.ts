import { Router } from "express";
import { CategoriasController } from "../controllers/CategoriasController";
import { authenticateToken } from "../middlewares/authMiddleware";

const router = Router();
const categoriasController = new CategoriasController()

router.use(authenticateToken);

router.post("/", categoriasController.criar.bind(categoriasController));
router.get("/", categoriasController.listar.bind(categoriasController));
router.delete("/:id", categoriasController.deletar.bind(categoriasController));

export default router;