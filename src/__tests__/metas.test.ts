import request from "supertest";
import app from "../app";

let token: string;
let categoriaId: number;

beforeAll(async () => {
    await request(app)
        .post("/auth/register")
        .send({ email: "user@test.com", password: "123456" });

        const loginRes = await request(app)
            .post("/auth/login")
            .send({ email: "user@test.com", password: "123456" });
        token = loginRes.body.token;

    const catRes = await request(app)
        .post("/categorias")
        .set("Authorization", `Bearer ${token}`)
        .send({ nome: "Economia", tipo: "receita" });

    categoriaId = catRes.body.id;
});

describe("Metas", () => {
    it("POST /metas → cria meta", async () => {
        const res = await request(app)
            .post("/metas")
            .set("Authorization", `Bearer ${token}`)
            .send({
                nome: "Carro Novo",
                valorAlvo: 50000,
                prazo: "2026-12-31",
                categoriaId,
            });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
});

    it("POST /metas → 400 se valorAlvo negativo", async () => {
        const res = await request(app)
            .post("/metas")
            .set("Authorization", `Bearer ${token}`)
            .send({
                nome: "Erro",
                valorAlvo: -100,
                prazo: "2026-12-31",
                categoriaId,
        });

        expect(res.status).toBe(400);
        expect(res.body.errors).toContainEqual(
        expect.objectContaining({ field: "valorAlvo" })
        );
    });
});