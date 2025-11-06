"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert"
import { ChevronLeft, CheckCircle2, XCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/components/ui/input'

interface User {
  id: string
  name: string
  email: string
  phone: string | null
  country: string | null
  accountNumber: string
  balance: number
  emailVerified: boolean
  role: string
  
  createdAt: string
  updatedAt: string
  _count: {
    sentTransactions: number
    receivedTransactions: number
  }
}

export default function EditUserUI({ user }: { user: User }) {
  const router = useRouter()
  const [addAmount, setAddAmount] = useState("")
  const [minusAmount, setMinusAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [alertState, setAlertState] = useState<{
    show: boolean
    type: 'success' | 'error' | 'info'
    title: string
    message: string
  }>({
    show: false,
    type: 'info',
    title: '',
    message: ''
  })
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)

  const balance = user.balance
  const totalTransactions = user._count.sentTransactions + user._count.receivedTransactions
  const createdDate = new Date(user.createdAt)
  const updatedDate = new Date(user.updatedAt)

  const showAlert = (type: 'success' | 'error' | 'info', title: string, message: string) => {
    setAlertState({ show: true, type, title, message })
    setTimeout(() => {
      setAlertState(prev => ({ ...prev, show: false }))
    }, 3000) // Hide after 5 seconds
  }

  const handleBalanceAction = async (action: "add" | "subtract") => {
    const amount = action === "add" ? addAmount : minusAmount

    if (!amount || parseFloat(amount) <= 0) {
      showAlert('error', 'Invalid Amount', 'Please enter a valid amount greater than 0')
      return
    }

    setLoading(true)

    try {
      const response = await fetch(`/api/admin/users/${user.id}/adjust-balance`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          amount,
          description: `Admin ${action === "add" ? "credit" : "debit"} - $${amount}`,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        showAlert(
          'error',
          'Transaction Failed',
          data.error || 'Failed to adjust balance. Please try again.'
        )
        setLoading(false)
        return
      }

      // Success
      showAlert(
        'success',
        'Transaction Successful',
        `$${amount} has been ${action === "add" ? "added to" : "subtracted from"} the user's balance.`
      )
      
      setAddAmount("")
      setMinusAmount("")
      setIsPopoverOpen(false)
      
      // Refresh after showing success message
      setTimeout(() => {
        router.refresh()
      }, 1500)
    } catch  {
      showAlert(
        'error',
        'Network Error',
        'Unable to connect to the server. Please check your connection and try again.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='m-5'>
      <div className='flex items-center gap-4'>
        <Button>
          <Link href="/admin/users">
            <ChevronLeft />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold tracking-tight">Edit User Details</h1>
      </div>

      {/* Alert Banner */}
      {alertState.show && (
        <div className="mt-4 animate-in slide-in-from-top">
          <Alert 
            variant={alertState.type === 'error' ? 'destructive' : 'default'}
            className={
              alertState.type === 'success' 
                ? 'border-green-500 bg-green-50 text-green-900 dark:bg-green-950 dark:text-green-100' 
                : alertState.type === 'error'
                ? 'border-red-500'
                : ''
            }
          >
            {alertState.type === 'success' && <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />}
            {alertState.type === 'error' && <XCircle className="h-4 w-4" />}
            {alertState.type === 'info' && <AlertCircle className="h-4 w-4" />}
            <AlertTitle>{alertState.title}</AlertTitle>
            <AlertDescription>{alertState.message}</AlertDescription>
          </Alert>
        </div>
      )}

      <Card className='mt-5'>
        <CardHeader>
          <CardTitle>User Details</CardTitle>
          <CardDescription>
            User details, credentials and account information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className='flex flex-col gap-5'>
            <div className='flex flex-col gap-2'>
              <Label>Name</Label>
              <p className="font-medium">{user.name}</p>
            </div>

            <div className='flex flex-col gap-2'>
              <Label>Email</Label>
              <p className="font-medium">{user.email}</p>
            </div>

            <div className='flex flex-col gap-2'>
              <Label>Phone Number</Label>
              <p className="font-medium">{user.phone || 'Not provided'}</p>
            </div>

            <div className='flex flex-col gap-2'>
              <Label>Country</Label>
              <p className="font-medium">{user.country || 'Not provided'}</p>
            </div>

            <div className='flex flex-col gap-2'>
              <Label>Account Number</Label>
              <p className="font-mono font-medium">{user.accountNumber}</p>
            </div>

            <div className='flex flex-col gap-2'>
              <Label>User ID</Label>
              <p className="font-mono text-sm">{user.id}</p>
            </div>

            <div className='flex flex-col gap-2'>
              <Label>Total Transactions</Label>
              <p className="font-medium">{totalTransactions}</p>
            </div>

            <div className='flex flex-col gap-2'>
              <Label>Account Created</Label>
              <p className="font-medium">{createdDate.toLocaleDateString()}</p>
            </div>

            <div className='flex flex-col gap-2'>
              <Label>Last Updated</Label>
              <p className="font-medium">{updatedDate.toLocaleDateString()}</p>
            </div>

            <div className='flex items-center space-x-2'>
              <Switch checked={user.emailVerified} disabled />
              <Label>Email Verified ({user.emailVerified ? 'Yes' : 'No'})</Label>
            </div>

            <div>
              <Item variant="outline">
                <ItemContent>
                  <ItemTitle>User Balance</ItemTitle>
                  <ItemDescription>
                    <span className="text-2xl font-bold">${balance.toFixed(2)}</span>
                  </ItemDescription>
                </ItemContent>
                <ItemActions>
                  <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" disabled={loading}>
                        {loading ? 'Processing...' : 'Action'}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-80 mr-10'>
                      <div className='flex flex-col gap-8'>
                        <div className='flex flex-col gap-4'>
                          <Label>Add Balance</Label>
                          <Input 
                            type="number" 
                            placeholder='Amount' 
                            value={addAmount}
                            onChange={(e) => setAddAmount(e.target.value)}
                            step="0.01"
                            min="0.01"
                            disabled={loading}
                          />
                          <Button 
                            onClick={() => handleBalanceAction("add")}
                            disabled={loading || !addAmount}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {loading ? "Processing..." : "Add"}
                          </Button>
                        </div>
                        <div className='flex flex-col gap-4'>
                          <Label>Subtract Balance</Label>
                          <Input 
                            type="number" 
                            placeholder='Amount'
                            value={minusAmount}
                            onChange={(e) => setMinusAmount(e.target.value)}
                            step="0.01"
                            min="0.01"
                            disabled={loading}
                          />
                          <Button 
                            onClick={() => handleBalanceAction("subtract")}
                            disabled={loading || !minusAmount}
                            variant="destructive"
                          >
                            {loading ? "Processing..." : "Subtract"}
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                </ItemActions>
              </Item>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}