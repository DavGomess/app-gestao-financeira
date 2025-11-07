import request from "supertest";
import app from "../app"

let token: string;

beforeAll(async () => { 
    await request(app)
        .post("/auth/register")
        .send({ email: "user@test.com", password: "123456" });

    const res = await request(app)
    .post("/auth/login")
    .send({ email: "user@test.com", password: "123456" });

    token = res.body.token;
});

describe("Transações", () => {
    it("GET /transacoes → lista transações", async () => {
        const res = await request(app)
            .get("/transacoes")
            .set("Authorization", `Bearer ${token}`)

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it("GET /transacoes/filtrar → 400 se termo ausente", async () => {
        const res = await request(app)
            .get("/transacoes/filtrar")
            .set("Authorization", `Bearer ${token}`);

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Termo de busca inválido");
    });

    it("GET /transacoes/filtrar → 200 com termo válido", async () => {
        const res = await request(app)
            .get("/transacoes/filtrar")
            .set("Authorization", `Bearer ${token}`)
            .query({ termo: "aluguel" });

        expect(res.status).toBe(200);
    });
});