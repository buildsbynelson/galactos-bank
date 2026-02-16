import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { getSession } from "@/lib/session"
import { redirect } from "next/navigation"
import { ReactNode } from "react"
import { prisma } from "@/lib/prisma"
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getLocale } from 'next-intl/server'
import LanguageSwitcher from "@/components/LanguageSwitcher"

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  const session = await getSession()
  
  if (!session) {
    redirect("/login")
  }

  // Fetch fresh user data including profile picture
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      name: true,
      email: true,
      role: true,
      profilePicture: true,
    },
  })

  if (!user) {
    redirect("/login")
  }

  // Get locale and messages for translations
  const locale = await getLocale()
  const messages = await getMessages()

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar
          variant="inset"
          user={{
            name: user.name,
            email: user.email,
            role: user.role,
          }}
        />
        <SidebarInset>
          <SiteHeader 
            userName={user.name} 
            userRole={user.role}
            profilePicture={user.profilePicture}
          />
          <div className="flex flex-1 flex-col">{children}</div>
          
          {/* Language Switcher - Bottom Right, Always Visible */}
          <div className="fixed bottom-6 right-6 z-50">
            <LanguageSwitcher />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </NextIntlClientProvider>
  )
}