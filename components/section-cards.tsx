import { IconTrendingUp } from "@tabler/icons-react"
import { Badge } from "@/components/ui/badge"

import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { RegenerateIMFButton } from "@/components/regenerate-imf-button"

export async function SectionCards() {
  // Fetch data directly in the component
  const totalUsers = await prisma.user.count({
    where: { role: "USER" },
  })

  const totalBalance = await prisma.user.aggregate({
    where: { role: "USER" },
    _sum: { balance: true },
  })

  const activeAccounts = await prisma.user.count({
    where: {
      role: "USER",
      emailVerified: true,
    },
  })

  // Fetch IMF code from database
  let imfCode = "IMF-0000"
  try {
    const imfSetting = await prisma.systemSettings.findUnique({
      where: { key: "imf_code" }
    })
    
    if (imfSetting) {
      imfCode = imfSetting.value
    } else {
      // Create initial IMF code if it doesn't exist
      const randomDigits = Math.floor(1000 + Math.random() * 9000)
      imfCode = `IMF-${randomDigits}`
      
      await prisma.systemSettings.create({
        data: {
          key: "imf_code",
          value: imfCode
        }
      })
    }
  } catch (error) {
    console.error("Error fetching IMF code:", error)
  }

  const stats = {
    totalBalance: parseFloat(totalBalance._sum.balance?.toString() || "0"),
    totalUsers,
    activeAccounts,
    imfCode,
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Balance</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            ${stats.totalBalance.toLocaleString('en-US', { 
              minimumFractionDigits: 2, 
              maximumFractionDigits: 2 
            })}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              Active
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Combined user balances
          </div>
          <div className="text-muted-foreground">
            Total funds in system
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Users</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.totalUsers.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              Active
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Registered accounts
          </div>
          <div className="text-muted-foreground">
            Total user base
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active Accounts</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.activeAccounts.toLocaleString()}
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              Verified
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Email verified users
          </div>
          <div className="text-muted-foreground">
            {totalUsers > 0 
              ? Math.round((stats.activeAccounts / totalUsers) * 100) 
              : 0}% verification rate
          </div>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>IMF Verification Code</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {stats.imfCode}
          </CardTitle>
          <CardAction>
            <RegenerateIMFButton currentCode={stats.imfCode} />
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Current verification code
          </div>
          <div className="text-muted-foreground">
            Valid until regenerated
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}