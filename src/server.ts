import express from "express";
import cors from "cors";
import contasPagarRoutes from "./routes/contasPagarRoutes.ts";

const app = express();

app.use(cors())
app.use(express.json());

app.use("/contasPagar", contasPagarRoutes);
app.use("/transacoes", contasPagarRoutes);

app.listen(4000, () => console.log("Servidor rodando na porta 4000"));
