import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "DENTISTA")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const existingRecord = await prisma.dentalRecord.findUnique({
      where: { id },
    });

    if (!existingRecord) {
      return NextResponse.json({ error: "Dental record not found" }, { status: 404 });
    }

    if (session.role === "DENTISTA") {
      const patientHasAppt = await prisma.appointment.findFirst({
        where: {
          patientId: existingRecord.patientId,
          dentistId: session.id,
        },
      });
      if (!patientHasAppt) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    const body = await request.json();
    const { description } = body;

    const record = await prisma.dentalRecord.update({
      where: { id },
      data: {
        description,
      },
    });

    return NextResponse.json(record);
  } catch (error) {
    console.error("Error updating dental record:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "DENTISTA")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const existingRecord = await prisma.dentalRecord.findUnique({
      where: { id },
    });

    if (!existingRecord) {
      return NextResponse.json({ error: "Dental record not found" }, { status: 404 });
    }

    if (session.role === "DENTISTA") {
      const patientHasAppt = await prisma.appointment.findFirst({
        where: {
          patientId: existingRecord.patientId,
          dentistId: session.id,
        },
      });
      if (!patientHasAppt) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    await prisma.dentalRecord.delete({
      where: { id },
    });
    return NextResponse.json({ message: "Dental record deleted" });
  } catch (error) {
    console.error("Error deleting dental record:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
