"use client"

import { IconEye, IconEyeOff, IconCopy, IconCheck } from "@tabler/icons-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import Link from "next/link"

interface UserCardsProps {
  accountNumber: string
  accountName: string
  balance: number
}

export default function UserCards({ accountNumber, accountName, balance }: UserCardsProps) {
  const [isBalanceVisible, setIsBalanceVisible] = useState(true)
  const [isCopied, setIsCopied] = useState(false)
  
  const handleCopyAccountNumber = () => {
    navigator.clipboard.writeText(accountNumber)
    setIsCopied(true)
    setTimeout(() => setIsCopied(false), 2000)
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card flex flex-col gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Account Balance</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {isBalanceVisible
             ? `$${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
             : "••••••••"}
          </CardTitle>
          <CardAction>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsBalanceVisible(!isBalanceVisible)}
            >
              {isBalanceVisible ? (
                <IconEyeOff className="h-4 w-4" />
              ) : (
                <IconEye className="h-4 w-4" />
              )}
            </Button>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {accountName}
          </div>
          <div className="text-muted-foreground flex items-center gap-2">
            {isBalanceVisible
             ? accountNumber
             : "••••••••••"}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleCopyAccountNumber}
            >
              {isCopied ? (
                <IconCheck className="h-3 w-3 text-green-600" />
              ) : (
                <IconCopy className="h-3 w-3" />
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Quick Actions</CardDescription>
          <CardTitle className="text-xl font-semibold">
            Manage Your Account
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex flex-col gap-2">
          <Button className="w-full" variant="default" asChild>
            <Link href="/user/deposit">Deposit</Link>
          </Button>
          
          <Button className="w-full" variant="default" asChild>
            <Link href="/user/transfer">Transfer</Link>
          </Button>
          
          <Button className="w-full" variant="default" asChild>
            <Link href="/user/withdraw">Withdraw</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}