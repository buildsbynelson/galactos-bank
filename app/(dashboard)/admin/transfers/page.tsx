import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default async function TransfersPage() {
  const session = await getSession()

  // Check if admin
  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  // Fetch all transfer transactions
  const transfers = await prisma.transaction.findMany({
    where: {
      type: "TRANSFER",
    },
    include: {
      sender: {
        select: {
          name: true,
          email: true,
          accountNumber: true,
        },
      },
      receiver: {
        select: {
          name: true,
          email: true,
          accountNumber: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
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

  return (
    <div className='m-5'>
      <Card>
        <CardHeader className="px-7">
          <CardTitle>User Transfers</CardTitle>
          <CardDescription>
            All transfer transactions. Total transfers: {transfers.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transfers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No transfers found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>From</TableHead>
                  <TableHead>To</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className='text-right'>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transfers.map((transfer) => (
                  <TableRow key={transfer.id}>
                    <TableCell>
                      <div>
                        <p className='font-medium text-sm'>
                          {transfer.sender?.name || transfer.senderName || 'Unknown'}
                        </p>
                        <p className="font-mono text-xs text-muted-foreground">
                          {transfer.sender?.accountNumber || transfer.senderAccount}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className='font-medium text-sm'>
                          {transfer.receiver?.name || transfer.receiverName || 'Unknown'}
                        </p>
                        <p className="font-mono text-xs text-muted-foreground">
                          {transfer.receiver?.accountNumber || transfer.receiverAccount}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-mono text-xs text-muted-foreground">
                        {transfer.reference}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(transfer.createdAt)}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">
                        {transfer.description || 'N/A'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(transfer.status)}>
                        {transfer.status}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-right'>
                      <p className='font-semibold text-red-600 dark:text-red-400'>
                        ${parseFloat(transfer.amount.toString()).toFixed(2)}
                      </p>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}