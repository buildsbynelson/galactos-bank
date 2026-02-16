"use client"

import { useLocale } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { IconWorld } from '@tabler/icons-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const languages = [
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'pt', label: 'Português', flag: '🇵🇹' },
]

export default function LanguageSwitcher() {
  const currentLocale = useLocale()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleLanguageChange = (newLocale: string) => {
    if (newLocale === currentLocale) return; // Don't refresh if same language
    
    startTransition(() => {
      // Set cookie with proper options
      document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`
      
      // Force a hard refresh to pick up new locale
      window.location.reload()
    })
  }

  return (
    <Select value={currentLocale} onValueChange={handleLanguageChange} disabled={isPending}>
      <SelectTrigger className="w-[85px] h-9 rounded-md border bg-background">
        <div className="flex items-center gap-2">
          <IconWorld className="h-4 w-4" />
          <SelectValue>
            <span className="font-medium text-sm uppercase">
              {currentLocale}
            </span>
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            <div className="flex items-center gap-2">
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}