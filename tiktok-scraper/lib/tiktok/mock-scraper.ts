// This is a fallback implementation that uses Gemini to generate mock data when RapidAPI fails

import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

export const generateMockTikTokProfile = async (username: string) => {
  try {
    console.log(`Generating mock TikTok profile for: ${username}`)

    // Clean the username (remove @ if present)
    const cleanUsername = username.startsWith("@") ? username.substring(1) : username

    // Use Gemini to generate realistic mock data based on the username
    const prompt = `
      Generate realistic TikTok profile data for the username "${cleanUsername}".
      
      Create a JSON object with these fields:
      - username: "${cleanUsername}"
      - fullName: (a realistic full name)
      - bio: (a realistic bio)
      - followersCount: (a realistic number between 100 and 1,000,000)
      - followingCount: (a realistic number between 10 and 5,000)
      - likesCount: (a realistic number between 100 and 10,000,000)
      - profilePictureUrl: "/placeholder.svg?height=400&width=400"
      - videos: (an array of 5-10 videos with these fields for each:)
        - title: (a realistic video caption)
        - likes: (a number between 10 and 100,000)
        - comments: (a number between 0 and 5,000)
        - shares: (a number between 0 and 10,000)
        - videoUrl: "/placeholder.svg?height=720&width=1280"
        - thumbnailUrl: "/placeholder.svg?height=400&width=300"
        - createdAt: (a date within the last 3 months)
      
      Make the data realistic and varied. Return ONLY the JSON object with no additional text.
    `

    const { text } = await generateText({
      model: groq("llama3-70b-8192"),
      prompt,
      maxTokens: 2048,
    })

    // Extract JSON from the response
    const jsonMatch =
      text.match(/```json\n([\s\S]*?)\n```/) || text.match(/```\n([\s\S]*?)\n```/) || text.match(/{[\s\S]*}/)

    if (jsonMatch) {
      const mockData = JSON.parse(jsonMatch[1] || jsonMatch[0])
      console.log("Generated mock data for TikTok profile")
      return mockData
    }

    // If no JSON format was found, try to parse the whole response
    try {
      const mockData = JSON.parse(text)
      console.log("Generated mock data for TikTok profile")
      return mockData
    } catch (e) {
      console.error("Failed to parse Groq response as JSON:", e)
      throw new Error("Failed to generate mock data")
    }
  } catch (error) {
    console.error("Error generating mock TikTok data:", error)
    throw error
  }
}
