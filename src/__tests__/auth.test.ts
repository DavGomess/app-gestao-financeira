import request from "supertest";
import app from "../app";

describe("Auth", () => {
    it("POST /auth/register → 400 se email inválido", async () => {
        const res = await request(app)
            .post("/auth/register")
            .send({ email: "invalido", password: "123456" });

    expect(res.status).toBe(400);
    expect(res.body.errors).toContainEqual(
        expect.objectContaining({ field: "email" })
    );
});

    it("POST /auth/login → retorna token", async () => {
        await request(app)
            .post("/auth/register")
            .send({ email: "login@test.com", password: "123456"});

        const res = await request(app)
            .post("/auth/login")
            .send({ email: "login@test.com", password: "123456" });
        
        expect(res.status).toBe(200);
        expect(res.body.token).toBeDefined();
    });

    it("POST /auth/login → 400 se senha vazia", async () => {
        const res = await request(app)
            .post("/auth/login")
            .send({ email: "login@test.com", password: "" });

        expect(res.status).toBe(400);
        expect(res.body.errors).toContainEqual(
            expect.objectContaining({ field: "password" })
        );
    });
});