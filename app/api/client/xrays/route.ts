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

    const xrays = await prisma.patientDocument.findMany({
      where: {
        patientId: patient.id,
        type: "RAIO_X",
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(xrays);
  } catch (error) {
    console.error("Error fetching client xrays:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
