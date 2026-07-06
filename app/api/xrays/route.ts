import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getSession();

  if (!session || (session.role !== "ADMIN" && session.role !== "DENTISTA")) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get("patientId");

  if (!patientId) {
    return NextResponse.json({ error: "ID do paciente é obrigatório" }, { status: 400 });
  }

  if (session.role === "DENTISTA") {
    const patientHasAppt = await prisma.appointment.findFirst({
      where: {
        patientId,
        dentistId: session.id,
      },
    });
    if (!patientHasAppt) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }
  }

  try {
    const xrays = await prisma.patientDocument.findMany({
      where: {
        patientId,
        type: "RAIO_X",
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(xrays);
  } catch (error) {
    console.error("Error fetching xrays:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await getSession();

  if (!session || (session.role !== "ADMIN" && session.role !== "DENTISTA")) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { patientId, name, data } = body;

    if (!patientId || !name || !data) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
    }

    if (session.role === "DENTISTA") {
      const patientHasAppt = await prisma.appointment.findFirst({
        where: {
          patientId,
          dentistId: session.id,
        },
      });
      if (!patientHasAppt) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
      }
    }

    // Create the X-ray document
    const xray = await prisma.patientDocument.create({
      data: {
        patientId,
        name,
        type: "RAIO_X",
        data,
      },
    });

    // Notify patient if they have a user account
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: { userId: true, name: true },
    });

    if (patient?.userId) {
      await prisma.notification.create({
        data: {
          userId: patient.userId,
          message: `Um novo exame de raio-x foi anexado ao seu prontuário (${name}).`,
        },
      });
    }

    return NextResponse.json(xray, { status: 201 });
  } catch (error) {
    console.error("Error creating xray:", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const session = await getSession();

  if (!session || (session.role !== "ADMIN" && session.role !== "DENTISTA")) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "ID do raio-x é obrigatório" }, { status: 400 });
  }

  try {
    // Make sure it is indeed a RAIO_X type document to prevent deleting general documents via this endpoint
    const existingDoc = await prisma.patientDocument.findUnique({
      where: { id },
      select: { type: true, patientId: true }
    });

    if (!existingDoc || existingDoc.type !== "RAIO_X") {
      return NextResponse.json({ error: "Exame não encontrado" }, { status: 404 });
    }

    if (session.role === "DENTISTA") {
      const patientHasAppt = await prisma.appointment.findFirst({
        where: {
          patientId: existingDoc.patientId,
          dentistId: session.id,
        },
      });
      if (!patientHasAppt) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
      }
    }

    await prisma.patientDocument.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Raio-x excluído com sucesso" });
  } catch (error) {
    console.error("Error deleting xray:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
