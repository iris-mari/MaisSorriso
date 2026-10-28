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
    const dateParam = searchParams.get("date"); // Formato YYYY-MM-DD
    const monthParam = searchParams.get("month"); // Formato YYYY-MM
    const dentistIdsParam = searchParams.get("dentistIds"); // IDs separados por vírgula

    let where: any = {};

    // 1. RBAC: Dentistas só visualizam suas próprias consultas
    if (session.role === "DENTISTA") {
      where.dentistId = session.id;
    } else if (session.role === "ADMIN" && dentistIdsParam) {
      // Administrador pode filtrar por um ou mais dentistas específicos
      const ids = dentistIdsParam.split(",").map((id) => id.trim()).filter(Boolean);
      if (ids.length > 0) {
        where.dentistId = { in: ids };
      }
    }

    // 2. Filtro de Data
    if (dateParam) {
      const [year, month, day] = dateParam.split("-").map(Number);
      const startOfDay = new Date(year, month - 1, day, 0, 0, 0, 0);
      const endOfDay = new Date(year, month - 1, day, 23, 59, 59, 999);
      where.date = {
        gte: startOfDay,
        lte: endOfDay,
      };
    } else if (monthParam) {
      const [year, month] = monthParam.split("-").map(Number);
      const startOfMonth = new Date(year, month - 1, 1, 0, 0, 0, 0);
      const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);
      where.date = {
        gte: startOfMonth,
        lte: endOfMonth,
      };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        dentist: {
          select: {
            id: true,
            name: true,
            role: true,
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
    const { patientId, date, dentistId, procedure, status } = body;

    if (!patientId || !date) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 });
    }

    // Forçar dentistId se for DENTISTA logado
    const targetDentistId = session.role === "DENTISTA" ? session.id : (dentistId || null);

    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        date: new Date(date),
        dentistId: targetDentistId,
        procedure: procedure || null,
        status: status || "CONFIRMADO",
      },
      include: {
        patient: true,
        dentist: {
          select: {
            id: true,
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
