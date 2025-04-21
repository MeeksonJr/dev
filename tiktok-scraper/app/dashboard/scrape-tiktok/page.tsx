import { Suspense } from "react"
import TikTokScrapeForm from "./tiktok-scrape-form"
import { getUserScrapedData } from "@/lib/supabase/social-data"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import ScrapedDataList from "./scraped-data-list"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

// Add this export to make the page dynamic
export const dynamic = "force-dynamic"

// Create a Supabase client for server-side use with cookies
const createServerClient = () => {
  const cookieStore = cookies()

  return createClientComponentClient({
    cookies: () => cookieStore,
  })
}

async function ScrapedDataLoader() {
  try {
    // Get the current user
    const supabase = createServerClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Authentication Error</AlertTitle>
          <AlertDescription>Failed to authenticate user. Please try logging in again.</AlertDescription>
        </Alert>
      )
    }

    if (!user) {
      return <div>Please log in to view your scraped data.</div>
    }

    try {
      const scrapedData = await getUserScrapedData(user.id)
      return <ScrapedDataList data={scrapedData} />
    } catch (error) {
      console.error("Error loading scraped data:", error)
      return (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Data Loading Error</AlertTitle>
          <AlertDescription>Failed to load your scraped data. Please try again later.</AlertDescription>
        </Alert>
      )
    }
  } catch (error) {
    console.error("Error in ScrapedDataLoader:", error)
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Configuration Error</AlertTitle>
        <AlertDescription>
          There was an error with the application configuration. Please contact support.
        </AlertDescription>
      </Alert>
    )
  }
}

export default function ScrapeTikTokPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">TikTok Profile Scraper</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Scrape a TikTok Profile</h2>
            <TikTokScrapeForm />
          </div>
        </div>

        <div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Your Scraped Profiles</h2>
            <Suspense fallback={<div>Loading your scraped data...</div>}>
              <ScrapedDataLoader />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  )
}
