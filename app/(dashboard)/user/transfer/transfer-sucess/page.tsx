"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle2, FileText, Share2, X, Home } from "lucide-react"

interface TransferResult {
  transaction: {
    reference: string;
    date: string;
    receiver: string;
    receiverAccount: string;
    amount: string;
    balanceAfter: string;
  };
}

export default function TransactionSuccessPage() {
  const router = useRouter()
  const [transferResult, setTransferResult] = useState<TransferResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const result = sessionStorage.getItem("transferResult")
    if (!result) {
      router.push("/dashboard/transfer")
      return
    }
    setTransferResult(JSON.parse(result))
    setLoading(false)
  }, [router])

  const handleViewDetails = () => {
    if (transferResult) {
      router.push(`/user/transfer/transfer-recipt`)
    }
  }

  const handleShareReceipt = () => {
    if (navigator.share && transferResult) {
      navigator.share({
        title: 'Transaction Receipt',
        text: `Transfer of $${parseFloat(transferResult.transaction.amount).toFixed(2)} completed successfully. Reference: ${transferResult.transaction.reference}`,
      }).catch(() => console.log('Share failed:'))
    } else if (transferResult) {
      // Fallback: copy to clipboard
      const text = `Transfer of $${parseFloat(transferResult.transaction.amount).toFixed(2)} completed. Reference: ${transferResult.transaction.reference}`
      navigator.clipboard.writeText(text)
      alert('Receipt details copied to clipboard!')
    }
  }

  const handleDone = () => {
    sessionStorage.removeItem("transferResult")
    router.push('/dashboard')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  if (!transferResult) {
    return null
  }

  return (
    <div className="container mx-auto max-w-md space-y-6 p-4 lg:p-6">
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={handleDone}>
          <X className="mr-1 h-4 w-4" />
          Done
        </Button>
      </div>

      <div className="flex flex-col items-center justify-center space-y-6 py-8">
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-green-400 opacity-20"></div>
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircle2 className="h-16 w-16 text-green-600 dark:text-green-400" />
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-green-600 dark:text-green-400">
            Transaction Successful!
          </h1>
          <p className="mt-2 text-muted-foreground">
            Your transaction has been processed successfully
          </p>
        </div>

        <Card className="w-full">
          <CardContent className="pt-6">
            <div className="space-y-3 text-center">
              <div>
                <p className="text-sm text-muted-foreground">Amount Transferred</p>
                <p className="text-3xl font-bold">
                  ${parseFloat(transferResult.transaction.amount).toFixed(2)}
                </p>
              </div>
              <div className="border-t pt-3">
                <p className="text-sm text-muted-foreground">To</p>
                <p className="font-medium">{transferResult.transaction.receiver}</p>
                <p className="font-mono text-xs text-muted-foreground">
                  {transferResult.transaction.receiverAccount}
                </p>
              </div>
              <div className="border-t pt-3">
                <p className="text-sm text-muted-foreground">Transaction Reference</p>
                <p className="font-mono text-sm font-medium">
                  {transferResult.transaction.reference}
                </p>
              </div>
              <div className="border-t pt-3">
                <p className="text-sm text-muted-foreground">New Balance</p>
                <p className="text-xl font-bold">
                  ${parseFloat(transferResult.transaction.balanceAfter).toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex w-full flex-col gap-3">
          <Button onClick={handleViewDetails} className="w-full" size="lg">
            <FileText className="mr-2 h-4 w-4" />
            View Full Receipt
          </Button>
          <Button onClick={handleShareReceipt} variant="outline" className="w-full" size="lg">
            <Share2 className="mr-2 h-4 w-4" />
            Share Receipt
          </Button>
          <Button onClick={handleDone} variant="outline" className="w-full" size="lg">
            <Home className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
      </div>

      <div className="rounded-lg bg-green-50 p-4 dark:bg-green-950">
        <p className="text-center text-sm text-green-800 dark:text-green-200">
          Transaction completed at {new Date(transferResult.transaction.date).toLocaleString()}
        </p>
      </div>
    </div>
  )
}