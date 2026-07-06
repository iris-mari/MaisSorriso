import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "DENTISTA")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const myOnly = searchParams.get("myOnly") === "true";

  try {
    let where = {};
    if (session.role === "DENTISTA" && myOnly) {
      where = {
        appointments: {
          some: {
            dentistId: session.id,
          },
        },
      };
    }

    const patients = await prisma.patient.findMany({
      where,
      include: {
        user: {
          select: {
            cpf: true,
            email: true,
          }
        }
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(patients);
  } catch (error) {
    console.error("Error fetching patients:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "DENTISTA")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, cpf, dateOfBirth, phone, email } = body;

    if (!name || !cpf || !dateOfBirth || !phone) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
    }

    const cleanCpf = cpf.replace(/\D/g, "");

    let user = await prisma.user.findUnique({
      where: { cpf: cleanCpf },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name,
          cpf: cleanCpf,
          email: email || null,
          dateOfBirth: new Date(dateOfBirth),
          phone,
          role: "CLIENTE",
          status: "APPROVED"
        }
      });
    }

    const patient = await prisma.patient.create({
      data: {
        userId: user.id,
        name,
        dateOfBirth: new Date(dateOfBirth),
        phone,
      },
    });

    return NextResponse.json(patient, { status: 201 });
  } catch (error) {
    console.error("Error creating patient:", error);
    return NextResponse.json({ error: "Erro interno do servidor", details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
