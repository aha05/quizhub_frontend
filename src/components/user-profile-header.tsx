import * as React from "react"
import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { EditModal } from "@/components/user-profile-edit-modal"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Settings, LogOut, User, Trophy, Star } from "lucide-react"
import { logout } from "@/services/auth.service"
import { getCurrentUser } from "@/services/user.service"
import { getUserActivity } from "@/services/activity.service"

interface UserActivity {
  name: string
  level: string
  totalQuizzes: number
  completed: number
  badges: string[]
  highestScorePercentage: number
  leaderboard: number
  averageScore: number
}

export interface User {
    id: number
    name: string
    email: string
    role: string
    status: string
}

export function UserProfileHeader() {
  const [userActivity, setUserActivity] = useState<UserActivity | null>(null)
  const [user, setUser] = useState<User>()
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)

  useEffect(() => {
    const loadUserActivity = async () => {
      try {
        const [userActivityData, userData] = await Promise.all([
          getUserActivity(),
          getCurrentUser()
        ]) 
        setUserActivity(userActivityData)
        setUser(userData)
        
      } catch (err) {
        console.error("Failed to load user activity", err)
      } finally {
        setLoading(false)
      }
    }

    loadUserActivity()
  }, [])

  const capitalizeName = (name: string) =>
    name
      .split(" ")
      .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ")

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map(w => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase()

  const badgeConfig: Record<
    string,
    { label: string; icon?: React.ReactNode }
  > = {
    FIRST_QUIZ: { label: "First Quiz", icon: <Trophy className="h-3 w-3" /> },
    HIGH_SCORER: { label: "High Scorer", icon: <Trophy className="h-3 w-3" /> },
    CONSISTENT: { label: "Consistent", icon: <Star className="h-3 w-3" /> },
  }

  if (loading) {
    return <p className="text-center text-muted-foreground">Loading...</p>
  }

  if (!userActivity) {
    return <p className="text-center text-destructive">No user data found.</p>
  }

  return (
    <>
      {/* Edit Profile Modal */}
      {user && (
        <EditModal
              isOpen={editOpen}
              onClose={() => setEditOpen(false)}
              initialData={user}
            />
      )}
      

      <Card className="mb-8 border-border/50 bg-card/50 backdrop-blur p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* User Info */}
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary/30">
              <AvatarImage src="/diverse-user-avatars.png" alt="User" />
              <AvatarFallback className="bg-primary/20 text-primary text-xl">
                {getInitials(userActivity.name)}
              </AvatarFallback>
            </Avatar>

            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {capitalizeName(userActivity.name)}
              </h1>
              <p className="text-muted-foreground">{userActivity.level}</p>

              {/* Badges */}
              <div className="mt-2 flex flex-wrap gap-2">
                {userActivity.badges.length > 0 ? (
                  userActivity.badges.map((badge) => {
                    const config = badgeConfig[badge]
                    return (
                      <Badge
                        key={badge}
                        variant="secondary"
                        className="flex items-center gap-1 bg-primary/10 text-primary border-primary/30"
                      >
                        {config?.icon}
                        {config?.label ?? badge}
                      </Badge>
                    )
                  })
                ) : (
                  <Badge
                    variant="secondary"
                    className="bg-primary/10 text-primary border-primary/30"
                  >
                    No badges yet
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Settings Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="border-border/50 bg-transparent"
              >
                <Settings className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={() => setEditOpen(true)}
              >
                <User className="mr-2 h-4 w-4" />
                Edit Profile
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                className="cursor-pointer text-destructive focus:text-destructive"
                onClick={logout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>
    </>
  )
}
