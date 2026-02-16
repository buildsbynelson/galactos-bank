"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ShieldAlert, ArrowLeft, AlertCircle } from "lucide-react"

export default function IMFVerificationPage() {
  const t = useTranslations('IMFVerification')
  const router = useRouter()
  const [imfCode, setImfCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleVerifyCode = async () => {
    if (!imfCode || imfCode.length !== 4) {
      setError(t('errors.enterCode'))
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch('/api/user/verify-imf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imfCode })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || t('errors.invalidCode'))
        setLoading(false)
        return
      }

      const transferDataStr = sessionStorage.getItem('transferData')
      
      if (!transferDataStr) {
        setError(t('errors.transferDataNotFound'))
        setLoading(false)
        return
      }

      const transferData = JSON.parse(transferDataStr)
      
      const transferResponse = await fetch('/api/transactions/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          receiverAccountNumber: transferData.receiverAccountNumber,
          amount: transferData.amount,
          description: transferData.description,
          recipientName: transferData.recipientName,
          bankName: transferData.bankName,
          pin: transferData.pin,
          imfVerified: true
        })
      })

      const transferResult = await transferResponse.json()

      if (!transferResponse.ok) {
        setError(transferResult.error || t('errors.transferFailed'))
        setLoading(false)
        return
      }

      sessionStorage.setItem('transferResult', JSON.stringify(transferResult))
      sessionStorage.setItem('imfVerified', 'true')
      
      router.push('/user/transfer/transfer-sucess')
      
    } catch (err) {
      console.error('Error:', err)
      setError(t('errors.networkError'))
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4)
    setImfCode(value)
    setError("")
  }

  return (
    <div className="container mx-auto max-w-md space-y-6 p-4 lg:p-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
          <ShieldAlert className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
        <p className="mt-2 text-muted-foreground">
          {t('description')}
        </p>
      </div>

      <Card className="border-yellow-300 bg-yellow-50 dark:bg-yellow-950">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                {t('accountRestricted.title')}
              </p>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                {t('accountRestricted.message')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('enterCode.title')}</CardTitle>
          <CardDescription>
            {t('enterCode.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="imfCode">{t('enterCode.label')}</Label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-mono text-lg">
                IMF-
              </div>
              <Input
                id="imfCode"
                type="text"
                placeholder={t('enterCode.placeholder')}
                maxLength={4}
                value={imfCode}
                onChange={handleInputChange}
                className="pl-16 text-center text-2xl tracking-widest font-mono"
                autoFocus
              />
            </div>
            <p className="text-xs text-muted-foreground">
              {t('enterCode.hint')}
            </p>
          </div>

          <Button
            onClick={handleVerifyCode}
            disabled={loading || imfCode.length !== 4}
            className="w-full"
            size="lg"
          >
            {loading ? t('buttons.verifying') : t('buttons.verify')}
          </Button>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button
          variant="ghost"
          onClick={() => router.push('/user/transfer')}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('buttons.cancel')}
        </Button>
      </div>

      <Card className="border-blue-300 bg-blue-50 dark:bg-blue-950">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
                {t('howToGet.title')}
              </p>
              <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1 list-disc list-inside">
                <li>{t('howToGet.step1')}</li>
                <li>{t('howToGet.step2')}</li>
                <li>{t('howToGet.step3')}</li>
                <li>{t('howToGet.step4')}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-gray-300 bg-gray-50 dark:bg-gray-900">
        <CardContent className="pt-6">
          <p className="text-xs text-gray-700 dark:text-gray-300">
            <strong>{t('securityNotice.title')}</strong> {t('securityNotice.message')}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}