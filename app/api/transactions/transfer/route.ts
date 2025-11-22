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

    const { receiverAccountNumber, amount, pin, description, recipientName, bankName, imfVerified } = await request.json();

    console.log("Received transfer request:", { recipientName, bankName, receiverAccountNumber, amount });

    // Validate inputs
    if (!receiverAccountNumber || !amount || !pin) {
      return NextResponse.json(
        { error: "All fields required" },
        { status: 400 }
      );
    }

    // Validate account number is 8 digits
    if (receiverAccountNumber.length < 8 || !/^\d+$/.test(receiverAccountNumber)) {
      return NextResponse.json(
        { error: "Account number must be at least 8 digits" },
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

    // STEP 1: Get sender and check restriction status
    const sender = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        accountNumber: true,
        balance: true,
        pin: true,
        isRestricted: true,
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

    // CRITICAL: Check if account is restricted AND IMF not verified
    if (sender.isRestricted && !imfVerified) {
      return NextResponse.json(
        { 
          error: "ACCOUNT_RESTRICTED",
          message: "IMF verification required to complete this transfer"
        },
        { status: 403 }
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

    // Create pending transaction (NO balance update - admin will approve)
    const txnRef = generateTransactionRef();
    const transaction = await prisma.transaction.create({
      data: {
        reference: txnRef,
        amount: new Decimal(transferAmount),
        type: "TRANSFER",
        status: "PENDING",
        description: description || `Transfer to ${recipientName || receiverAccountNumber}${bankName ? ` via ${bankName}` : ''}`,
        senderId: sender.id,
        senderName: sender.name,
        senderAccount: sender.accountNumber,
        receiverName: recipientName || null,
        receiverAccount: receiverAccountNumber,
        balanceBefore: sender.balance,
        balanceAfter: sender.balance, // Balance stays same until approved
      },
    });

    // ✅ CRITICAL FIX: Return exact structure that success page expects
    const responseData = {
      success: true,
      message: "Transfer submitted for approval",
      transaction: {
        reference: transaction.reference,
        date: transaction.createdAt.toISOString(),
        senderAccount: sender.accountNumber,
        receiver: recipientName || "Pending Verification",
        receiverAccount: receiverAccountNumber,
        bankName: bankName || "Not Specified",
        amount: transferAmount.toString(),
        balanceBefore: senderBalance.toString(),
        balanceAfter: senderBalance.toString(),
        status: "PENDING",
      }
    };

    console.log("API Response:", responseData);

    return NextResponse.json(responseData);

  } catch (error: unknown) {
    console.error("Transfer error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Transfer failed" },
      { status: 500 }
    );
  }
}