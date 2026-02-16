"use client"

import { useState, useEffect } from "react"
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wallet, ArrowDownToLine, Check } from "lucide-react"

export default function WithdrawPage() {
  const t = useTranslations('WithdrawPage')
  const [isWithdrawing, setIsWithdrawing] = useState(false)
  const [withdrawSuccess, setWithdrawSuccess] = useState(false)
  const [, setError] = useState("")
  const [currentBalance, setCurrentBalance] = useState<number | null>(null)
  const [balanceLoading, setBalanceLoading] = useState(true)
  const [formData, setFormData] = useState({
    amount: "",
    method: "bank",
    accountNumber: "",
    notes: ""
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

  const handleWithdraw = () => {
    setIsWithdrawing(true)
    
    setTimeout(() => {
      setIsWithdrawing(false)
      setWithdrawSuccess(true)
      setTimeout(() => {
        setWithdrawSuccess(false)
        setFormData({
          amount: "",
          method: "bank",
          accountNumber: "",
          notes: ""
        })
      }, 3000)
    }, 2000)
  }

  const handleChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    })
  }

  return (
    <div className="container mx-auto max-w-2xl space-y-6 p-4 lg:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('description')}
        </p>
      </div>

      {withdrawSuccess && (
        <Alert className="border-green-600 bg-green-50 dark:bg-green-950">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-600">
            {t('successMessage')}
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            {t('availableBalance')}
          </CardTitle>
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

      <Card>
        <CardHeader>
          <CardTitle>{t('withdrawalDetails.title')}</CardTitle>
          <CardDescription>
            {t('withdrawalDetails.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="amount">{t('withdrawalDetails.amount')}</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  placeholder={t('withdrawalDetails.amountPlaceholder')}
                  className="pl-7"
                  value={formData.amount}
                  onChange={(e) => handleChange("amount", e.target.value)}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                {t('withdrawalDetails.maximumWithdrawal')} ${currentBalance !== null ? currentBalance.toFixed(2) : '0.00'}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="accountNumber">{t('withdrawalDetails.destinationAccount')}</Label>
              <Input
                id="accountNumber"
                placeholder={t('withdrawalDetails.destinationPlaceholder')}
                value={formData.accountNumber}
                onChange={(e) => handleChange("accountNumber", e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">{t('withdrawalDetails.notes')}</Label>
              <Textarea
                id="notes"
                placeholder={t('withdrawalDetails.notesPlaceholder')}
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
              />
            </div>

            <div className="rounded-lg bg-muted p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('summary.withdrawalFee')}</span>
                <span className="font-medium">$0.00</span>
              </div>
              <div className="mt-2 flex justify-between border-t pt-2">
                <span className="font-semibold">{t('summary.totalAmount')}</span>
                <span className="text-lg font-bold">
                  ${formData.amount ? parseFloat(formData.amount).toFixed(2) : "0.00"}
                </span>
              </div>
            </div>

            <Button
              onClick={handleWithdraw}
              className="w-full"
              disabled={isWithdrawing}
            >
              {isWithdrawing ? (
                t('buttons.processing')
              ) : (
                <>
                  <ArrowDownToLine className="mr-2 h-4 w-4" />
                  {t('buttons.withdraw')}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber-500 bg-amber-50 dark:bg-amber-950">
        <CardContent className="pt-6">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <strong>{t('important.title')}</strong> {t('important.message')}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}