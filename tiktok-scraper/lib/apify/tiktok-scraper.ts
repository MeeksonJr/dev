import { getApifyClient } from "./apify-client"

export const runTikTokScraper = async (usernameOrUrl: string) => {
  try {
    // Clean the input - extract username if a URL was provided
    const username = usernameOrUrl.includes("tiktok.com/@")
      ? usernameOrUrl.split("@")[1].split("?")[0].split("/")[0]
      : usernameOrUrl.replace("@", "")

    console.log(`Starting TikTok scraper for username: ${username}`)

    // Get the ApifyClient instance
    const client = getApifyClient()

    // Prepare Actor input
    const input = {
      profiles: [username],
      proxyCountryCode: "None",
      resultsPerPage: 10,
      shouldDownloadVideos: false,
      shouldDownloadSlideshowImages: false,
      shouldDownloadAvatars: false,
      shouldDownloadCovers: false,
      shouldDownloadMusicCovers: false,
      shouldDownloadSubtitles: false,
      excludePinnedPosts: false,
    }

    console.log("Starting Apify actor with input:", JSON.stringify(input))

    // Run the Actor and wait for it to finish
    const run = await client.actor("clockworks/tiktok-scraper").call(input)

    console.log(`Run started with ID: ${run.id}`)
    console.log(`Dataset ID: ${run.defaultDatasetId}`)

    return {
      id: run.id,
      defaultDatasetId: run.defaultDatasetId,
    }
  } catch (error) {
    console.error("Error starting TikTok scraper:", error)
    throw error
  }
}

export const getScrapeResult = async (runId: string, datasetId: string) => {
  try {
    // Get the ApifyClient instance
    const client = getApifyClient()

    // Check the run status
    const run = await client.run(runId).get()

    console.log(`Run status: ${run.status}`)

    if (run.status !== "SUCCEEDED") {
      return { status: run.status, data: null }
    }

    // Fetch the dataset items
    const { items } = await client.dataset(datasetId).listItems()

    return { status: "SUCCEEDED", data: items }
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
