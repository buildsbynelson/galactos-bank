import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import UserCards from "@/components/user-cards"

export default async function UserPage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      accountNumber: true,
      balance: true,
    },
  })

  if (!user) {
    redirect("/login")
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-2">
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
        <UserCards
          accountNumber={user.accountNumber}
          accountName={user.name}
          balance={parseFloat(user.balance.toString())} // ← Convert here
        />
        
        <div className="px-4 lg:px-6">
          <ChartAreaInteractive />
        </div>
      </div>
    </div>
  )
}