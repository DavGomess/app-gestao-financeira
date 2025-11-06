import request from "supertest";
import app from "../app";

describe("Categorias", () => {
    it("POST /categorias → cria categoria", async () => {

    await request(app)
        .post("/auth/register")
        .send({ email: "user@test.com", password: "123456" });

    const loginRes = await request(app)
        .post("/auth/login")
        .send({ email: "user@test.com", password: "123456" });

    const token = loginRes.body.token;

    const res = await request(app)
        .post("/categorias")
        .set("Authorization", `Bearer ${token}`)
        .send({ nome: "moradia", tipo: "despesa" });

    expect(res.status).toBe(201);
    });
});