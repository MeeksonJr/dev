import { createClient } from "@supabase/supabase-js"

// Create a single instance of the Supabase client for server-side use
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Check if the required environment variables are available
if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing required environment variables for Supabase")
}

const supabase = createClient(
  supabaseUrl || "", // Provide a fallback empty string to prevent initialization errors
  supabaseServiceKey || "", // Provide a fallback empty string to prevent initialization errors
)

// Since we've already created the tables, this function now just checks if the table exists
export const ensureUserProfileTable = async () => {
  try {
    // Check if the user_profile table exists by attempting to query it
    const { data, error } = await supabase.from("user_profile").select("user_id").limit(1)

    if (error) {
      console.error("Error checking user_profile table:", error)
      throw error
    }

    return true
  } catch (error) {
    console.error("Error in ensureUserProfileTable:", error)
    throw error
  }
}

export const getUserProfile = async (userId: string) => {
  try {
    // Use maybeSingle instead of single to avoid errors when no profile exists
    const { data, error } = await supabase.from("user_profile").select("*").eq("user_id", userId).maybeSingle()

    if (error) {
      console.error("Error fetching user profile:", error)
      throw error
    }

    // If no profile exists, create one
    if (!data) {
      return await createUserProfile(userId)
    }

    return data
  } catch (error) {
    console.error("Error in getUserProfile:", error)
    return null
  }
}

export const incrementScrapeCount = async (userId: string) => {
  try {
    // First get the current count
    const { data: profile, error: fetchError } = await supabase
      .from("user_profile")
      .select("scrape_count")
      .eq("user_id", userId)
      .maybeSingle()

    if (fetchError) {
      console.error("Error fetching scrape count:", fetchError)
      throw fetchError
    }

    // If no profile exists, create one
    if (!profile) {
      await createUserProfile(userId)
      return
    }

    // Then increment it
    const newCount = (profile?.scrape_count || 0) + 1

    const { data, error } = await supabase
      .from("user_profile")
      .update({
        scrape_count: newCount,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)
      .select()

    if (error) {
      console.error("Error incrementing scrape count:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Error in incrementScrapeCount:", error)
    throw error
  }
}

export const updateSubscriptionPlan = async (userId: string, plan: string) => {
  try {
    // Check if profile exists
    const { data: profile, error: fetchError } = await supabase
      .from("user_profile")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle()

    if (fetchError) {
      console.error("Error fetching user profile:", fetchError)
      throw fetchError
    }

    // If no profile exists, create one with the specified plan
    if (!profile) {
      return await createUserProfile(userId, plan)
    }

    // Otherwise update the existing profile
    const { data, error } = await supabase
      .from("user_profile")
      .update({ subscription_plan: plan, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .select()

    if (error) {
      console.error("Error updating subscription plan:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Error in updateSubscriptionPlan:", error)
    throw error
  }
}

// Function to create a user profile if it doesn't exist
export const createUserProfile = async (userId: string, plan = "free") => {
  try {
    // Check if profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from("user_profile")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle()

    if (checkError) {
      console.error("Error checking for existing profile:", checkError)
      throw checkError
    }

    // If profile doesn't exist, create it
    if (!existingProfile) {
      const { data, error } = await supabase
        .from("user_profile")
        .insert([
          {
            user_id: userId,
            subscription_plan: plan,
            scrape_count: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .maybeSingle()

      if (error) {
        console.error("Error creating user profile:", error)
        throw error
      }

      return data
    }

    return existingProfile
  } catch (error) {
    console.error("Error in createUserProfile:", error)
    throw error
  }
}
