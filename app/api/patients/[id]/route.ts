import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "DENTISTA")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;

    if (session.role === "DENTISTA") {
      const patientHasAppt = await prisma.appointment.findFirst({
        where: {
          patientId: id,
          dentistId: session.id,
        },
      });
      if (!patientHasAppt) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    const body = await request.json();
    const { name, age, phone } = body;

    const patient = await prisma.patient.update({
      where: { id },
      data: {
        name,
        age: age ? parseInt(age.toString()) : undefined,
        phone,
      },
    });

    return NextResponse.json(patient);
  } catch (error) {
    console.error("Error updating patient:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "DENTISTA")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;

    if (session.role === "DENTISTA") {
      const patientHasAppt = await prisma.appointment.findFirst({
        where: {
          patientId: id,
          dentistId: session.id,
        },
      });
      if (!patientHasAppt) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    await prisma.patient.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Patient deleted" });
  } catch (error) {
    console.error("Error deleting patient:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
