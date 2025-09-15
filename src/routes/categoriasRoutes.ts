import { Router } from "express";
import { CategoriasController } from "../controllers/CategoriasController.ts";

const router = Router();

const categoriasController = new CategoriasController()

router.post("/", (req, res) => categoriasController.criar(req, res));
router.get("/", (req, res) => categoriasController.listar(req, res));
router.delete("/:id", (req, res) => categoriasController.deletar(req, res));



export default router;