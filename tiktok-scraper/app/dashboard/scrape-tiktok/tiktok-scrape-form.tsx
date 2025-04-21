"use client"

import { useState } from "react"
import { scrapeTikTokProfile } from "@/app/actions/scrape-tiktok"
import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"

const initialState = {
  success: false,
  error: null,
  data: null,
}

export default function TikTokScrapeForm() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [state, formAction] = useActionState(async (prevState: any, formData: FormData) => {
    setIsSubmitting(true)
    try {
      const result = await scrapeTikTokProfile(formData)
      setIsSubmitting(false)
      return result
    } catch (error: any) {
      setIsSubmitting(false)
      return {
        success: false,
        error: error.message || "An error occurred",
      }
    }
  }, initialState)

  return (
    <div>
      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
            TikTok Username or Profile URL
          </label>
          <Input
            id="username"
            name="username"
            type="text"
            placeholder="@username or https://tiktok.com/@username"
            required
            className="w-full"
          />
          <p className="text-sm text-gray-500 mt-1">Enter a TikTok username (with or without @) or full profile URL</p>
        </div>

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Scraping Profile...
            </>
          ) : (
            "Scrape Profile"
          )}
        </Button>
      </form>

      {state.error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
          <p className="font-medium">Error:</p>
          <p>{state.error}</p>
        </div>
      )}

      {state.success && state.data && (
        <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md">
          <p className="font-medium">Success!</p>
          <p>Profile data for @{state.data.username} has been scraped and stored.</p>
        </div>
      )}
    </div>
  )
}
