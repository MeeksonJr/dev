// Fallback implementation that uses direct API calls instead of the ApifyClient package

export const runTikTokScraper = async (usernameOrUrl: string) => {
  // Note: The actor ID format should use a tilde (~) in the URL but a slash (/) in the path
  const actorId = "clockworks/tiktok-scraper"
  const actorIdForUrl = "clockworks~tiktok-scraper"
  const apifyToken = process.env.apify_token

  if (!apifyToken) {
    throw new Error("Apify token is not configured")
  }

  // Clean the input - extract username if a URL was provided
  const username = usernameOrUrl.includes("tiktok.com/@")
    ? usernameOrUrl.split("@")[1].split("?")[0].split("/")[0]
    : usernameOrUrl.replace("@", "")

  // Use the correct payload format as shown in the working example
  const payload = {
    excludePinnedPosts: false,
    profiles: [username],
    proxyCountryCode: "None",
    resultsPerPage: 10,
    searchSection: "/user",
    shouldDownloadAvatars: false,
    shouldDownloadCovers: false,
    shouldDownloadMusicCovers: false,
    shouldDownloadSlideshowImages: false,
    shouldDownloadSubtitles: false,
    shouldDownloadVideos: false,
  }

  try {
    console.log("Starting TikTok scraper with payload:", JSON.stringify(payload))

    // Use the correct URL format with the tilde
    const runResponse = await fetch(`https://api.apify.com/v2/acts/${actorIdForUrl}/runs?token=${apifyToken}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      cache: "no-store",
    })

    if (!runResponse.ok) {
      const errorText = await runResponse.text()
      console.error("Apify API error response:", errorText)
      throw new Error(`Failed to start scraper: ${runResponse.statusText}`)
    }

    const runData = await runResponse.json()
    console.log("Scraper run started successfully with ID:", runData.id)
    return {
      id: runData.id,
      defaultDatasetId: runData.defaultDatasetId,
    }
  } catch (error) {
    console.error("Error starting TikTok scraper:", error)
    throw error
  }
}

export const getScrapeResult = async (runId: string, datasetId: string) => {
  const apifyToken = process.env.apify_token

  if (!apifyToken) {
    throw new Error("Apify token is not configured")
  }

  try {
    // First check if the run is finished
    const statusResponse = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${apifyToken}`, {
      cache: "no-store",
    })

    if (!statusResponse.ok) {
      throw new Error(`Failed to get run status: ${statusResponse.statusText}`)
    }

    const statusData = await statusResponse.json()
    console.log("Run status:", statusData.status)

    if (statusData.status !== "SUCCEEDED") {
      return { status: statusData.status, data: null }
    }

    // If run is finished, get the data
    const response = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${apifyToken}`, {
      cache: "no-store",
    })

    if (!response.ok) {
      throw new Error(`Failed to get scrape results: ${response.statusText}`)
    }

    const data = await response.json()
    return { status: "SUCCEEDED", data }
  } catch (error) {
    console.error("Error getting TikTok scrape results:", error)
    throw error
  }
}

export const pollForResults = async (runId: string, datasetId: string, maxAttempts = 20, interval = 3000) => {
  console.log(`Starting to poll for results for run ${runId}`)
  let attempts = 0

  while (attempts < maxAttempts) {
    console.log(`Polling attempt ${attempts + 1}/${maxAttempts}`)
    const result = await getScrapeResult(runId, datasetId)

    if (result.status === "SUCCEEDED" && result.data) {
      console.log("Polling succeeded, data retrieved")
      return result.data
    }

    if (result.status === "FAILED" || result.status === "ABORTED" || result.status === "TIMED-OUT") {
      throw new Error(`Scraping failed with status: ${result.status}`)
    }

    // If still running, wait and try again
    console.log(`Run status: ${result.status}. Waiting ${interval}ms before next attempt...`)
    await new Promise((resolve) => setTimeout(resolve, interval))
    attempts++
  }

  throw new Error("Scraping timed out after maximum polling attempts")
}
