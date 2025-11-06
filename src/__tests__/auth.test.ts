import request from "supertest";
import app from "../app";

describe("Auth", () => {
    it("POST /auth/register → cria usuário", async () => {
        const res = await request(app)
            .post("/auth/register")
            .send({ email: "test@test.com", password: "123456" });
        
        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty("id");
        expect(res.body.email).toBe("test@test.com");
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
});