import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "DENTISTA")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    let totalPatients, appointmentsToday, totalRecords, nextAppointments;

    if (session.role === "DENTISTA") {
      [totalPatients, appointmentsToday, totalRecords, nextAppointments] = await Promise.all([
        prisma.patient.count({
          where: {
            appointments: {
              some: { dentistId: session.id }
            }
          }
        }),
        prisma.appointment.count({
          where: {
            dentistId: session.id,
            date: {
              gte: today,
              lt: tomorrow,
            },
          },
        }),
        prisma.dentalRecord.count({
          where: {
            patient: {
              appointments: {
                some: { dentistId: session.id }
              }
            }
          }
        }),
        prisma.appointment.findMany({
          where: {
            dentistId: session.id,
            date: {
              gte: new Date(),
            },
          },
          include: {
            patient: true,
          },
          take: 3,
          orderBy: {
            date: "asc",
          },
        }),
      ]);
    } else {
      [totalPatients, appointmentsToday, totalRecords, nextAppointments] = await Promise.all([
        prisma.patient.count(),
        prisma.appointment.count({
          where: {
            date: {
              gte: today,
              lt: tomorrow,
            },
          },
        }),
        prisma.dentalRecord.count(),
        prisma.appointment.findMany({
          where: {
            date: {
              gte: new Date(),
            },
          },
          include: {
            patient: true,
          },
          take: 3,
          orderBy: {
            date: "asc",
          },
        }),
      ]);
    }

    return NextResponse.json({
      totalPatients,
      appointmentsToday,
      totalRecords,
      nextAppointments,
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
