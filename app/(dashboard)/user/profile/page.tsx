import { getSession } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { getTranslations } from 'next-intl/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import ProfilePictureUpload from "./components/ProfilePictureUpload"

export default async function ProfilePage() {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      country: true,
      accountNumber: true,
      balance: true,
      emailVerified: true,
      profilePicture: true,
      createdAt: true,
    },
  })

  if (!user) {
    redirect("/login")
  }

  const t = await getTranslations('ProfilePage')

  const nameParts = user.name.split(' ')
  const firstName = nameParts[0] || ''
  const lastName = nameParts.slice(1).join(' ') || ''
  
  const initials = user.name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  const userProfile = {
    firstName,
    lastName,
    email: user.email,
    phone: user.phone || '',
    accountNumber: user.accountNumber,
    balance: parseFloat(user.balance.toString()),
    dateJoined: new Date(user.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }),
    country: user.country || '',
    emailVerified: user.emailVerified,
    profilePicture: user.profilePicture,
    initials,
  }

  return (
    <div className="container mx-auto max-w-4xl space-y-6 p-4 lg:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">
          {t('description')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('profilePicture.title')}</CardTitle>
          <CardDescription>
            {t('profilePicture.description')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProfilePictureUpload 
            currentPicture={userProfile.profilePicture}
            initials={userProfile.initials}
            userName={user.name}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('personalInfo.title')}</CardTitle>
          <CardDescription>
            {t('personalInfo.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">{t('personalInfo.firstName')}</Label>
              <Input 
                id="firstName" 
                value={userProfile.firstName} 
                readOnly 
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">{t('personalInfo.lastName')}</Label>
              <Input 
                id="lastName" 
                value={userProfile.lastName} 
                readOnly 
                className="bg-muted"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">{t('personalInfo.email')}</Label>
            <div className="flex gap-2">
              <Input 
                id="email" 
                type="email" 
                value={userProfile.email} 
                readOnly 
                className="bg-muted flex-1"
              />
              {userProfile.emailVerified ? (
                <span className="inline-flex items-center px-3 text-sm text-green-600 bg-green-50 rounded-md">
                  {t('personalInfo.verified')}
                </span>
              ) : (
                <span className="inline-flex items-center px-3 text-sm text-yellow-600 bg-yellow-50 rounded-md">
                  {t('personalInfo.notVerified')}
                </span>
              )}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">{t('personalInfo.phone')}</Label>
            <Input 
              id="phone" 
              type="tel" 
              value={userProfile.phone || t('personalInfo.notProvided')} 
              readOnly 
              className="bg-muted"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="country">{t('personalInfo.country')}</Label>
            <Input 
              id="country" 
              value={userProfile.country || t('personalInfo.notProvided')} 
              readOnly 
              className="bg-muted"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('accountInfo.title')}</CardTitle>
          <CardDescription>
            {t('accountInfo.description')}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t('accountInfo.accountNumber')}</Label>
            <Input 
              readOnly 
              value={userProfile.accountNumber} 
              className="bg-muted font-mono" 
            />
          </div>
          
          <div className="space-y-2">
            <Label>{t('accountInfo.currentBalance')}</Label>
            <Input 
              readOnly 
              value={`$${userProfile.balance.toLocaleString('en-US', { 
                minimumFractionDigits: 2, 
                maximumFractionDigits: 2 
              })}`}
              className="bg-muted font-semibold text-lg" 
            />
          </div>

          <div className="space-y-2">
            <Label>{t('accountInfo.accountType')}</Label>
            <Input 
              readOnly 
              value={t('accountInfo.accountTypeValue')} 
              className="bg-muted" 
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            {t('updateInfo')}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}