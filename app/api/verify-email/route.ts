import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.redirect(
        new URL("/verification-failed?error=no-token", request.url)
      );
    }

    // Find verification token
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verificationToken) {
      return NextResponse.redirect(
        new URL("/verification-failed?error=invalid-token", request.url)
      );
    }

    // Check if token has expired
    if (new Date() > verificationToken.expires) {
      // Delete expired token
      await prisma.verificationToken.delete({
        where: { token },
      });
      
      return NextResponse.redirect(
        new URL("/verification-failed?error=expired", request.url)
      );
    }

    // Update user's emailVerified status
    await prisma.user.update({
      where: { id: verificationToken.userId },
      data: { emailVerified: true },
    });

    // Delete the used token
    await prisma.verificationToken.delete({
      where: { token },
    });

    // Redirect to success page
    return NextResponse.redirect(
      new URL("/verification-success", request.url)
    );
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.redirect(
      new URL("/verification-failed?error=server-error", request.url)
    );
  }
}