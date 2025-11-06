import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import TransactionsList from "@/components/transactionslist"

export default async function TransactionsPage() {
  const session = await getSession()
  
  if (!session) {
    redirect("/login")
  }

  // Fetch user's transactions from database
  const transactions = await prisma.transaction.findMany({
    where: {
      OR: [
        { senderId: session.user.id },
        { receiverId: session.user.id },
      ],
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 100, // Limit to last 100 transactions
  })

  // Transform data for display
  const formattedTransactions = transactions.map((txn) => {
    const isReceiver = txn.receiverId === session.user.id
    const isSender = txn.senderId === session.user.id

    return {
      id: txn.id,
      reference: txn.reference,
      type: txn.type.toLowerCase() as "deposit" | "transfer" | "withdrawal",
      recipient: isReceiver ? undefined : txn.receiverName || undefined,
      sender: isSender ? undefined : txn.senderName || undefined,
      amount: isReceiver 
        ? parseFloat(txn.amount.toString()) 
        : -parseFloat(txn.amount.toString()),
      date: txn.createdAt.toISOString(),
      status: txn.status.toLowerCase() as "completed" | "pending" | "failed",
      description: txn.description || "",
      isReceiver,
      isSender,
    }
  })

  return <TransactionsList transactions={formattedTransactions} />
}