import request from "supertest";
import app from "../app";


describe("Resetar senha", () => {
    it("POST /auth/reset-password → envia email", async () => {
        await request(app)
            .post("/auth/register")
            .send({ email: "reset@test.com", password: "123456" });

        const res = await request(app)
            .post("/auth/reset-password")
            .send({ email: "reset@test.com" });

        expect(res.status).toBe(200);
        expect(res.body.message).toBe("E-mail de recuperação enviado");
    })
})