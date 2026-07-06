import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "DENTISTA")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    let where = {};
    if (session.role === "DENTISTA") {
      where = { dentistId: session.id };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: true,
        dentist: {
          select: {
            name: true,
          },
        },
      },
      orderBy: { date: "asc" },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "DENTISTA")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { patientId, date, dentistId } = body;

    if (!patientId || !date) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Force dentistId if user is DENTISTA
    const targetDentistId = session.role === "DENTISTA" ? session.id : (dentistId || null);

    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        date: new Date(date),
        dentistId: targetDentistId,
      },
      include: {
        patient: true,
        dentist: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (error) {
    console.error("Error creating appointment:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
