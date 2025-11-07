import request from "supertest";
import app from "../app";

let token: string;
let categoriaId: number;

beforeAll(async () => {
    await request(app)
        .post("/auth/register")
        .send({ email: "user@test.com", password: "123456" })
    
    const loginRes = await request(app)
        .post("/auth/login")
        .send({ email: "user@test.com", password: "123456" })
    token = loginRes.body.token;

    const catRes = await request(app)
        .post("/categorias")
        .set("Authorization", `Bearer ${token}`)
        .send({ nome: "Moradia", tipo: "despesa" });

    categoriaId = catRes.body.id    
})

describe("Orçamentos", () => {
    it("POST /orcamentos → cria orçamento", async () => {

    const res = await request(app)
        .post("/orcamentos")
        .set("Authorization", `Bearer ${token}`)
        .send({ categoriaId, valor: 2000 });

    expect(res.status).toBe(200); 
    expect(res.body).toHaveProperty("categoriaId");
    expect(res.body.valor).toBe(2000);
});

    it("POST /orcamentos → 400 se valor negativo", async () => {
    const res = await request(app)
        .post("/orcamentos")
        .set("Authorization", `Bearer ${token}`)
        .send({ categoriaId, valor: -500 });

        expect(res.status).toBe(400);
        expect(res.body.errors).toContainEqual(
        expect.objectContaining({ field: "valor" })
        );
    });
})