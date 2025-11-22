"use client"

import { IconRefresh } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner" // or your toast library

interface RegenerateIMFButtonProps {
  currentCode: string
}

export function RegenerateIMFButton({  }: RegenerateIMFButtonProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleRegenerate = async () => {
    try {
      setIsLoading(true)
      
      const response = await fetch("/api/admin/regenerate-imf", {
        method: "POST",
      })

      const data = await response.json()

      if (data.success) {
        toast.success(`IMF code regenerated: ${data.code}`)
        router.refresh() // Refresh server component data
      } else {
        toast.error("Failed to regenerate IMF code")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleRegenerate}
      disabled={isLoading}
      className="gap-1.5"
    >
      <IconRefresh className={isLoading ? "animate-spin" : ""} size={16} />
      Regenerate
    </Button>
  )
}