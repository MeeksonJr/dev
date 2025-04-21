import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TwitterIcon as TikTok, Search, Database, CreditCard, Info } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getUserProfile, createUserProfile } from "@/lib/supabase/user-profile"
import { getUserScrapedData } from "@/lib/supabase/social-data"

// Create a Supabase client for server-side use with cookies
const createServerClient = () => {
  const cookieStore = cookies()

  return createClientComponentClient({
    cookies: () => cookieStore,
  })
}

export default async function DashboardPage() {
  // Get the current user
  const supabase = createServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    console.error("Authentication error:", error)
  }

  if (!user) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Welcome to Social Scraper</h1>
        <p className="mb-8">Please log in to access your dashboard.</p>
        <Button asChild>
          <Link href="/login">Log In</Link>
        </Button>
      </div>
    )
  }

  // Get user profile and scraped data
  let userProfile = null
  let scrapedData = []

  try {
    userProfile = await getUserProfile(user.id)

    // If no profile exists, create one
    if (!userProfile) {
      userProfile = await createUserProfile(user.id)
    }

    scrapedData = await getUserScrapedData(user.id)
  } catch (error) {
    console.error("Error fetching user data:", error)
  }

  // Check if this is a new user (no scraped data)
  const isNewUser = !scrapedData || scrapedData.length === 0

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-2">Welcome to Your Dashboard</h1>
      <p className="text-gray-600 mb-8">Start scraping social media profiles and analyzing data</p>

      {isNewUser && (
        <Alert className="mb-8 bg-blue-50 border-blue-200">
          <Info className="h-5 w-5 text-blue-500" />
          <AlertTitle className="text-blue-700">Welcome to Social Scraper!</AlertTitle>
          <AlertDescription className="text-blue-600">
            Get started by scraping your first TikTok profile. Just click on "Scrape TikTok" below and enter a TikTok
            username or profile URL.
          </AlertDescription>
        </Alert>
      )}

      {userProfile && userProfile.subscription_plan === "free" && (
        <Alert className="mb-8">
          <Info className="h-5 w-5" />
          <AlertTitle>Free Plan</AlertTitle>
          <AlertDescription>
            You're currently on the Free plan with {5 - (userProfile.scrape_count || 0)} scrapes remaining this month.{" "}
            <Link href="/dashboard/subscription" className="font-medium underline underline-offset-4">
              Upgrade your plan
            </Link>{" "}
            for more features.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TikTok className="h-5 w-5" />
              TikTok Scraper
            </CardTitle>
            <CardDescription>Scrape TikTok profiles and analyze their content</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Extract follower counts, engagement metrics, and recent videos from any public TikTok profile.
            </p>
            <Button asChild className="w-full">
              <Link href="/dashboard/scrape-tiktok">
                <Search className="mr-2 h-4 w-4" />
                Scrape TikTok
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              My Data
            </CardTitle>
            <CardDescription>View and manage your scraped data</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Access all your previously scraped profiles and export the data in various formats.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/my-data">
                <Database className="mr-2 h-4 w-4" />
                View My Data
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Subscription
            </CardTitle>
            <CardDescription>Manage your subscription plan</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Upgrade your plan to increase your scraping limits and access premium features.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/dashboard/subscription">
                <CreditCard className="mr-2 h-4 w-4" />
                Manage Subscription
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
