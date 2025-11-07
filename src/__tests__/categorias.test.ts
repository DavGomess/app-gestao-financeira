import request from "supertest";
import app from "../app";

let token: string;

beforeAll(async () => {
    await request(app)
        .post("/auth/register")
        .send({ email: "user@test.com", password: "123456" });
    
    const res = await request(app)
        .post("/auth/login")
        .send({ email: "user@test.com", password: "123456" })
    token = res.body.token;
})

describe("Categorias", () => {
    it("POST /categorias → cria categoria", async () => {
    const res = await request(app)
        .post("/categorias")
        .set("Authorization", `Bearer ${token}`)
        .send({ nome: "Moradia", tipo: "despesa" });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.nome).toBe("Moradia");
});

    it("POST /categorias → 400 se tipo inválido", async () => {
    const res = await request(app)
        .post("/categorias")
        .set("Authorization", `Bearer ${token}`)
        .send({ nome: "Aluguel", tipo: "invalido" });

    expect(res.status).toBe(400);
    expect(res.body.errors).toContainEqual(
        expect.objectContaining({ field: "tipo" })
    );
});
});