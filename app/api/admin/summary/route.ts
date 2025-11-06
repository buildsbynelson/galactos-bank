import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Count total users (excluding admin)
    const totalUsers = await prisma.user.count({
      where: { role: "USER" },
    });

    // Sum all user balances
    const balanceSum = await prisma.user.aggregate({
      where: { role: "USER" },
      _sum: { balance: true },
    });

    // Count transactions
    const totalTransactions = await prisma.transaction.count();

    return NextResponse.json({
      totalUsers,
      totalBalance: balanceSum._sum.balance?.toString() || "0",
      totalTransactions,
    });
  } catch  {
    return NextResponse.json(
      { error: "Failed to fetch summary" },
      { status: 500 }
    );
  }
}