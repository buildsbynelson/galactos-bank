"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { IconCreditCard, IconBuildingBank } from "@tabler/icons-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function DepositPage() {
  const t = useTranslations('DepositPage')
  const router = useRouter()
  const [isDepositing, setIsDepositing] = useState(false)
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
      } catch {
        setError("Error loading balance")
      } finally {
        setBalanceLoading(false)
      }
    }

    fetchBalance()
  }, [])

  const handleCardDeposit = async () => {
    setError("")
    
    if (!cardData.amount || parseFloat(cardData.amount) <= 0) {
      setError(t('errors.invalidAmount'))
      return
    }

    if (!cardData.cardNumber || !cardData.cardName || !cardData.expiryDate || !cardData.cvv) {
      setError(t('errors.fillCardDetails'))
      return
    }

    setIsDepositing(true)

    try {
      const response = await fetch('/api/transactions/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: cardData.amount,
          method: 'Card',
          paymentDetails: `Card ending in ${cardData.cardNumber.slice(-4)}`
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Deposit failed')
        setIsDepositing(false)
        return
      }

      sessionStorage.setItem("depositResult", JSON.stringify(data))
      router.push('/user/deposit/success')
    } catch {
      setError(t('errors.networkError'))
      setIsDepositing(false)
    }
  }

  const handleBankDeposit = async () => {
    setError("")
    
    if (!bankData.amount || parseFloat(bankData.amount) <= 0) {
      setError(t('errors.invalidAmount'))
      return
    }

    if (!bankData.accountNumber || !bankData.routingNumber) {
      setError(t('errors.fillBankDetails'))
      return
    }

    setIsDepositing(true)

    try {
      const response = await fetch('/api/transactions/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: bankData.amount,
          method: 'Bank Transfer',
          paymentDetails: `Account: ${bankData.accountNumber}`
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Deposit failed')
        setIsDepositing(false)
        return
      }

      sessionStorage.setItem("depositResult", JSON.stringify(data))
      router.push('/user/deposit/success')
    } catch {
      setError(t('errors.networkError'))
      setIsDepositing(false)
    }
  }

  return (
    <div className="container mx-auto max-w-2xl space-y-6 p-4 lg:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('description')}
        </p>
      </div>

      {error && (
        <Alert className="border-red-600 bg-red-50 dark:bg-red-950">
          <AlertDescription className="text-red-600">
            {error}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{t('currentBalance')}</CardTitle>
          <CardDescription className="text-2xl font-bold text-foreground">
            {balanceLoading ? (
              <span className="text-muted-foreground">{t('loading')}</span>
            ) : currentBalance !== null ? (
              `$${currentBalance.toLocaleString('en-US', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}`
            ) : (
              <span className="text-destructive">{t('errorLoadingBalance')}</span>
            )}
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="card" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="card">
            <IconCreditCard className="mr-2 h-4 w-4" />
            {t('tabs.card')}
          </TabsTrigger>
          <TabsTrigger value="bank">
            <IconBuildingBank className="mr-2 h-4 w-4" />
            {t('tabs.bankTransfer')}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="card">
          <Card>
            <CardHeader>
              <CardTitle>{t('cardSection.title')}</CardTitle>
              <CardDescription>
                {t('cardSection.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cardNumber">{t('cardSection.cardNumber')}</Label>
                <Input
                  id="cardNumber"
                  placeholder={t('cardSection.cardNumberPlaceholder')}
                  value={cardData.cardNumber}
                  onChange={(e) => setCardData({ ...cardData, cardNumber: e.target.value.replace(/\D/g, '') })}
                  maxLength={16}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardName">{t('cardSection.cardholderName')}</Label>
                <Input
                  id="cardName"
                  placeholder={t('cardSection.cardholderNamePlaceholder')}
                  value={cardData.cardName}
                  onChange={(e) => setCardData({ ...cardData, cardName: e.target.value })}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">{t('cardSection.expiryDate')}</Label>
                  <Input
                    id="expiryDate"
                    placeholder={t('cardSection.expiryDatePlaceholder')}
                    value={cardData.expiryDate}
                    onChange={(e) => setCardData({ ...cardData, expiryDate: e.target.value })}
                    maxLength={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">{t('cardSection.cvv')}</Label>
                  <Input
                    id="cvv"
                    placeholder={t('cardSection.cvvPlaceholder')}
                    maxLength={3}
                    value={cardData.cvv}
                    onChange={(e) => setCardData({ ...cardData, cvv: e.target.value.replace(/\D/g, '') })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardAmount">{t('cardSection.amount')}</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="cardAmount"
                    type="number"
                    step="0.01"
                    placeholder={t('cardSection.amountPlaceholder')}
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
                {isDepositing ? t('buttons.processing') : t('buttons.submit')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bank">
          <Card>
            <CardHeader>
              <CardTitle>{t('bankSection.title')}</CardTitle>
              <CardDescription>
                {t('bankSection.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bankAccountNumber">{t('bankSection.accountNumber')}</Label>
                <Input
                  id="bankAccountNumber"
                  placeholder={t('bankSection.accountNumberPlaceholder')}
                  value={bankData.accountNumber}
                  onChange={(e) => setBankData({ ...bankData, accountNumber: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="routingNumber">{t('bankSection.routingNumber')}</Label>
                <Input
                  id="routingNumber"
                  placeholder={t('bankSection.routingNumberPlaceholder')}
                  value={bankData.routingNumber}
                  onChange={(e) => setBankData({ ...bankData, routingNumber: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankAmount">{t('bankSection.amount')}</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="bankAmount"
                    type="number"
                    step="0.01"
                    placeholder={t('bankSection.amountPlaceholder')}
                    className="pl-7"
                    value={bankData.amount}
                    onChange={(e) => setBankData({ ...bankData, amount: e.target.value })}
                  />
                </div>
              </div>

              <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  {t('bankSection.processingInfo')}
                </p>
              </div>

              <Button
                onClick={handleBankDeposit}
                className="w-full"
                disabled={isDepositing}
              >
                {isDepositing ? t('buttons.processing') : t('buttons.submit')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="border-yellow-300 bg-yellow-50 dark:bg-yellow-900">
        <CardContent className="pt-6">
          <p className="text-sm text-yellow-800 dark:text-yellow-300">
            <strong>{t('warnings.approvalRequired')}</strong> {t('warnings.approvalText')}
          </p>
        </CardContent>
      </Card>

      <Card className="border-gray-300 bg-gray-50 dark:bg-gray-900">
        <CardContent className="pt-6">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>{t('warnings.secureTransactions')}</strong> {t('warnings.secureText')}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}