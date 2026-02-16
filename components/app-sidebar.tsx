"use client"

import * as React from "react"
import { useTranslations } from 'next-intl'
import {
  IconChartBar,
  IconDashboard,
  IconDatabase,
  IconFileWord,
  IconInnerShadowTop,
  IconReport,
  IconHelpCircle,
  IconUsers,
  IconCoins,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: {
    name: string
    email: string
    avatar?: string
    role: "ADMIN" | "USER"
  }
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const t = useTranslations('Sidebar')
  
  // Admin navigation
  const adminData = {
    navMain: [
      {
        title: t('admin.dashboard'),
        url: "/admin",
        icon: IconDashboard,
      },
      {
        title: t('admin.analytics'),
        url: "/admin/analytics",
        icon: IconChartBar,
      },
      {
        title: t('admin.users'),
        url: "/admin/users",
        icon: IconUsers,
      },
    ],
    documents: [
      {
        name: t('admin.withdrawals'),
        url: "/admin/withdrawals",
        icon: IconDatabase,
      },
      {
        name: t('admin.deposits'),
        url: "/admin/deposits",
        icon: IconReport,
      },
      {
        name: t('admin.pendingTxns'),
        url: "/admin/transactions/pending",
        icon: IconReport,
      },
      {
        name: t('admin.transfers'),
        url: "/admin/transfers",
        icon: IconFileWord,
      },
      {
        name: t('admin.pendingLoans'),
        url: "/admin/pending-loans",
        icon: IconCoins,
      },
    ],
  }

  // User navigation
  const userData = {
    navMain: [
      {
        title: t('user.dashboard'),
        url: "/user",
        icon: IconDashboard,
      },
      {
        title: t('user.myAccount'),
        url: "/user/profile",
        icon: IconUsers,
      },
      {
        title: t('user.transactions'),
        url: "/user/transactions",
        icon: IconChartBar,
      },
    ],
    documents: [
      {
        name: t('user.myDeposits'),
        url: "/user/transactions",
        icon: IconReport,
      },
      {
        name: t('user.myWithdrawals'),
        url: "/user/transactions",
        icon: IconDatabase,
      },
      {
        name: t('user.loans'),
        url: "/user/loans",
        icon: IconCoins,
      },
    ],
  }

  const navSecondary = [
    {
      title: t('support'),
      url: "mailto:help.galactostrustbacorp@gmail.com?subject=Support Request - GalactosTrust Bank",
      icon: IconHelpCircle,
    },
  ]

  // Choose navigation based on user role
  const data = user.role === "ADMIN" ? adminData : userData

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href={user.role === "ADMIN" ? "/admin" : "/dashboard"}>
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">
                  {t('brandName')}
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{ ...user, avatar: user.avatar ?? "" }} />
      </SidebarFooter>
    </Sidebar>
  )
}