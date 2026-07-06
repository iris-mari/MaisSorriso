import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const patientId = searchParams.get("patientId");

  if (!patientId) {
    return NextResponse.json({ error: "ID do paciente é obrigatório" }, { status: 400 });
  }

  // Admin can view any patient's budget.
  // Dentist can view budgets of their assigned patients.
  // Patient can only view their own budgets.
  if (session.role !== "ADMIN") {
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
    } else {
      const patient = await prisma.patient.findUnique({
        where: { id: patientId },
        select: { userId: true },
      });

      if (!patient || patient.userId !== session.id) {
        return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
      }
    }
  }

  try {
    const budgets = await prisma.budget.findMany({
      where: { patientId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(budgets);
  } catch (error) {
    console.error("Error fetching budgets:", error);
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
    const { patientId, description, value } = body;

    if (!patientId || !description || value === undefined) {
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

    const parsedValue = parseFloat(value.toString());
    if (isNaN(parsedValue)) {
      return NextResponse.json({ error: "Valor inválido" }, { status: 400 });
    }

    // Create the budget record
    const budget = await prisma.budget.create({
      data: {
        patientId,
        description,
        value: parsedValue,
      },
    });

    // Check if the patient has an associated User to notify
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      select: { userId: true, name: true },
    });

    if (patient?.userId) {
      const formattedValue = parsedValue.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });

      await prisma.notification.create({
        data: {
          userId: patient.userId,
          message: `Um novo orçamento de ${formattedValue} foi gerado para você. Descrição: ${description}`,
        },
      });
    }

    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    console.error("Error creating budget:", error);
    return NextResponse.json(
      {
        error: "Erro interno do servidor",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
