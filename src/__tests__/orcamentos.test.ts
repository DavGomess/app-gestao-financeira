import request from "supertest";
import app from "../app";

describe("Orçamentos", () => {
    it("POST /orcamentos → define limite", async () => {

    await request(app).post("/auth/register").send({ email: "user@test.com", password: "123456" });
    const loginRes = await request(app).post("/auth/login").send({ email: "user@test.com", password: "123456" });
    const token = loginRes.body.token;

    const catRes = await request(app)
        .post("/categorias")
        .set("Authorization", `Bearer ${token}`)
        .send({ nome: "Teste", tipo: "despesa" });

    const res = await request(app)
        .post("/orcamentos")
        .set("Authorization", `Bearer ${token}`)
        .send({ categoriaId: catRes.body.id, valor: 1500 });

    expect(res.status).toBe(201);
    expect(res.body.valor).toBe(1500);
});
})