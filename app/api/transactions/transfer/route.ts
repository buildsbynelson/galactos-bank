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

    const { receiverAccountNumber, recipientName, amount, pin, description } = await request.json();

    // Validate inputs
    if (!receiverAccountNumber || !amount || !pin) {
      return NextResponse.json(
        { error: "All fields required" },
        { status: 400 }
      );
    }

    // Validate account number is 8 digits
    if (receiverAccountNumber.length !== 8 || !/^\d+$/.test(receiverAccountNumber)) {
      return NextResponse.json(
        { error: "Account number must be 8 digits" },
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

    // Get sender and validate PIN OUTSIDE the transaction
    const sender = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        accountNumber: true,
        balance: true,
        pin: true,
      }
    });

    if (!sender) {
      return NextResponse.json(
        { error: "Sender not found" },
        { status: 404 }
      );
    }

    // Validate PIN before transaction
    if (!sender.pin || !(await bcrypt.compare(pin, sender.pin))) {
      return NextResponse.json(
        { error: "Invalid PIN" },
        { status: 401 }
      );
    }

    // Check balance before transaction
    const senderBalance = parseFloat(sender.balance.toString());
    if (senderBalance < transferAmount) {
      return NextResponse.json(
        { error: "Insufficient balance" },
        { status: 400 }
      );
    }

    // Execute transaction - only update sender's balance
    const result = await prisma.$transaction(async (tx) => {
      // Calculate new balance
      const newSenderBalance = senderBalance - transferAmount;

      // Update sender balance only
      await tx.user.update({
        where: { id: sender.id },
        data: { balance: new Decimal(newSenderBalance) },
      });

      // Create transaction record
      const txnRef = generateTransactionRef();
      const transaction = await tx.transaction.create({
        data: {
          reference: txnRef,
          amount: new Decimal(transferAmount),
          type: "TRANSFER",
          status: "COMPLETED",
          description: description || `Transfer to ${receiverAccountNumber}`,
          senderId: sender.id,
          senderName: sender.name,
          senderAccount: sender.accountNumber,
          receiverAccount: receiverAccountNumber,
          balanceBefore: sender.balance,
          balanceAfter: new Decimal(newSenderBalance),
        },
      });

      return {
        transaction,
        newBalance: newSenderBalance,
      };
    }, {
      maxWait: 5000,
      timeout: 10000,
    });

    return NextResponse.json({
      success: true,
      message: "Transfer successful",
      transaction: {
        reference: result.transaction.reference,
        date: result.transaction.createdAt.toISOString(),
        receiver: recipientName, // Since we're not checking receiver, use placeholder
        receiverAccount: receiverAccountNumber,
        amount: transferAmount.toString(),
        balanceAfter: result.newBalance.toString(),
      }
    });
  } catch (error: unknown) {
    console.error("Transfer error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Transfer failed" },
      { status: 400 }
    );
  }
}