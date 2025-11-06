import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { generateTransactionRef } from "@/lib/account-generator";
import { Decimal } from "@prisma/client/runtime/library";

// ✅ UPDATED: params is now a Promise
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // ✅ ADDED: Await params
    const { id } = await params;

    const { action, amount, description } = await request.json();

    if (!action || !amount) {
      return NextResponse.json(
        { error: "Action and amount required" },
        { status: 400 }
      );
    }

    const changeAmount = parseFloat(amount);
    if (changeAmount <= 0) {
      return NextResponse.json(
        { error: "Amount must be positive" },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      // Get user - ✅ UPDATED: Use awaited id
      const user = await tx.user.findUnique({
        where: { id },
      });

      if (!user) {
        throw new Error("User not found");
      }

      const currentBalance = parseFloat(user.balance.toString());
      let newBalance: number;
      let txnType: "DEPOSIT" | "WITHDRAWAL";

      if (action === "add") {
        newBalance = currentBalance + changeAmount;
        txnType = "DEPOSIT";
      } else if (action === "subtract") {
        newBalance = currentBalance - changeAmount;
        txnType = "WITHDRAWAL";
        
        if (newBalance < 0) {
          throw new Error("Insufficient balance");
        }
      } else {
        throw new Error("Invalid action");
      }

      // Update balance - ✅ UPDATED: Use awaited id
      await tx.user.update({
        where: { id },
        data: { balance: new Decimal(newBalance) },
      });

      // Create transaction record
      const txnRef = generateTransactionRef();
      await tx.transaction.create({
        data: {
          reference: txnRef,
          amount: new Decimal(changeAmount),
          type: txnType,
          status: "COMPLETED",
          description: description || `Admin ${action} - by ${session.user.email}`,
          [action === "add" ? "receiverId" : "senderId"]: user.id,
          [action === "add" ? "receiverName" : "senderName"]: user.name,
          [action === "add" ? "receiverAccount" : "senderAccount"]: user.accountNumber,
          balanceBefore: user.balance,
          balanceAfter: new Decimal(newBalance),
        },
      });

      // Create deposit record if adding
      if (action === "add") {
        await tx.deposit.create({
          data: {
            userId: user.id,
            amount: new Decimal(changeAmount),
            status: "completed",
            description: description || `Admin credit`,
            adminEmail: session.user.email,
          },
        });
      }

      return { newBalance, previousBalance: currentBalance };
    });

    return NextResponse.json({
      success: true,
      message: `Balance ${action === "add" ? "added" : "subtracted"}`,
      ...result,
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to adjust balance" },
      { status: 400 }
    );
  }
}