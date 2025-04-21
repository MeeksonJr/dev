// Fix the import statement for ApifyClient
import ApifyClient from "apify-client"

// Create a singleton instance of the ApifyClient
let apifyClientInstance: ApifyClient | null = null

export function getApifyClient(): ApifyClient {
  if (!apifyClientInstance) {
    const apifyToken = process.env.apify_token

    if (!apifyToken) {
      throw new Error("Apify token is not configured")
    }

    apifyClientInstance = new ApifyClient({
      token: apifyToken,
    })
  }

  return apifyClientInstance
}
