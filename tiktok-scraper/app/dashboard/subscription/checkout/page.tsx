"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const plan = searchParams.get("plan")

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Placeholder for PayPal integration
  // In a real implementation, you would:
  // 1. Load the PayPal SDK
  // 2. Create a PayPal button
  // 3. Handle the payment flow
  // 4. Update the user's subscription in the database

  const planDetails = {
    pro: {
      name: "Pro Plan",
      price: "$19",
      description: "For professionals and small teams",
    },
    business: {
      name: "Business Plan",
      price: "$49",
      description: "For businesses and agencies",
    },
  }

  const selectedPlan = plan === "pro" || plan === "business" ? planDetails[plan] : planDetails.pro

  const handleMockPayment = () => {
    setIsLoading(true)

    // Simulate payment processing
    setTimeout(() => {
      // In a real implementation, you would call an API to update the user's subscription
      setIsLoading(false)
      router.push("/dashboard/subscription/success?plan=" + plan)
    }, 2000)
  }

  if (!plan || (plan !== "pro" && plan !== "business")) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertTitle>Invalid Plan</AlertTitle>
          <AlertDescription>Please select a valid subscription plan.</AlertDescription>
        </Alert>
        <div className="mt-4">
          <Button asChild>
            <a href="/dashboard/subscription">Back to Plans</a>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 max-w-md">
      <h1 className="text-3xl font-bold mb-8 text-center">Checkout</h1>

      <Card>
        <CardHeader>
          <CardTitle>{selectedPlan.name}</CardTitle>
          <CardDescription>{selectedPlan.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-4xl font-bold mb-4">{selectedPlan.price}</div>
            <p className="text-sm text-gray-500">per month, billed monthly</p>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleMockPayment} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Pay with PayPal"
            )}
          </Button>
        </CardFooter>
      </Card>

      <div className="mt-4 text-center">
        <Button variant="ghost" asChild>
          <a href="/dashboard/subscription">Cancel</a>
        </Button>
      </div>
    </div>
  )
}
