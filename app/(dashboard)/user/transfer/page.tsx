"use client"

import { useState } from "react"
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"


export default function TransferPage() {
  const router = useRouter();
  const [, setError] = useState("")
  const [loading] = useState(false)
  const [formData, setFormData] = useState({
    recipientName: "",
    accountNumber: "",
    amount: "",
    description: ""
  })

  const currentBalance = 13250.00

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.accountNumber || !formData.amount) {
      setError("Please fill in all required fields.")
      return
    }

    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      setError("Please enter a valid amount.")
      return
    }

    if (amount > currentBalance) {
      setError("Insufficient balance for this transfer.")
      return
    }

    if (formData.accountNumber.length !== 8) {
      setError("Account number must be 8 digits.")
    }
    // proceed with transfer... and store transfer data in sessionStorage and redirect to pin
    sessionStorage.setItem("transferData", JSON.stringify(formData))
    router.push("/user/transfer/pin")

  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    })
  }

  return (
    <div className="container mx-auto max-w-2xl space-y-6 p-4 lg:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transfer Money</h1>
        <p className="text-muted-foreground">
          Send money to another account securely
        </p>
      </div>

      

      <Card>
        <CardHeader>
          <CardTitle>Available Balance</CardTitle>
          <CardDescription className="text-2xl font-bold text-foreground">
            ${currentBalance.toFixed(2)}
          </CardDescription>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transfer Details</CardTitle>
          <CardDescription>
            Enter the recipient&apos;s information and transfer amount
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipientName">Recipient Name</Label>
              <Input
                id="recipientName"
                placeholder="Enter recipient's full name"
                value={formData.recipientName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                placeholder="Enter recipient's account number"
                value={formData.accountNumber}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"                    
                  placeholder="0.00"
                  className="pl-7"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="What's this transfer for?"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="rounded-lg bg-muted p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Transfer Fee</span>
                <span className="font-medium">$0.00</span>
              </div>
              <div className="mt-2 flex justify-between border-t pt-2">
                <span className="font-semibold">Total Amount</span>
                <span className="text-lg font-bold">
                  ${formData.amount ? parseFloat(formData.amount).toFixed(2) : "0.00"}
                </span>
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Processing..." : "Transfer Funds"}
            </Button>
            
          </form>
        </CardContent>
      </Card>

      <Card className="border-amber-500 bg-amber-50 dark:bg-amber-950">
        <CardContent className="pt-6">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <strong>Security Notice:</strong> Always verify recipient details before transferring. 
            Transfers cannot be reversed once completed.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}