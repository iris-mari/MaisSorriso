import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  
  if (!session || session.role !== "CLIENTE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const patient = await prisma.patient.findUnique({
      where: { userId: session.id },
    });

    if (!patient) {
      return NextResponse.json({ error: "Paciente não associado" }, { status: 404 });
    }

    const documents = await prisma.patientDocument.findMany({
      where: { 
        patientId: patient.id,
        NOT: {
          type: "RAIO_X"
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(documents);
  } catch (error) {
    console.error("Error fetching client documents:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();

  if (!session || session.role !== "CLIENTE") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, type, data } = body;

    if (!name || !type || !data) {
      return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
    }

    const patient = await prisma.patient.findUnique({
      where: { userId: session.id },
    });

    if (!patient) {
      return NextResponse.json({ error: "Paciente não encontrado" }, { status: 404 });
    }

    const document = await prisma.patientDocument.create({
      data: {
        patientId: patient.id,
        name,
        type,
        data,
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error) {
    console.error("Error uploading document:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
