import { NextResponse } from "next/server";

export  async function POST(req: Request) {
        const { nome, valor, categoria, data } = await req.json()

        if (!nome || !valor || !categoria || !data) {
            return NextResponse.json({ erro: "Dados incompletos."}, { status: 400 });
        }

         // Aqui você salvaria os dados no banco de dados
        return NextResponse.json({ sucesso: true, message: "conta salva com sucesso!"}, { status: 201 });
    }