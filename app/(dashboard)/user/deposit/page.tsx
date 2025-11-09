"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { IconCreditCard, IconBuildingBank, IconCheck } from "@tabler/icons-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DepositPage() {
  const [isDepositing, setIsDepositing] = useState(false)
  const [depositSuccess, setDepositSuccess] = useState(false)
  const [error, setError] = useState("")
  const [currentBalance, setCurrentBalance] = useState<number | null>(null)
  const [balanceLoading, setBalanceLoading] = useState(true)
  const [cardData, setCardData] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    amount: ""
  })
  const [bankData, setBankData] = useState({
    accountNumber: "",
    routingNumber: "",
    amount: ""
  })

   // Fetch user balance on component mount
   useEffect(() => {
     const fetchBalance = async () => {
       try {
         const response = await fetch('/api/user/balance')
         const data = await response.json()
         
         if (response.ok) {
           setCurrentBalance(data.balance)
         } else {
           setError("Failed to load balance")
         }
       } catch (err) {
         setError("Error loading balance")
       } finally {
         setBalanceLoading(false)
       }
     }
 
     fetchBalance()
   }, [])

  const handleCardDeposit = () => {
    setIsDepositing(true)
    setTimeout(() => {
      setIsDepositing(false)
      setDepositSuccess(true)
      setTimeout(() => {
        setDepositSuccess(false)
        setCardData({
          cardNumber: "",
          cardName: "",
          expiryDate: "",
          cvv: "",
          amount: ""
        })
      }, 3000)
    }, 2000)
  }

  const handleBankDeposit = () => {
    setIsDepositing(true)
    setTimeout(() => {
      setIsDepositing(false)
      setDepositSuccess(true)
      setTimeout(() => {
        setDepositSuccess(false)
        setBankData({
          accountNumber: "",
          routingNumber: "",
          amount: ""
        })
      }, 3000)
    }, 2000)
  }

  return (
    <div className="container mx-auto max-w-2xl space-y-6 p-4 lg:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Deposit Funds</h1>
        <p className="text-muted-foreground">
          Add money to your account
        </p>
      </div>

      {depositSuccess && (
        <Alert className="border-green-600 bg-green-50 dark:bg-green-950">
          <IconCheck className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-600">
            Deposit processed successfully! Funds will be available shortly.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Current Balance</CardTitle>
          <CardDescription className="text-2xl font-bold text-foreground">
            {balanceLoading ? (
              <span className="text-muted-foreground">Loading...</span>
            ) : currentBalance !== null ? (
              `$${currentBalance.toLocaleString('en-US', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}`
            ) : (
              <span className="text-destructive">Error loading balance</span>
            )}
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="card" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="card">
            <IconCreditCard className="mr-2 h-4 w-4" />
            Card
          </TabsTrigger>
          <TabsTrigger value="bank">
            <IconBuildingBank className="mr-2 h-4 w-4" />
            Bank Transfer
          </TabsTrigger>
        </TabsList>

        <TabsContent value="card">
          <Card>
            <CardHeader>
              <CardTitle>Debit/Credit Card</CardTitle>
              <CardDescription>
                Enter your card details to deposit funds
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={cardData.cardNumber}
                  onChange={(e) => setCardData({ ...cardData, cardNumber: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardName">Cardholder Name</Label>
                <Input
                  id="cardName"
                  placeholder="John Doe"
                  value={cardData.cardName}
                  onChange={(e) => setCardData({ ...cardData, cardName: e.target.value })}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    placeholder="MM/YY"
                    value={cardData.expiryDate}
                    onChange={(e) => setCardData({ ...cardData, expiryDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    maxLength={3}
                    value={cardData.cvv}
                    onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardAmount">Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="cardAmount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-7"
                    value={cardData.amount}
                    onChange={(e) => setCardData({ ...cardData, amount: e.target.value })}
                  />
                </div>
              </div>

              <Button
                onClick={handleCardDeposit}
                className="w-full"
                disabled={isDepositing}
              >
                {isDepositing ? "Processing..." : "Deposit Funds"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bank">
          <Card>
            <CardHeader>
              <CardTitle>Bank Transfer</CardTitle>
              <CardDescription>
                Link your bank account for deposits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bankAccountNumber">Account Number</Label>
                <Input
                  id="bankAccountNumber"
                  placeholder="Enter your account number"
                  value={bankData.accountNumber}
                  onChange={(e) => setBankData({ ...bankData, accountNumber: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="routingNumber">Routing Number</Label>
                <Input
                  id="routingNumber"
                  placeholder="Enter routing number"
                  value={bankData.routingNumber}
                  onChange={(e) => setBankData({ ...bankData, routingNumber: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankAmount">Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="bankAmount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="pl-7"
                    value={bankData.amount}
                    onChange={(e) => setBankData({ ...bankData, amount: e.target.value })}
                  />
                </div>
              </div>

              <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  Bank transfers may take 1-3 business days to process
                </p>
              </div>

              <Button
                onClick={handleBankDeposit}
                className="w-full"
                disabled={isDepositing}
              >
                {isDepositing ? "Processing..." : "Initiate Transfer"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="border-gray-300 bg-gray-50 dark:bg-gray-900">
        <CardContent className="pt-6">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>Secure Transactions:</strong> All deposits are encrypted and processed securely. 
            Your financial information is protected with bank-level security.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}