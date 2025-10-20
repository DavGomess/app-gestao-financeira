import { comparePassword, generateToken, TokenPayload } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const { email, password } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        return NextResponse.json({ error: "Usuário não encontrado!" }, { status: 404 });
    }

    const isValid = await comparePassword(password, user.password);
    if (!isValid) {
        return NextResponse.json({ error: "Senha incorreta!" }, {status: 401 });
    }

    const payload: TokenPayload = {
        id: user.id,
        email: user.email,
        iat: Math.floor(Date.now() / 1000)
    };

    const token = generateToken(payload);

    const response = NextResponse.json({ message: "Login bem-sucedido!", user: { email: user.email } });
    
    response.cookies.set("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/"
    });

    return response;
}