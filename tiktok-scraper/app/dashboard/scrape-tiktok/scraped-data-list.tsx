"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TwitterIcon as TikTok, Users, Heart, Video, ExternalLink } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface ScrapedDataListProps {
  data: any[]
}

export default function ScrapedDataList({ data }: ScrapedDataListProps) {
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({})

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>You haven't scraped any profiles yet.</p>
      </div>
    )
  }

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  return (
    <div className="space-y-4">
      {data.map((item) => {
        const profileData = item.data
        const isExpanded = expandedItems[item.id] || false

        return (
          <Card key={item.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={profileData.profilePictureUrl || "/placeholder.svg?height=40&width=40"}
                      alt={profileData.username}
                    />
                    <AvatarFallback>{profileData.username?.substring(0, 2).toUpperCase() || "TT"}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg flex items-center gap-1">
                      @{profileData.username}
                      {profileData.verified && (
                        <span className="text-blue-500">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                            className="w-4 h-4"
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
                    <CardDescription>{profileData.fullName}</CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="flex items-center gap-1">
                  <TikTok className="h-3 w-3" />
                  TikTok
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pb-2">
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4 text-gray-500" />
                  <span>{profileData.followersCount?.toLocaleString() || "0"} followers</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="h-4 w-4 text-gray-500" />
                  <span>{profileData.likesCount?.toLocaleString() || "0"} likes</span>
                </div>
                <div className="flex items-center gap-1">
                  <Video className="h-4 w-4 text-gray-500" />
                  <span>{profileData.videoCount || 0} videos</span>
                </div>
              </div>

              {profileData.bio && <p className="mt-2 text-sm text-gray-700">{profileData.bio}</p>}
            </CardContent>

            <CardFooter className="flex justify-between pt-2">
              <div className="text-xs text-gray-500">
                Scraped {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild className="text-xs">
                  <Link href={`/dashboard/profile/${item.id}`}>
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View Details
                  </Link>
                </Button>
              </div>
            </CardFooter>
          </Card>
        )
      })}
    </div>
  )
}
