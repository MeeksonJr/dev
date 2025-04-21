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
export const ensureSocialDataTable = async () => {
  try {
    // Check if the social_data table exists by attempting to query it
    const { data, error } = await supabase.from("social_data").select("id").limit(1)

    if (error) {
      console.error("Error checking social_data table:", error)
      throw error
    }

    return true
  } catch (error) {
    console.error("Error in ensureSocialDataTable:", error)
    throw error
  }
}

export const storeScrapedData = async (
  userId: string,
  source: string,
  username: string,
  formattedData: any,
  rawData: any,
) => {
  try {
    // Ensure the table exists
    await ensureSocialDataTable()

    // Insert the data
    const { data, error } = await supabase
      .from("social_data")
      .insert([
        {
          user_id: userId,
          source,
          username,
          data: formattedData, // Keep for backward compatibility
          processed_data: formattedData, // New field for Gemini-processed data
          raw_data: rawData, // Store the original raw data
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) {
      console.error("Error storing scraped data:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Error in storeScrapedData:", error)
    throw error
  }
}

export const getUserScrapedData = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from("social_data")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching user scraped data:", error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Error in getUserScrapedData:", error)
    return []
  }
}
