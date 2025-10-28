import { Router } from "express";
import {ContasPagarController} from "../controllers/ContasPagarController"
import { authenticateToken } from "@/middlewares/authMiddleware";

const router = Router();
const contasPagarController = new ContasPagarController()

router.use(authenticateToken);
router.post("/", contasPagarController.criar.bind(contasPagarController));
router.get("/", contasPagarController.listar.bind(contasPagarController));
router.put("/:id", contasPagarController.editar.bind(contasPagarController));
router.delete("/:id", contasPagarController.deletar.bind(contasPagarController));

export default router;