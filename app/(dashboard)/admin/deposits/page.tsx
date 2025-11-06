import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default async function DepositsPage() {
  const session = await getSession()

  // Check if admin
  if (!session || session.user.role !== "ADMIN") {
    redirect("/dashboard")
  }

  // Fetch all deposit transactions
  const deposits = await prisma.transaction.findMany({
    where: {
      type: "DEPOSIT",
    },
    include: {
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
          <CardTitle>User Deposits</CardTitle>
          <CardDescription>
            All deposit transactions. Total deposits: {deposits.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {deposits.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No deposits found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Account Number</TableHead>
                  <TableHead>Reference</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className='text-right'>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {deposits.map((deposit) => (
                  <TableRow key={deposit.id}>
                    <TableCell>
                      <p className='font-medium'>
                        {deposit.receiver?.name || deposit.receiverName || 'Unknown'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">
                        {deposit.receiver?.email || 'N/A'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="font-mono text-sm">
                        {deposit.receiver?.accountNumber || deposit.receiverAccount || 'N/A'}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="font-mono text-xs text-muted-foreground">
                        {deposit.reference}
                      </p>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(deposit.createdAt)}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getStatusColor(deposit.status)}>
                        {deposit.status}
                      </Badge>
                    </TableCell>
                    <TableCell className='text-right'>
                      <p className='font-semibold text-green-600 dark:text-green-400'>
                        +${parseFloat(deposit.amount.toString()).toFixed(2)}
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