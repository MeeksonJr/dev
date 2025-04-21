import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, CreditCard } from "lucide-react"
import { getUserProfile } from "@/lib/supabase/user-profile"

// Create a Supabase client for server-side use with cookies
const createServerClient = () => {
  const cookieStore = cookies()

  return createClientComponentClient({
    cookies: () => cookieStore,
  })
}

export default async function SubscriptionPage() {
  // Get the current user
  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return (
      <div className="container mx-auto py-8 text-center">
        <h1 className="text-3xl font-bold mb-4">Subscription Plans</h1>
        <p className="mb-8">Please log in to manage your subscription.</p>
        <Button asChild>
          <a href="/login">Log In</a>
        </Button>
      </div>
    )
  }

  // Get user profile
  const userProfile = await getUserProfile(user.id)
  const currentPlan = userProfile?.subscription_plan || "free"

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-2">Subscription Plans</h1>
      <p className="text-gray-600 mb-8">
        You are currently on the <span className="font-semibold capitalize">{currentPlan}</span> plan.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className={currentPlan === "free" ? "border-primary" : ""}>
          <CardHeader>
            <CardTitle>Free</CardTitle>
            <CardDescription>For individuals just getting started</CardDescription>
            <div className="mt-4 text-4xl font-bold">$0</div>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2.5 text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>5 profile scrapes per month</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Basic analytics</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>TikTok profiles only</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>7-day data retention</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            {currentPlan === "free" ? (
              <Button disabled className="w-full">
                Current Plan
              </Button>
            ) : (
              <Button variant="outline" className="w-full" disabled>
                Downgrade
              </Button>
            )}
          </CardFooter>
        </Card>

        <Card className={currentPlan === "pro" ? "border-primary" : ""}>
          <CardHeader>
            <CardTitle>Pro</CardTitle>
            <CardDescription>For professionals and small teams</CardDescription>
            <div className="mt-4 text-4xl font-bold">$19</div>
            <div className="text-sm text-gray-500">per month</div>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2.5 text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>50 profile scrapes per month</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Advanced analytics</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>All social platforms</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>30-day data retention</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Export data (CSV, JSON)</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            {currentPlan === "pro" ? (
              <Button disabled className="w-full">
                Current Plan
              </Button>
            ) : (
              <Button className="w-full" asChild>
                <a href="/dashboard/subscription/checkout?plan=pro">
                  <CreditCard className="mr-2 h-4 w-4" />
                  {currentPlan === "business" ? "Downgrade" : "Upgrade"}
                </a>
              </Button>
            )}
          </CardFooter>
        </Card>

        <Card className={currentPlan === "business" ? "border-primary" : ""}>
          <CardHeader>
            <CardTitle>Business</CardTitle>
            <CardDescription>For businesses and agencies</CardDescription>
            <div className="mt-4 text-4xl font-bold">$49</div>
            <div className="text-sm text-gray-500">per month</div>
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2.5 text-sm">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Unlimited profile scrapes</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Premium analytics</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>All social platforms</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>90-day data retention</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Export data (CSV, JSON, Excel)</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-primary" />
                <span>Priority support</span>
              </li>
            </ul>
          </CardContent>
          <CardFooter>
            {currentPlan === "business" ? (
              <Button disabled className="w-full">
                Current Plan
              </Button>
            ) : (
              <Button className="w-full" asChild>
                <a href="/dashboard/subscription/checkout?plan=business">
                  <CreditCard className="mr-2 h-4 w-4" />
                  Upgrade
                </a>
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
