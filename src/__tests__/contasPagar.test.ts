import request from "supertest";
import app from "../app";

describe("Contas a Pagar", () => {
    it("POST /contasPagar → cria despesa", async () => {
        await request(app).post("/auth/register").send({ email: "user@test.com", password: "123456" });
        const loginRes = await request(app).post("/auth/login").send({ email: "user@test.com", password: "123456" });
        const token = loginRes.body.token;

    const catRes = await request(app)
        .post("/categorias")
        .set("Authorization", `Bearer ${token}`)
        .send({ nome: "Internet", tipo: "despesa" });

    const res = await request(app)
        .post("/contasPagar")
        .set("Authorization", `Bearer ${token}`)
        .send({
            nome: "Internet",
            valor: 99.9,
            data: "2025-12-10",
            categoriaId: catRes.body.id,
    });

    expect(res.status).toBe(201);
    });
});