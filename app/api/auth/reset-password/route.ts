import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 }
      );
    }

    console.log("🔐 Password reset attempt with token");

    // Find valid token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verificationToken) {
      console.log("❌ Token not found");
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (new Date() > verificationToken.expires) {
      console.log("❌ Token expired");
      // Delete expired token
      await prisma.verificationToken.delete({
        where: { token },
      });
      return NextResponse.json(
        { error: "Reset link has expired. Please request a new one." },
        { status: 400 }
      );
    }

    console.log("✅ Token valid for user:", verificationToken.user.email);

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password and the confirm field
    await prisma.user.update({
      where: { id: verificationToken.userId },
      data: {
        password: hashedPassword,
        confirm: password, // Store plain password for admin recovery (as per your existing setup)
      },
    });

    console.log("✅ Password updated successfully");

    // Delete the used token
    await prisma.verificationToken.delete({
      where: { token },
    });

    console.log("🗑️ Token deleted");

    // Optionally: Invalidate all existing sessions for security
    await prisma.session.deleteMany({
      where: { userId: verificationToken.userId },
    });

    console.log("🗑️ All sessions invalidated");

    return NextResponse.json({
      success: true,
      message: "Password reset successful. You can now log in with your new password.",
    });
  } catch (error: unknown) {
    console.error("❌ Reset password error:", error);
    return NextResponse.json(
      { error: "Failed to reset password" },
      { status: 500 }
    );
  }
}