import { Router } from "express";
import {ContasPagarController} from "../controllers/ContasPagarController"

const router = Router();

const contasPagarController = new ContasPagarController()

router.post("/", (req, res) => contasPagarController.criar(req, res));
router.get("/", (req, res) => contasPagarController.listar(req, res));
router.put("/:id", (req, res) => contasPagarController.editar(req, res));
router.delete("/:id", (req, res) => contasPagarController.deletar(req, res));

export default router;