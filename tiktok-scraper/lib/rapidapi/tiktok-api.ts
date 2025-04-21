// RapidAPI TikTok integration - simplified version

const RAPIDAPI_KEY = "96fb6ac7c5msh91468fea43d4febp181cefjsn9aadf4a3ee02"
const RAPIDAPI_HOST = "tiktok-api23.p.rapidapi.com"

// Interface based on the actual response format
interface TikTokUserResponse {
  extra: {
    fatal_item_ids: any[]
    logid: string
    now: number
  }
  log_pb: {
    impr_id: string
  }
  shareMeta: {
    desc: string
    title: string
  }
  statusCode: number
  status_code: number
  status_msg: string
  userInfo: {
    stats: {
      diggCount: number
      followerCount: number
      followingCount: number
      friendCount: number
      heart: number
      heartCount: number
      videoCount: number
    }
    user: {
      avatarLarger: string
      avatarMedium: string
      avatarThumb: string
      bioLink?: {
        link: string
        risk: number
      }
      commentSetting: number
      commerceUserInfo: {
        commerceUser: boolean
      }
      duetSetting: number
      followingVisibility: number
      ftc: boolean
      id: string
      isADVirtual: boolean
      nickname: string
      openFavorite: boolean
      privateAccount: boolean
      profileTab: {
        showMusicTab: boolean
        showPlayListTab: boolean
      }
      relation: number
      secUid: string
      secret: boolean
      signature: string
      stitchSetting: number
      ttSeller: boolean
      uniqueId: string
      verified: boolean
    }
  }
}

// Interface for our formatted data
interface FormattedTikTokProfile {
  username: string
  fullName: string
  bio: string
  followersCount: number
  followingCount: number
  likesCount: number
  profilePictureUrl: string
  videoCount: number
  verified: boolean
}

export async function getTikTokUserInfo(username: string): Promise<TikTokUserResponse> {
  // Clean the username (remove @ if present)
  const cleanUsername = username.startsWith("@") ? username.substring(1) : username

  const url = `https://tiktok-api23.p.rapidapi.com/api/user/info?uniqueId=${cleanUsername}`
  const options = {
    method: "GET",
    headers: {
      "x-rapidapi-key": RAPIDAPI_KEY,
      "x-rapidapi-host": RAPIDAPI_HOST,
    },
  }

  try {
    console.log(`Fetching TikTok user info for: ${cleanUsername}`)
    const response = await fetch(url, options)

    if (!response.ok) {
      const errorText = await response.text()
      console.error("RapidAPI error response:", errorText)
      throw new Error(`Failed to fetch user info: ${response.statusText}`)
    }

    const result = await response.json()
    return result
  } catch (error) {
    console.error("Error fetching TikTok user info:", error)
    throw error
  }
}

export function formatTikTokProfile(data: TikTokUserResponse): FormattedTikTokProfile {
  const { userInfo } = data

  return {
    username: userInfo.user.uniqueId,
    fullName: userInfo.user.nickname,
    bio: userInfo.user.signature,
    followersCount: userInfo.stats.followerCount,
    followingCount: userInfo.stats.followingCount,
    likesCount: userInfo.stats.heartCount,
    profilePictureUrl: userInfo.user.avatarMedium,
    videoCount: userInfo.stats.videoCount,
    verified: userInfo.user.verified,
  }
}

export async function scrapeTikTokProfile(username: string): Promise<FormattedTikTokProfile> {
  try {
    // Clean the username (remove @ if present and extract from URL if needed)
    let cleanUsername = username

    if (username.includes("tiktok.com/")) {
      // Extract username from URL
      const matches = username.match(/tiktok\.com\/@([^/?]+)/)
      if (matches && matches[1]) {
        cleanUsername = matches[1]
      }
    } else if (username.startsWith("@")) {
      cleanUsername = username.substring(1)
    }

    console.log(`Scraping TikTok profile for: ${cleanUsername}`)

    // Fetch user info
    const userInfoResponse = await getTikTokUserInfo(cleanUsername)

    // Format the data
    const formattedData = formatTikTokProfile(userInfoResponse)

    return formattedData
  } catch (error) {
    console.error("Error scraping TikTok profile with RapidAPI:", error)
    throw error
  }
}
