import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { login } from "@/lib/auth";

export async function POST(request: Request) {
  console.log("--> ENTERED LOGIN ROUTE");
  try {
    const { cpf } = await request.json();

    if (!cpf) {
      return NextResponse.json({ error: "CPF obrigatório" }, { status: 400 });
    }

    const cleanCpf = cpf.replace(/\D/g, "");

    const user = await prisma.user.findUnique({
      where: { cpf: cleanCpf },
    });

    if (!user) {
      return NextResponse.json({ error: "CPF não cadastrado" }, { status: 401 });
    }

    if (user.status !== "APPROVED") {
      return NextResponse.json({ error: "Sua conta ainda não foi aprovada pelo administrador" }, { status: 401 });
    }

    await login({ ...user, email: user.email || "" });

    return NextResponse.json({ 
      id: user.id, 
      name: user.name, 
      cpf: user.cpf, 
      role: user.role 
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
