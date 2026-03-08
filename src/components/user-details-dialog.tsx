import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Trophy, Target, TrendingUp } from "lucide-react"

type UserRole = "ADMIN" | "USER"
type UserStatus = "ACTIVE" | "DISABLED"

interface User {
  id: number
  name: string
  email: string
  role: UserRole
  status: UserStatus
  avatar?: string
  quizzesAttempted: number
  highestScore: number
}

interface UserDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User
}

const quizHistory = [
  { quiz: "JavaScript Fundamentals", score: 95, date: "2025-12-18", time: "14:30" },
  { quiz: "React Advanced Patterns", score: 88, date: "2025-12-17", time: "10:15" },
  { quiz: "TypeScript Essentials", score: 92, date: "2025-12-15", time: "16:45" },
  { quiz: "Python for Data Science", score: 78, date: "2025-12-14", time: "09:20" },
  { quiz: "World Geography", score: 85, date: "2025-12-12", time: "11:00" },
]

export function UserDetailsDialog({ open, onOpenChange, user }: UserDetailsDialogProps) {
  const avgScore = Math.round(quizHistory.reduce((acc, q) => acc + q.score, 0) / quizHistory.length)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{user.name}</DialogTitle>
          <DialogDescription>{user.email}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Quizzes Attempted</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{user.quizzesAttempted}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Highest Score</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{user.highestScore}%</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Average Score</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{avgScore}%</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Member Since</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">Dec 2024</div>
              </CardContent>
            </Card>
          </div>

          {/* Quiz History */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Quiz History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {quizHistory.map((quiz, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-2 border-b border-border last:border-0"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{quiz.quiz}</p>
                      <p className="text-xs text-muted-foreground">
                        {quiz.date} at {quiz.time}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={
                        quiz.score >= 90
                          ? "bg-chart-2/20 text-chart-2"
                          : quiz.score >= 70
                            ? "bg-chart-3/20 text-chart-3"
                            : "bg-muted text-muted-foreground"
                      }
                    >
                      {quiz.score}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
