import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { notFound } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TwitterIcon as TikTok, Heart, Video, AlertCircle, Users } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

// Create a Supabase client for server-side use with cookies
const createServerClient = () => {
  const cookieStore = cookies()

  return createClientComponentClient({
    cookies: () => cookieStore,
  })
}

async function getProfileData(id: string) {
  const supabase = createServerClient()

  // First check if the user is authenticated
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error("Authentication required")
  }

  // Get the profile data
  const { data, error } = await supabase.from("social_data").select("*").eq("id", id).single()

  if (error) {
    console.error("Error fetching profile data:", error)
    throw error
  }

  if (!data) {
    return null
  }

  // Check if the profile belongs to the user
  if (data.user_id !== user.id) {
    throw new Error("Unauthorized")
  }

  return data
}

export default async function ProfilePage({ params }: { params: { id: string } }) {
  let profileData

  try {
    profileData = await getProfileData(params.id)
  } catch (error) {
    console.error("Error loading profile:", error)
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{(error as Error).message || "Failed to load profile data"}</AlertDescription>
        </Alert>
        <div className="mt-4">
          <a href="/dashboard/scrape-tiktok" className="text-blue-600 hover:underline">
            &larr; Back to TikTok Scraper
          </a>
        </div>
      </div>
    )
  }

  if (!profileData) {
    notFound()
  }

  const profile = profileData.data
  const rawData = profileData.raw_data || profileData.processed_data

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <a href="/dashboard/scrape-tiktok" className="text-blue-600 hover:underline">
          &larr; Back to TikTok Scraper
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage
                    src={profile.profilePictureUrl || "/placeholder.svg?height=96&width=96"}
                    alt={profile.username}
                  />
                  <AvatarFallback>{profile.username?.substring(0, 2).toUpperCase() || "TT"}</AvatarFallback>
                </Avatar>
                <CardTitle className="text-2xl flex items-center justify-center gap-2">
                  @{profile.username}
                  {profile.verified && (
                    <span className="text-blue-500">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        className="w-5 h-5"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8.603 3.799A4.49 4.49 0 0112 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 013.498 1.307 4.491 4.491 0 011.307 3.497A4.49 4.49 0 0121.75 12a4.49 4.49 0 01-1.549 3.397 4.491 4.491 0 01-1.307 3.497 4.491 4.491 0 01-3.497 1.307A4.49 4.49 0 0112 21.75a4.49 4.49 0 01-3.397-1.549 4.49 4.49 0 01-3.498-1.306 4.491 4.491 0 01-1.307-3.498A4.49 4.49 0 012.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 011.307-3.497 4.49 4.49 0 013.497-1.307zm7.007 6.387a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </span>
                  )}
                </CardTitle>
                <CardDescription className="text-lg">{profile.fullName}</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {profile.bio && (
                <div className="mb-4 text-center">
                  <p className="text-gray-700">{profile.bio}</p>
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 text-center mt-6">
                <div className="flex flex-col">
                  <span className="text-2xl font-bold">{profile.followersCount?.toLocaleString() || "0"}</span>
                  <span className="text-sm text-gray-500">Followers</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold">{profile.followingCount?.toLocaleString() || "0"}</span>
                  <span className="text-sm text-gray-500">Following</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-bold">{profile.likesCount?.toLocaleString() || "0"}</span>
                  <span className="text-sm text-gray-500">Likes</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center">
                    <TikTok className="h-4 w-4 mr-1" />
                    <span>TikTok</span>
                  </div>
                  <div>Scraped {formatDistanceToNow(new Date(profileData.created_at), { addSuffix: true })}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Profile Overview</CardTitle>
              <CardDescription>Overview of @{profile.username}'s TikTok profile</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="stats">
                <TabsList className="mb-4">
                  <TabsTrigger value="stats">Stats</TabsTrigger>
                  <TabsTrigger value="raw">Raw Data</TabsTrigger>
                </TabsList>

                <TabsContent value="stats">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Profile Statistics</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <Card className="p-4">
                          <div className="flex flex-col items-center">
                            <Users className="h-8 w-8 text-blue-500 mb-2" />
                            <span className="text-2xl font-bold">
                              {profile.followersCount?.toLocaleString() || "0"}
                            </span>
                            <span className="text-sm text-gray-500">Followers</span>
                          </div>
                        </Card>
                        <Card className="p-4">
                          <div className="flex flex-col items-center">
                            <Heart className="h-8 w-8 text-red-500 mb-2" />
                            <span className="text-2xl font-bold">{profile.likesCount?.toLocaleString() || "0"}</span>
                            <span className="text-sm text-gray-500">Likes</span>
                          </div>
                        </Card>
                        <Card className="p-4">
                          <div className="flex flex-col items-center">
                            <Video className="h-8 w-8 text-green-500 mb-2" />
                            <span className="text-2xl font-bold">{profile.videoCount?.toLocaleString() || "0"}</span>
                            <span className="text-sm text-gray-500">Videos</span>
                          </div>
                        </Card>
                        <Card className="p-4">
                          <div className="flex flex-col items-center">
                            <div className="h-8 w-8 flex items-center justify-center text-purple-500 mb-2">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="currentColor"
                                className="w-8 h-8"
                              >
                                <path d="M18.375 2.25c-1.035 0-1.875.84-1.875 1.875v15.75c0 1.035.84 1.875 1.875 1.875h.75c1.035 0 1.875-.84 1.875-1.875V4.125c0-1.036-.84-1.875-1.875-1.875h-.75zM9.75 8.625c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-.75a1.875 1.875 0 01-1.875-1.875V8.625zM3 13.125c0-1.036.84-1.875 1.875-1.875h.75c1.036 0 1.875.84 1.875 1.875v6.75c0 1.035-.84 1.875-1.875 1.875h-.75A1.875 1.875 0 013 19.875v-6.75z" />
                              </svg>
                            </div>
                            <span className="text-2xl font-bold">
                              {profile.followersCount > 0
                                ? ((profile.likesCount || 0) / (profile.followersCount || 1)).toFixed(2)
                                : "0"}
                            </span>
                            <span className="text-sm text-gray-500">Engagement Ratio</span>
                          </div>
                        </Card>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-2">Profile Information</h3>
                      <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Username</p>
                            <p className="font-medium">@{profile.username}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Full Name</p>
                            <p className="font-medium">{profile.fullName}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Verified</p>
                            <p className="font-medium">{profile.verified ? "Yes" : "No"}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">Bio</p>
                            <p className="font-medium">{profile.bio || "No bio"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="raw">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <pre className="text-xs overflow-auto max-h-96">{JSON.stringify(rawData, null, 2)}</pre>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
