import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordResetEmail } from "@/lib/email";
import { randomBytes } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    console.log("🔐 Password reset requested for:", email);

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success to prevent email enumeration attacks
    // Even if user doesn't exist, we pretend to send an email
    if (!user) {
      console.log("⚠️ User not found, but returning success");
      return NextResponse.json({
        success: true,
        message: "If an account exists with this email, you will receive a password reset link.",
      });
    }

    // Delete any existing password reset tokens for this user
    await prisma.verificationToken.deleteMany({
      where: {
        userId: user.id,
      },
    });

    console.log("🗑️ Deleted old tokens");

    // Generate new reset token
    const resetToken = randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

    console.log("🔑 Generated new reset token");

    // Save reset token to database
    await prisma.verificationToken.create({
      data: {
        token: resetToken,
        userId: user.id,
        expires: expiresAt,
      },
    });

    console.log("✅ Token saved to database");

    // Send password reset email
    try {
      await sendPasswordResetEmail(
        {
          name: user.name,
          email: user.email,
        },
        resetToken
      );
      console.log("📧 Password reset email sent successfully");
    } catch (emailError) {
      console.error("❌ Failed to send reset email:", emailError);
      // Don't throw error to user, just log it
    }

    return NextResponse.json({
      success: true,
      message: "If an account exists with this email, you will receive a password reset link.",
    });
  } catch (error: unknown) {
    console.error("❌ Forgot password error:", error);
    return NextResponse.json(
      { error: "Failed to process request" },
      { status: 500 }
    );
  }
}