"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useTranslations } from 'next-intl'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Download, Share2, Clock, ArrowLeft, Home } from "lucide-react"

interface TransferResult {
  transaction: {
    reference: string;
    date: string;
    senderAccount?: string;
    receiver: string;
    receiverAccount: string;
    amount: string;
    balanceBefore: string;
    balanceAfter: string;
    bankName?: string;
  };
}

export default function TransactionReceiptPage() {
  const t = useTranslations('TransferSuccess')
  const router = useRouter()
  const [transferResult, setTransferResult] = useState<TransferResult | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const result = sessionStorage.getItem("transferResult")
    if (!result) {
      router.push("/user/transfer")
      return
    }
    const parsedResult = JSON.parse(result)
    setTransferResult(parsedResult)
    setLoading(false)
  }, [router])

  const handleDownload = () => {
    if (!transferResult) return
    
    const receiptText = `
TRANSACTION RECEIPT
===================
Transaction ID: ${transferResult.transaction.reference}
Date: ${new Date(transferResult.transaction.date).toLocaleString()}
Type: Transfer
Status: PENDING

SENDER INFORMATION
Account: ${transferResult.transaction.senderAccount || 'Your Account'}

RECIPIENT INFORMATION  
Name: ${transferResult.transaction.receiver}
Bank: ${transferResult.transaction.bankName || 'Not Specified'}
Account: ${transferResult.transaction.receiverAccount}

PAYMENT DETAILS
Amount: $${parseFloat(transferResult.transaction.amount).toFixed(2)}
Previous Balance: $${parseFloat(transferResult.transaction.balanceBefore).toFixed(2)}
New Balance: $${parseFloat(transferResult.transaction.balanceAfter).toFixed(2)}

Status: PENDING APPROVAL
    `.trim()

    const blob = new Blob([receiptText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `receipt-${transferResult.transaction.reference}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleShare = () => {
    if (!transferResult) return

    if (navigator.share) {
      navigator.share({
        title: 'Transaction Receipt',
        text: `Transfer of $${parseFloat(transferResult.transaction.amount).toFixed(2)} to ${transferResult.transaction.receiver} at ${transferResult.transaction.bankName || 'Bank'}. Reference: ${transferResult.transaction.reference}. Status: PENDING`,
      }).catch((err) => console.log('Share failed:', err))
    } else {
      const text = `Transfer Receipt\nAmount: $${parseFloat(transferResult.transaction.amount).toFixed(2)}\nTo: ${transferResult.transaction.receiver}\nBank: ${transferResult.transaction.bankName || 'Not Specified'}\nReference: ${transferResult.transaction.reference}\nStatus: PENDING`
      navigator.clipboard.writeText(text)
      alert('Receipt details copied to clipboard!')
    }
  }

  const handleBackToDashboard = () => {
    sessionStorage.removeItem("transferResult")
    sessionStorage.removeItem("transferData")
    router.push("/user")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>{t('loading')}</p>
      </div>
    )
  }

  if (!transferResult) {
    return null
  }

  const receiptData = {
    transactionId: transferResult.transaction.reference,
    date: new Date(transferResult.transaction.date).toLocaleDateString(),
    time: new Date(transferResult.transaction.date).toLocaleTimeString(),
    recipient: {
      name: transferResult.transaction.receiver,
      bankName: transferResult.transaction.bankName || "Not Specified",
      accountNumber: transferResult.transaction.receiverAccount,
    },
    amount: parseFloat(transferResult.transaction.amount),
    balanceBefore: parseFloat(transferResult.transaction.balanceBefore),
    balanceAfter: parseFloat(transferResult.transaction.balanceAfter),
  }

  return (
    <div className="container mx-auto max-w-2xl space-y-6 p-4 lg:p-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t('buttons.back')}
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={handleDownload}>
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">{t('titlePending')}</h1>
        <p className="text-muted-foreground">{t('descriptionPending')}</p>
      </div>

      <Card className="border-2">
        <CardHeader className="bg-muted/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">{t('transactionDetails')}</CardTitle>
            <div className="flex items-center gap-2 rounded-full px-3 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">{t('status.pending')}</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{t('transactionId')}</p>
              <p className="font-mono text-sm font-medium">{receiptData.transactionId}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{t('transactionType')}</p>
              <p className="font-medium">{t('transfer')}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{t('date')}</p>
              <p className="font-medium">{receiptData.date}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">{t('time')}</p>
              <p className="font-medium">{receiptData.time}</p>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="mb-3 text-lg font-semibold">{t('recipientInfo')}</h3>
            <div className="space-y-2 rounded-lg bg-muted/50 p-4">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t('accountName')}</span>
                <span className="font-medium">{receiptData.recipient.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t('bank')}</span>
                <span className="font-medium">{receiptData.recipient.bankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">{t('accountNumber')}</span>
                <span className="font-mono text-sm font-medium">{receiptData.recipient.accountNumber}</span>
              </div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="mb-3 text-lg font-semibold">{t('paymentDetails')}</h3>
            <div className="space-y-2 rounded-lg bg-muted/50 p-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('transferAmount')}</span>
                <span className="font-medium">${receiptData.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('transactionFee')}</span>
                <span className="font-medium">$0.00</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('balanceBefore')}</span>
                <span className="font-medium">${receiptData.balanceBefore.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg">
                <span className="font-semibold">{t('balanceAfter')}</span>
                <span className="font-bold text-primary">${receiptData.balanceAfter.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <Button onClick={handleBackToDashboard} className="w-full" size="lg">
            <Home className="mr-2 h-4 w-4" />
            {t('buttons.backToDashboard')}
          </Button>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <CardContent className="pt-6">
          <p className="text-center text-sm text-blue-800 dark:text-blue-200">
            {t('officialReceipt')}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}