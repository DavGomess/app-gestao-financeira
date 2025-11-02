import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export class AuthService {
    static async register({ email, password }: { email: string; password: string }) {
    if (!email || !password) {
        throw new Error("E-mail e senha são obrigatórios");
    }
    if (!email.includes("@")) {
        throw new Error("E-mail inválido");
    }
    if (password.length < 6) {
        throw new Error("A senha deve ter pelo menos 6 caracteres");
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new Error("E-mail já cadastrado");

    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
        data: { email, password: hashed },
    });

    return { id: user.id, email: user.email };
}

    static async login({ email, password }: { email: string; password: string }) {
    if (!email || !password) {
        throw new Error("E-mail e senha são obrigatórios");
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new Error("Usuário não encontrado");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new Error("Senha incorreta");

    return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });
}
}