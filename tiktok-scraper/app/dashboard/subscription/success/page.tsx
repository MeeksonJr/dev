"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { updateSubscriptionPlan } from "@/lib/supabase/user-profile"
import { Suspense } from "react"

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SuccessContent />
    </Suspense>
  )
}

function SuccessContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = searchParams.get("plan")

  useEffect(() => {
    const updateUserPlan = async () => {
      if (plan === "pro" || plan === "business") {
        try {
          const supabase = createClientComponentClient()
          const {
            data: { user },
          } = await supabase.auth.getUser()

          if (user) {
            await updateSubscriptionPlan(user.id, plan)
          }
        } catch (error) {
          console.error("Error updating subscription plan:", error)
        }
      }
    }

    updateUserPlan()
  }, [plan])

  return (
    <div className="container mx-auto py-8 max-w-md">
      <Card className="text-center">
        <CardHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <Check className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Thank you for your payment. Your subscription has been upgraded to the{" "}
            <span className="font-semibold capitalize">{plan}</span> plan.
          </p>
          <p className="mt-2 text-sm text-gray-500">
            You now have access to all the features included in your new plan.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <a href="/dashboard">Go to Dashboard</a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
