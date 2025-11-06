import request from "supertest";
import app from "../app"

let token: string;

beforeAll(async () => { 
    await request(app)
        .post("/auth/register")
        .send({ email: "user@test.com", password: "123456" });

    const loginRes = await request(app)
    .post("/auth/login")
    .send({ email: "user@test.com", password: "123456" });

    token = loginRes.body.token;
});

describe("Transações", () => {
    it("GET /transacoes → lista transações", async () => {
        const res = await request(app)
            .get("/transacoes")
            .set("Authorization", `Bearer ${token}`)

        expect(res.status).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});