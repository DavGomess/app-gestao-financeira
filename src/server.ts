import express from "express";
import cors from "cors";
import contasPagarRoutes from "./routes/contasPagarRoutes.ts";
import categoriasRoutes from "./routes/categoriasRoutes.ts";

const app = express();

app.use(cors())
app.use(express.json());

app.use("/contasPagar", contasPagarRoutes);
app.use("/transacoes", contasPagarRoutes);
app.use("/categorias", categoriasRoutes)

app.listen(4000, () => console.log("Servidor rodando na porta 4000"));
