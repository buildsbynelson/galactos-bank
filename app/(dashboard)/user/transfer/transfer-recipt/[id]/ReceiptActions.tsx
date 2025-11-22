"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Download, Share2, ArrowLeft, Home } from "lucide-react"

interface ReceiptActionsProps {
  receiptData: {
    transactionId: string
    status: string
    date: string
    time: string
    type: string
    sender: {
      name: string
      accountNumber: string
    }
    recipient: {
      name: string
      accountNumber: string
    }
    amount: number
    balanceBefore: number
    balanceAfter: number
    isReceiver: boolean
  }
}

export default function ReceiptActions({ receiptData }: ReceiptActionsProps) {
  const router = useRouter()

  const handleDownload = () => {
    // Create receipt text
    const receiptText = `
TRANSACTION RECEIPT
===================
Transaction ID: ${receiptData.transactionId}
Date: ${receiptData.date}
Time: ${receiptData.time}
Type: ${receiptData.type}
Status: ${receiptData.status}

FROM
${receiptData.sender.name}
Account: ${receiptData.sender.accountNumber}

TO
${receiptData.recipient.name}
Account: ${receiptData.recipient.accountNumber}

PAYMENT DETAILS
Amount: $${receiptData.amount.toFixed(2)}
Transaction Fee: $0.00
Previous Balance: $${receiptData.balanceBefore.toFixed(2)}
New Balance: $${receiptData.balanceAfter.toFixed(2)}

Generated: ${new Date().toLocaleString()}
    `.trim()

    // Create and download file
    const blob = new Blob([receiptText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `receipt-${receiptData.transactionId}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleShare = () => {
    const shareText = `Transaction Receipt\nAmount: ${receiptData.isReceiver ? '+' : '-'}$${receiptData.amount.toFixed(2)}\n${receiptData.isReceiver ? 'From' : 'To'}: ${receiptData.isReceiver ? receiptData.sender.name : receiptData.recipient.name}\nReference: ${receiptData.transactionId}`

    if (navigator.share) {
      navigator.share({
        title: 'Transaction Receipt',
        text: shareText,
      }).catch((err) => console.log('Share failed:', err))
    } else {
      navigator.clipboard.writeText(shareText)
      alert('Receipt details copied to clipboard!')
    }
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
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

      <div className="flex justify-center">
        <Button onClick={() => router.push('/user')} variant="outline" size="lg">
          <Home className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
    </>
  )
}