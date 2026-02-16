import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { getTranslations } from 'next-intl/server'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { CheckCircle2, XCircle, Clock } from "lucide-react"
import ReceiptActions from "./ReceiptActions"

export default async function TransactionReceiptPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: {
      sender: {
        select: { name: true, accountNumber: true, email: true }
      },
      receiver: {
        select: { name: true, accountNumber: true, email: true }
      }
    }
  })

  if (!transaction) {
    redirect("/user/transactions")
  }

  if (transaction.senderId !== session.user.id && transaction.receiverId !== session.user.id) {
    redirect("/user/transactions")
  }

  const t = await getTranslations('TransactionReceipt')

  const isReceiver = transaction.receiverId === session.user.id
  const amount = parseFloat(transaction.amount.toString())
  const balanceBefore = parseFloat(transaction.balanceBefore.toString())
  const balanceAfter = parseFloat(transaction.balanceAfter.toString())
  
  const extractBankName = (description: string | null): string => {
    if (!description) return "Not Specified"
    
    const viaMatch = description.match(/via\s+(.+)$/i)
    if (viaMatch && viaMatch[1]) {
      return viaMatch[1].trim()
    }
    
    return "Not Specified"
  }

  const bankName = extractBankName(transaction.description)

  const getStatusIcon = () => {
    switch (transaction.status) {
      case "COMPLETED":
        return <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
      case "FAILED":
        return <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
      default:
        return null
    }
  }

  const getStatusColor = () => {
    switch (transaction.status) {
      case "COMPLETED":
        return "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400"
      case "PENDING":
        return "bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400"
      case "FAILED":
        return "bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400"
      default:
        return "bg-gray-100 dark:bg-gray-900"
    }
  }

  const receiptData = {
    transactionId: transaction.reference,
    status: transaction.status,
    date: transaction.createdAt.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    }),
    time: transaction.createdAt.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    type: transaction.type,
    sender: {
      name: transaction.sender?.name || transaction.senderName || "Unknown",
      accountNumber: transaction.sender?.accountNumber || transaction.senderAccount || "N/A",
      email: transaction.sender?.email
    },
    recipient: {
      name: transaction.receiver?.name || transaction.receiverName || "Unknown",
      accountNumber: transaction.receiver?.accountNumber || transaction.receiverAccount || "N/A",
      email: transaction.receiver?.email,
      bankName: bankName
    },
    amount,
    balanceBefore,
    balanceAfter,
    description: transaction.description,
    isReceiver
  }

  return (
    <div className="container mx-auto max-w-2xl space-y-6 p-4 lg:p-6">
      <ReceiptActions receiptData={receiptData} />

      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('receiptFor')} {receiptData.transactionId}
        </p>
      </div>

      <Card className="border-2">
        <CardHeader className="bg-muted/50">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl">{t('transactionDetails')}</CardTitle>
            <div className={`flex items-center gap-2 rounded-full px-3 py-1 ${getStatusColor()}`}>
              {getStatusIcon()}
              <span className="text-sm font-medium">
                {t(`status.${receiptData.status.toLowerCase()}`)}
              </span>
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
              <p className="font-medium">{receiptData.type}</p>
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

          {receiptData.description && (
            <>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground mb-1">{t('description')}</p>
                <p className="text-sm">{receiptData.description}</p>
              </div>
            </>
          )}

          {receiptData.type === "TRANSFER" && (
            <>
              <Separator />
              
              <div>
                <h3 className="mb-3 text-lg font-semibold">{t('from')}</h3>
                <div className="space-y-2 rounded-lg bg-muted/50 p-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t('accountName')}</span>
                    <span className="font-medium">{receiptData.sender.name}</span>
                  </div>
                  {receiptData.sender.email && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">{t('email')}</span>
                      <span className="text-sm">{receiptData.sender.email}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t('accountNumber')}</span>
                    <span className="font-mono text-sm font-medium">{receiptData.sender.accountNumber}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-3 text-lg font-semibold">{t('to')}</h3>
                <div className="space-y-2 rounded-lg bg-muted/50 p-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t('accountName')}</span>
                    <span className="font-medium">{receiptData.recipient.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t('bank')}</span>
                    <span className="font-medium">{receiptData.recipient.bankName}</span>
                  </div>
                  {receiptData.recipient.email && (
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">{t('email')}</span>
                      <span className="text-sm">{receiptData.recipient.email}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">{t('accountNumber')}</span>
                    <span className="font-mono text-sm font-medium">{receiptData.recipient.accountNumber}</span>
                  </div>
                </div>
              </div>
            </>
          )}

          <Separator />

          <div>
            <h3 className="mb-3 text-lg font-semibold">{t('paymentDetails')}</h3>
            <div className="space-y-2 rounded-lg bg-muted/50 p-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">
                  {receiptData.isReceiver ? t('receivedAmount') : t('transferAmount')}
                </span>
                <span className={`font-medium ${receiptData.isReceiver ? 'text-green-600' : ''}`}>
                  {receiptData.isReceiver ? '+' : '-'}${receiptData.amount.toFixed(2)}
                </span>
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