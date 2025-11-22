"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { IconArrowDown, IconArrowUp, IconSearch, IconFilter, IconEye } from "@tabler/icons-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from "next/link"

interface Transaction {
  id: string
  reference: string
  type: "deposit" | "transfer" | "withdrawal"
  recipient?: string
  sender?: string
  amount: number
  date: string
  status: "completed" | "pending" | "failed"
  description: string
  isReceiver: boolean
  isSender: boolean
}

interface TransactionsListProps {
  transactions: Transaction[]
}

export default function TransactionsList({ transactions }: TransactionsListProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState("all")

  const filteredTransactions = transactions.filter(txn => {
    const matchesSearch = 
      txn.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.recipient?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.sender?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      txn.reference.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesFilter = filterType === "all" || txn.type === filterType
    return matchesSearch && matchesFilter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "failed":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const getTransactionLabel = (txn: Transaction) => {
    if (txn.type === "deposit") return "Deposit"
    if (txn.type === "withdrawal") return "Withdrawal"
    if (txn.type === "transfer") {
      return txn.isReceiver ? "Received" : "Transfer"
    }
    return txn.type
  }

  return (
    <div className="container mx-auto max-w-5xl space-y-6 p-4 lg:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
        <p className="text-muted-foreground">
          View and manage your transaction history
        </p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative flex-1 md:max-w-sm">
          <IconSearch className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <IconFilter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="deposit">Deposits</SelectItem>
              <SelectItem value="transfer">Transfers</SelectItem>
              <SelectItem value="withdrawal">Withdrawals</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">No transactions found</p>
              <Button asChild className="mt-4">
                <Link href="/user/transfer">Make a Transfer</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-4">
                    <div className={`rounded-full p-2 ${
                      transaction.amount > 0 
                        ? 'bg-green-100 dark:bg-green-900' 
                        : 'bg-red-100 dark:bg-red-900'
                    }`}>
                      {transaction.amount > 0 ? (
                        <IconArrowDown className="h-5 w-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <IconArrowUp className="h-5 w-5 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{getTransactionLabel(transaction)}</p>
                        <Badge variant="outline" className={getStatusColor(transaction.status)}>
                          {transaction.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {transaction.recipient && `To ${transaction.recipient}`}
                        {transaction.sender && `From ${transaction.sender}`}
                        {transaction.description && (
                          <>
                            {(transaction.recipient || transaction.sender) && " • "}
                            {transaction.description}
                          </>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(transaction.date)} • {transaction.reference}
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-3">
                    <div>
                      <p className={`text-lg font-semibold ${
                        transaction.amount > 0 
                          ? 'text-green-600 dark:text-green-400' 
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      asChild
                    >
                      <Link href={`/user/transfer/transfer-recipt/${transaction.id}`}>
                        <IconEye className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}