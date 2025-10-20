import { NextResponse } from "next/server";

export async function POST() {
    const response = NextResponse.json({ message: "Logout realizado!"});
    response.cookies.set("token", "", { 
        path: "/",
        httpOnly: true,
        sameSite: "strict",
        secure: process.env.NODE_ENV === "production",
        expires: new Date(0) 
        });
    return response;
}