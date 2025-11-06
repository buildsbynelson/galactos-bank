import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { generateTransactionRef } from "@/lib/account-generator";
import bcrypt from "bcryptjs";
import { Decimal } from "@prisma/client/runtime/library";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { receiverAccountNumber, amount, pin, description } = await request.json();

    // Validate inputs
    if (!receiverAccountNumber || !amount || !pin) {
      return NextResponse.json(
        { error: "All fields required" },
        { status: 400 }
      );
    }

    const transferAmount = parseFloat(amount);
    if (transferAmount <= 0) {
      return NextResponse.json(
        { error: "Invalid amount" },
        { status: 400 }
      );
    }

    // Use Prisma transaction for atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Get sender with lock (prevents concurrent modifications)
      const sender = await tx.user.findUnique({
        where: { id: session.user.id },
      });

      if (!sender) {
        throw new Error("Sender not found");
      }

      // Validate PIN
      if (!sender.pin || !(await bcrypt.compare(pin, sender.pin))) {
        throw new Error("Invalid PIN");
      }

      // Check balance
      const senderBalance = parseFloat(sender.balance.toString());
      if (senderBalance < transferAmount) {
        throw new Error("Insufficient balance");
      }

      // Get receiver
      const receiver = await tx.user.findUnique({
        where: { accountNumber: receiverAccountNumber },
      });

      if (!receiver) {
        throw new Error("Receiver account not found");
      }

      if (sender.id === receiver.id) {
        throw new Error("Cannot transfer to yourself");
      }

      // Calculate new balances
      const newSenderBalance = senderBalance - transferAmount;
      const newReceiverBalance = parseFloat(receiver.balance.toString()) + transferAmount;

      // Update sender balance
      await tx.user.update({
        where: { id: sender.id },
        data: { balance: new Decimal(newSenderBalance) },
      });

      // Update receiver balance
      await tx.user.update({
        where: { id: receiver.id },
        data: { balance: new Decimal(newReceiverBalance) },
      });

      // Create transaction record
      const txnRef = generateTransactionRef();
      const transaction = await tx.transaction.create({
        data: {
          reference: txnRef,
          amount: new Decimal(transferAmount),
          type: "TRANSFER",
          status: "COMPLETED",
          description: description || `Transfer to ${receiver.name}`,
          senderId: sender.id,
          senderName: sender.name,
          senderAccount: sender.accountNumber,
          receiverId: receiver.id,
          receiverName: receiver.name,
          receiverAccount: receiver.accountNumber,
          balanceBefore: sender.balance,
          balanceAfter: new Decimal(newSenderBalance),
        },
      });

      return {
        transaction,
        newBalance: newSenderBalance,
      };
    });

    return NextResponse.json({
      success: true,
      message: "Transfer successful",
      newBalance: result.newBalance,
      reference: result.transaction.reference,
    });
  } catch (error: unknown) {
    console.error("Transfer error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Transfer failed" },
      { status: 400 }
    );
  }
}