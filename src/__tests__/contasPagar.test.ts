import request from "supertest";
import app from "../app";

let token: string;
let categoriaId: number;

beforeAll(async () => {
    await request(app)
        .post("/auth/register")
        .send({ email: "user@test.com", password:  "123456" });
    const loginRes =  await request(app)
        .post("/auth/login")
        .send({ email: "user@test.com", password:  "123456" });
    token = loginRes.body.token;

    const catRes = await request(app)
        .post("/categorias")
        .set("Authorization", `Bearer ${token}`)
        .send({ nome: "Moradia", tipo: "despesa" });
    categoriaId = catRes.body.id;
})

describe("Contas a Pagar", () => {
    it("POST /contasPagar → cria despesa", async () => {
        const res = await request(app)
            .post("/contasPagar")
            .set("Authorization", `Bearer ${token}`)
            .send({ nome: "Aluguel", valor: 1200.5, data: "2025-12-01", categoriaId, })

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty("id");
        expect(res.body.nome).toBe("Aluguel");  
    });

    it("POST /contasPagar → 400 se valor negativo", async () => {
        const res = await request(app)
            .post("/contasPagar")
            .set("Authorization", `Bearer ${token}`)
            .send({
                nome: "Erro",
                valor: -100,
                data: "2025-12-01",
                categoriaId,
            });

        expect(res.status).toBe(400);
        expect(res.body.errors).toContainEqual(
        expect.objectContaining({ field: "valor" })
    );
});

    it("POST /contasPagar → 400 se data inválida", async () => {
        const res = await request(app)
            .post("/contasPagar")
            .set("Authorization", `Bearer ${token}`)
            .send({
                nome: "Erro",
                valor: 100,
                data: "2025-13-01", 
                categoriaId,
        });

        expect(res.status).toBe(400);
        expect(res.body.errors).toContainEqual(
        expect.objectContaining({ field: "data" })
    );
});
});