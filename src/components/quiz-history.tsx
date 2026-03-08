"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, CheckCircle, XCircle } from "lucide-react"
import { getHistory } from "@/services/activity.service"



type HistoryItem = {
  id: number
  quizId: number
  quizTitle: string
  quizCategory: string
  scorePercentage: number
  correctAnswers: number
  totalQuestions: number
  submittedAt: string
  passed: boolean
}

export function QuizHistory() {
    const [history, setHistory] = useState<HistoryItem[]>([])

      useEffect(() => {  
      const loadQuiz = async () => {
        try {
          const historyData = await getHistory()
          setHistory(historyData)
        } catch (err) {
          console.error("Failed to load quiz history", err)
        } 
      }
  
      loadQuiz()
    }, [])

    function formatDate(dateString: string): string {
        const date = new Date(dateString)
        return date.toISOString().slice(0, 10)
    }

  return (
    <div>
      <h2 className="text-2xl font-bold text-balance mb-6">Quiz History</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {history.map((item) => (
          <Card
            key={item.id}
            className="p-6 border-border/50 bg-card/50 backdrop-blur hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/5 group"
          >
            <div className="flex items-center justify-between mb-4">
              <Badge
                variant={item.passed  ? "default" : "destructive"}
                className="px-2 py-0.5"
              >
                {item.passed  ? <CheckCircle className="h-4 w-4 mr-1" /> : <XCircle className="h-4 w-4 mr-1" />}
                {item.passed ? "Passed": "Failed"}
              </Badge>
              <Badge variant="outline" className="border-border/50">
                {item.quizCategory}
              </Badge>
            </div>

            <h3 className="text-xl font-bold mb-2 text-balance group-hover:text-primary transition-colors">
              {item.quizTitle}
            </h3>

            <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>
                  {item.correctAnswers}/{item.totalQuestions} questions correct
                </span>
              </div>
              <span className="text-sm text-muted-foreground">{formatDate(item.submittedAt)}</span>
            </div>

            <Link to={`/quiz/${item.quizId}/history/${item.id}`}>
              <button className="w-full gap-2 bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-md">
                Review Quiz
              </button>
            </Link>
          </Card>
        ))}
      </div>

      {history.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-lg">No quiz history found.</p>
        </div>
      )}
    </div>
  )
}
