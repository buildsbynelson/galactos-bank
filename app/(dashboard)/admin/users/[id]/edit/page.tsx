import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import EditUserUI from "./components/edituser"

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getSession()

  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      country: true,
      accountNumber: true,
      balance: true,
      emailVerified: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          sentTransactions: true,
          receivedTransactions: true,
        },
      },
    },
  })

  if (!user) {
    redirect("/admin/users")
  }

// Serialize data for client component (convert Decimal and Date to plain types)
const serializedUser = {
  id: user.id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  country: user.country,
  accountNumber: user.accountNumber,
  balance: parseFloat(user.balance.toString()), // Convert Decimal to number
  emailVerified: user.emailVerified,
  role: user.role,
  createdAt: user.createdAt.toISOString(), // Convert Date to string
  updatedAt: user.updatedAt.toISOString(),
  _count: user._count
}

return <EditUserUI user={serializedUser} />
}