// app/api/user/verify-imf/route.ts
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getSession } from "@/lib/session"

export async function POST(request: NextRequest) {
  try {
    const session = await getSession()
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { imfCode } = await request.json()

    if (!imfCode) {
      return NextResponse.json(
        { error: "IMF code is required" },
        { status: 400 }
      )
    }

    // Get user data
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        isRestricted: true,
        email: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      )
    }

    if (!user.isRestricted) {
      return NextResponse.json(
        { error: "Account is not restricted" },
        { status: 400 }
      )
    }

    // Get the current admin IMF code from system settings
    const adminImfSetting = await prisma.systemSettings.findUnique({
      where: { key: "imf_code" }
    })

    if (!adminImfSetting) {
      return NextResponse.json(
        { error: "IMF verification system is not configured. Please contact support." },
        { status: 500 }
      )
    }

    // Format user input to match admin format
    // User can enter "8798" or "IMF-8798" or "imf-8798"
    const userInput = imfCode.trim().toUpperCase()
    const formattedUserInput = userInput.startsWith('IMF-') 
      ? userInput 
      : `IMF-${userInput}`

    // Compare with admin's code
    if (adminImfSetting.value.toUpperCase() !== formattedUserInput) {
      return NextResponse.json(
        { error: "Invalid IMF code. Please contact admin for the correct code." },
        { status: 400 }
      )
    }

    // Code is valid - user has verified with admin's IMF code
    // You can optionally log this verification or temporarily lift restriction
    
    return NextResponse.json({
      success: true,
      message: "IMF code verified successfully. You may now proceed with your transfer."
    })

  } catch (error: unknown) {
    console.error("IMF verification error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to verify IMF code" },
      { status: 500 }
    )
  }
}