"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation";
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export default function TransferPage() {
  const t = useTranslations('TransferPage')
  const router = useRouter();
  const [error, setError] = useState("")
  const [loading] = useState(false)
  const [currentBalance, setCurrentBalance] = useState<number | null>(null)
  const [balanceLoading, setBalanceLoading] = useState(true)
  const [formData, setFormData] = useState({
    recipientName: "",
    bankName: "",
    receiverAccountNumber: "",
    amount: "",
    description: ""
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!formData.recipientName || !formData.receiverAccountNumber || !formData.amount) {
      setError(t('errors.fillRequired'))
      return
    }

    const amount = parseFloat(formData.amount)
    if (isNaN(amount) || amount <= 0) {
      setError(t('errors.invalidAmount'))
      return
    }

    if (currentBalance !== null && amount > currentBalance) {
      setError(t('errors.insufficientBalance'))
      return
    }

    if (formData.receiverAccountNumber.length < 8) {
      setError(t('errors.invalidAccountNumber'))
      return
    }
    
    sessionStorage.setItem("transferData", JSON.stringify(formData))
    router.push("/user/transfer/pin")
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    
    if (name === "receiverAccountNumber") {
      const digitsOnly = value.replace(/\D/g, '')
      setFormData({
        ...formData,
        [name]: digitsOnly
      })
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
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

      <Card>
        <CardHeader>
          <CardTitle>{t('availableBalance')}</CardTitle>
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
          <CardTitle>{t('transferDetails.title')}</CardTitle>
          <CardDescription>
            {t('transferDetails.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="recipientName">{t('transferDetails.recipientName')}</Label>
              <Input
                id="recipientName"
                name="recipientName"
                placeholder={t('transferDetails.recipientNamePlaceholder')}
                value={formData.recipientName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bankName">{t('transferDetails.bankName')}</Label>
              <Input
                id="bankName"
                name="bankName"
                placeholder={t('transferDetails.bankNamePlaceholder')}
                value={formData.bankName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="receiverAccountNumber">{t('transferDetails.accountNumber')}</Label>
              <Input
                id="receiverAccountNumber"
                name="receiverAccountNumber"
                placeholder={t('transferDetails.accountNumberPlaceholder')}
                value={formData.receiverAccountNumber}
                onChange={handleChange}
                minLength={8}
                maxLength={16}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">{t('transferDetails.amount')}</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"                    
                  placeholder={t('transferDetails.amountPlaceholder')}
                  className="pl-7"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t('transferDetails.description')}</Label>
              <Textarea
                id="description"
                name="description"
                placeholder={t('transferDetails.descriptionPlaceholder')}
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="rounded-lg bg-muted p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t('summary.transferFee')}</span>
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
              type="submit"
              className="w-full"
              disabled={loading || balanceLoading || currentBalance === null}
            >
              {loading ? t('buttons.processing') : t('buttons.transfer')}
            </Button>
            
          </form>
        </CardContent>
      </Card>

      <Card className="border-amber-500 bg-amber-50 dark:bg-amber-950">
        <CardContent className="pt-6">
          <p className="text-sm text-amber-800 dark:text-amber-200">
            <strong>{t('securityNotice.title')}</strong> {t('securityNotice.message')}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}