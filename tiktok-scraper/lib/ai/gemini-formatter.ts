import { generateText } from "ai"
import { groq } from "@ai-sdk/groq"

export const formatWithGemini = async (rawData: any) => {
  try {
    console.log("Formatting data with Gemini...")

    // If the data is already in the correct format, return it
    if (
      typeof rawData === "object" &&
      !Array.isArray(rawData) &&
      rawData.username &&
      rawData.videos &&
      Array.isArray(rawData.videos)
    ) {
      console.log("Data is already in the correct format, skipping Gemini formatting")
      return rawData
    }

    const prompt = `
      Given the following TikTok data, format it into a clean JSON with these fields:
      - username
      - fullName
      - bio
      - followersCount
      - followingCount
      - likesCount
      - profilePictureUrl
      - videos: [ { title, likes, comments, shares, videoUrl, thumbnailUrl, createdAt } ]
      
      Only include these fields, and ensure the output is valid JSON.
      
      TikTok Data:
      ${JSON.stringify(rawData)}
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
      return JSON.parse(jsonMatch[1] || jsonMatch[0])
    }

    // If no JSON format was found, try to parse the whole response
    try {
      return JSON.parse(text)
    } catch (e) {
      console.error("Failed to parse Groq response as JSON:", e)
      return { error: "Failed to format data", rawResponse: text }
    }
  } catch (error) {
    console.error("Error formatting with Groq:", error)
    throw error
  }
}
