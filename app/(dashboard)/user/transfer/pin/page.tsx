"use client"

import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Lock, Eye, EyeOff, ArrowLeft } from "lucide-react"

interface TransferData {
  receiverAccountNumber: string;
  accountNumber: string;
  amount: string;
  description?: string;
}

export default function PinConfirmationPage() {
  const router = useRouter()
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [showPin, setShowPin] = useState(false)
  const [loading, setLoading] = useState(false)
  const [transferData, setTransferData] = useState<TransferData | null>(null)

  useEffect(() => {
    // Get transfer data from sessionStorage
    const data = sessionStorage.getItem("transferData")
    if (!data) {
      router.push("/dashboard/transfer")
      return
    }
    setTransferData(JSON.parse(data))
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (!transferData) {
    setError("Transfer data not found")
    setLoading(false)
    return
  }

    if (!pin || pin.length < 4) {
      setError("Please enter your 4 digit PIN")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/transactions/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverAccountNumber: transferData.receiverAccountNumber,
          amount: transferData.amount,
          description: transferData.description,
          pin,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Transfer failed")
        setLoading(false)
        return
      }

      // Store transaction result and redirect to success page
      sessionStorage.setItem("transferResult", JSON.stringify(data))
      sessionStorage.removeItem("transferData") // Clean up
      router.push("/user/transfer/transfer-sucess")
    } catch {
      setError("Network error. Please try again.")
      setLoading(false)
    }
  }

  if (!transferData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading...</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-md space-y-6 p-4 lg:p-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Lock className="h-8 w-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">Confirm Transaction</h1>
        <p className="text-muted-foreground">
          Enter your PIN to authorize this transaction
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Type</span>
            <span className="font-medium">Transfer</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Account Number</span>
            <span className="font-medium font-mono">{transferData.accountNumber}</span>
          </div>
          {transferData.description && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Description</span>
              <span className="font-medium">{transferData.description}</span>
            </div>
          )}
          <div className="flex justify-between border-t pt-3">
            <span className="font-semibold">Amount</span>
            <span className="text-xl font-bold text-primary">
              ${parseFloat(transferData.amount).toFixed(2)}
            </span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md border border-red-200">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="pin">Transaction PIN</Label>
              <div className="relative">
                <Input
                  id="pin"
                  type={showPin ? "text" : "password"}
                  placeholder="Enter 4-6 digit PIN"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                  className="pr-10"
                  autoFocus
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full"
                  onClick={() => setShowPin(!showPin)}
                >
                  {showPin ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={pin.length < 4 || loading}
              >
                {loading ? "Confirming..." : "Confirm Transaction"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
        <p className="text-center text-sm text-blue-800 dark:text-blue-200">
          Your PIN is encrypted and secure. Never share your PIN with anyone.
        </p>
      </div>
    </div>
  )
}