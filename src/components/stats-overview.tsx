import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Trophy, Target, CheckCircle2, TrendingUp } from "lucide-react"
import { Progress } from "@/components/ui/progress"
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

export function StatsOverview() {
  const [userActivity, setUserActivity] = useState<UserActivity | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadUserActivity = async () => {
      try {
        const data = await getUserActivity()
        setUserActivity(data)
      } catch (err) {
        console.error("Failed to load user activity", err)
      } finally {
        setLoading(false)
      }
    }

    loadUserActivity()
  }, [])

  if (loading) {
    return <p className="text-center text-muted-foreground">Loading...</p>
  }

  if (!userActivity) {
    return <p className="text-center text-destructive">No user activity found.</p>
  }

  // Build stats dynamically based on fetched data
  const stats = [
    {
      title: "Total Quizzes",
      value: userActivity.totalQuizzes.toString(),
      icon: Trophy,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      title: "Average Score",
      value: `${Math.round(userActivity.averageScore)}%`,
      icon: Target,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
      progress: Math.round(userActivity.averageScore),
    },
    {
      title: "Completed",
      value: `${userActivity.completed} / ${userActivity.totalQuizzes}`,
      icon: CheckCircle2,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
    },
    {
      title: "Leaderboard",
      value: `#${userActivity.leaderboard}`,
      icon: TrendingUp,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat) => (
        <Card
          key={stat.title}
          className="p-6 border-border/50 bg-card/50 backdrop-blur hover:border-primary/30 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-2">{stat.title}</p>
              <p className="text-3xl font-bold text-foreground">{stat.value}</p>
              {stat.progress !== undefined && <Progress value={stat.progress} className="mt-3 h-2" />}
            </div>
            <div className={`${stat.bgColor} ${stat.color} p-3 rounded-lg`}>
              <stat.icon className="h-5 w-5" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
