import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "DENTISTA")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const patientId = searchParams.get("patientId");

    if (!patientId) {
      return NextResponse.json({ error: "Patient ID is required" }, { status: 400 });
    }

    if (session.role === "DENTISTA") {
      const patientHasAppt = await prisma.appointment.findFirst({
        where: {
          patientId,
          dentistId: session.id,
        },
      });
      if (!patientHasAppt) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    const records = await prisma.dentalRecord.findMany({
      where: { patientId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(records);
  } catch (error) {
    console.error("Error fetching dental records:", error);
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
    const { patientId, toothNumber, description } = body;

    if (!patientId || toothNumber === undefined || !description) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    if (session.role === "DENTISTA") {
      const patientHasAppt = await prisma.appointment.findFirst({
        where: {
          patientId,
          dentistId: session.id,
        },
      });
      if (!patientHasAppt) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
    }

    const record = await prisma.dentalRecord.create({
      data: {
        patientId,
        toothNumber: parseInt(toothNumber),
        description,
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (error) {
    console.error("Error creating dental record:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
