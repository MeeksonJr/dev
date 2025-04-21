"use server"

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { storeScrapedData } from "@/lib/supabase/social-data"
import { getUserProfile, incrementScrapeCount, createUserProfile } from "@/lib/supabase/user-profile"
import { scrapeTikTokProfile as rapidApiScrapeTikTokProfile, getTikTokUserInfo } from "@/lib/rapidapi/tiktok-api"

// Create a Supabase client for server-side use with cookies
const createServerClient = () => {
  const cookieStore = cookies()

  return createClientComponentClient({
    cookies: () => cookieStore,
  })
}

// Function to check if user has reached their scrape limit
const checkScrapeLimit = async (userId: string) => {
  let userProfile = await getUserProfile(userId)

  if (!userProfile) {
    // Create a user profile if one doesn't exist
    userProfile = await createUserProfile(userId)

    if (!userProfile) {
      throw new Error("Failed to create user profile")
    }
  }

  const { subscription_plan, scrape_count } = userProfile

  // Define limits based on subscription plan
  const limits = {
    free: 5,
    pro: 50,
    business: Number.POSITIVE_INFINITY,
  }

  const limit = limits[subscription_plan as keyof typeof limits] || limits.free

  if (scrape_count >= limit && limit !== Number.POSITIVE_INFINITY) {
    return {
      canScrape: false,
      message: `You've reached your monthly limit of ${limit} scrapes. Please upgrade your subscription plan to continue scraping.`,
    }
  }

  return {
    canScrape: true,
    message: `You have used ${scrape_count} out of ${limit === Number.POSITIVE_INFINITY ? "unlimited" : limit} scrapes this month.`,
  }
}

export async function scrapeTikTokProfile(formData: FormData) {
  try {
    const usernameOrUrl = formData.get("username") as string

    if (!usernameOrUrl) {
      return { success: false, error: "Username or URL is required" }
    }

    // Get the current user
    let supabase
    try {
      supabase = createServerClient()
    } catch (error) {
      console.error("Error creating Supabase client:", error)
      return { success: false, error: "Failed to initialize authentication. Please try again later." }
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return { success: false, error: "Authentication required" }
    }

    // Check if user has reached their scrape limit
    const { canScrape, message } = await checkScrapeLimit(user.id)

    if (!canScrape) {
      return { success: false, error: message }
    }

    // Clean the username (remove @ if present and extract from URL if needed)
    let username = usernameOrUrl

    if (usernameOrUrl.includes("tiktok.com/")) {
      // Extract username from URL
      const matches = usernameOrUrl.match(/tiktok\.com\/@([^/?]+)/)
      if (matches && matches[1]) {
        username = matches[1]
      }
    } else if (usernameOrUrl.startsWith("@")) {
      username = usernameOrUrl.substring(1)
    }

    try {
      // Get the raw API response first
      const rawResponse = await getTikTokUserInfo(username)

      // Format the data for our application
      const formattedData = await rapidApiScrapeTikTokProfile(username)

      // Increment the user's scrape count
      await incrementScrapeCount(user.id)

      // Store both raw and processed data in Supabase
      try {
        await storeScrapedData(user.id, "tiktok", formattedData.username, formattedData, rawResponse)
      } catch (error: any) {
        console.error("Error storing data in Supabase:", error)
        // Return the formatted data even if storage fails
        return {
          success: true,
          data: formattedData,
          warning: "Data was scraped successfully but could not be stored. Database error.",
        }
      }

      return {
        success: true,
        data: formattedData,
      }
    } catch (error: any) {
      console.error("Error with RapidAPI:", error)
      return {
        success: false,
        error: error.message || "Failed to fetch TikTok profile data. Please try again later.",
      }
    }
  } catch (error: any) {
    console.error("Error scraping TikTok profile:", error)
    return {
      success: false,
      error: error.message || "An error occurred while scraping the profile",
    }
  }
}
