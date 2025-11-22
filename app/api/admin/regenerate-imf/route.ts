import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// Generate a random 4-digit IMF code
function generateIMFCode(): string {
  const randomDigits = Math.floor(1000 + Math.random() * 9000)
  return `IMF-${randomDigits}`
}

export async function POST() {
  try {
    // Generate new IMF code
    const newCode = generateIMFCode()

    // Store in database - assuming you have a Settings or Config table
    // If you don't have one, you'll need to create it with Prisma
    const updatedSetting = await prisma.systemSettings.upsert({
      where: { key: "imf_code" },
      update: { 
        value: newCode,
        updatedAt: new Date()
      },
      create: {
        key: "imf_code",
        value: newCode
      }
    })

    return NextResponse.json({ 
      success: true, 
      code: updatedSetting.value 
    })
  } catch (error) {
    console.error("Error regenerating IMF code:", error)
    return NextResponse.json(
      { success: false, error: "Failed to regenerate IMF code" },
      { status: 500 }
    )
  }
}