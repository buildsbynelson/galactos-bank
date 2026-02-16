"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from 'next-intl'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, Home, X } from "lucide-react"

interface DepositResult {
  transaction: {
    reference: string;
    date: string;
    amount: string;
    method: string;
    status: string;
  };
}

export default function DepositSuccessPage() {
  const t = useTranslations('DepositSuccess')
  const router = useRouter()
  const [depositResult, setDepositResult] = useState<DepositResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const result = sessionStorage.getItem("depositResult")
    
    if (!result) {
      console.log("No deposit result found in sessionStorage")
      router.push("/user/deposit")
      return
    }

    try {
      const parsedResult = JSON.parse(result)
      console.log("Parsed deposit result:", parsedResult)
      
      if (!parsedResult.transaction) {
        console.error("Invalid data structure:", parsedResult)
        setError("Invalid deposit data")
        setLoading(false)
        return
      }
      
      setDepositResult(parsedResult)
      setLoading(false)
    } catch (err) {
      console.error("Failed to parse deposit result:", err)
      setError("Failed to load deposit data")
      setLoading(false)
    }
  }, [router])

  const handleDone = () => {
    sessionStorage.removeItem("depositResult")
    router.push('/user/dashboard')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>{t('loading')}</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <p className="text-red-500">{error}</p>
        <Button onClick={() => router.push('/user/deposit')}>
          {t('backToDeposit')}
        </Button>
      </div>
    )
  }

  if (!depositResult || !depositResult.transaction) {
    return null
  }

  return (
    <div className="container mx-auto max-w-md space-y-6 p-4 lg:p-6">
      <div className="flex justify-end">
        <Button variant="ghost" size="sm" onClick={handleDone}>
          <X className="mr-1 h-4 w-4" />
          {t('done')}
        </Button>
      </div>

      <div className="flex flex-col items-center justify-center space-y-6 py-8">
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-yellow-400 opacity-20"></div>
          <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-yellow-100 dark:bg-yellow-900">
            <Clock className="h-16 w-16 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>

        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-yellow-600 dark:text-yellow-400">
            {t('title')}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {t('description')}
          </p>
        </div>

        <Card className="w-full">
          <CardContent className="pt-6">
            <div className="space-y-3 text-center">
              <div>
                <p className="text-sm text-muted-foreground">{t('depositAmount')}</p>
                <p className="text-3xl font-bold">
                  ${parseFloat(depositResult.transaction.amount).toFixed(2)}
                </p>
              </div>
              <div className="border-t pt-3">
                <p className="text-sm text-muted-foreground">{t('paymentMethod')}</p>
                <p className="font-medium">{depositResult.transaction.method}</p>
              </div>
              <div className="border-t pt-3">
                <p className="text-sm text-muted-foreground">{t('transactionReference')}</p>
                <p className="font-mono text-sm font-medium">
                  {depositResult.transaction.reference}
                </p>
              </div>
              <div className="border-t pt-3">
                <p className="text-sm text-muted-foreground">{t('status')}</p>
                <span className="inline-flex items-center rounded-full bg-yellow-100 px-3 py-1 text-sm font-medium text-yellow-800">
                  {depositResult.transaction.status}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex w-full flex-col gap-3">
          <Button onClick={handleDone} className="w-full" size="lg">
            <Home className="mr-2 h-4 w-4" />
            {t('backToDashboard')}
          </Button>
        </div>
      </div>

      <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-950">
        <p className="text-center text-sm text-yellow-800 dark:text-yellow-200">
          {t('submittedAt')} {new Date(depositResult.transaction.date).toLocaleString()}. {t('notifiedText')}
        </p>
      </div>

      <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-950">
        <p className="text-center text-sm text-blue-800 dark:text-blue-200">
          <strong>{t('note')}</strong> {t('processingTime')}
        </p>
      </div>
    </div>
  )
}