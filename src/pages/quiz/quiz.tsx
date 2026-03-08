"use client"

import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Brain, Clock, Target } from "lucide-react"
import { getQuizById } from "@/services/quiz.service"


interface Category {
  id: number  
  name: string
  description?: string
}

type Difficulty = "EASY" | "MEDIUM" | "HARD"
type Status = "ACTIVE" | "INACTIVE"

interface Quiz {
    id: number 
    title: string 
    description: string 
    category: Category 
    difficulty: Difficulty 
    status: Status
    questions: number
    timeLimit: number
    passPercentage: number
}

export default function QuizPage() {
  const { quizId } = useParams<{ quizId: string }>()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!quizId) return

    const loadQuiz = async () => {
      try {
        const quizData = await getQuizById(Number(quizId))
        setQuiz(quizData)
      } catch (err) {
        console.error("Failed to load quiz data", err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }

    loadQuiz()
  }, [quizId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Loading quiz...
      </div>
    )
  }

  if (error || !quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center text-destructive">
        Failed to load quiz.
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            QuizHub
          </h1>
          <p className="text-xl text-muted-foreground">
            Challenge yourself with engaging quizzes
          </p>
        </div>

        {/* Quiz Card */}
        <div className="bg-card rounded-2xl border border-border shadow-xl p-8 md:p-12 mb-8">
          <h2 className="text-2xl font-bold mb-1">
            {quiz.title}
          </h2>
          <p className="mb-6 text-gray-300">{quiz.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-secondary rounded-lg p-4">
              <Brain className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {quiz.questions} Questions
              </p>
            </div>

            <div className="bg-secondary rounded-lg p-4">
              <Clock className="w-8 h-8 text-accent mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {quiz.timeLimit} Minutes
              </p>
            </div>

            <div className="bg-secondary rounded-lg p-4">
              <Target className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {quiz.passPercentage}% to Pass
              </p>
            </div>
          </div>

          <Link to={`/quiz/${quiz.id}/questions`}>
            <Button className="w-full md:w-auto px-12 py-6 text-lg font-semibold bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 shadow-lg">
              Start Quiz
            </Button>
          </Link>
        </div>

        <p className="text-sm text-muted-foreground">
          Navigate through questions, track your progress, and see your results instantly
        </p>
      </div>
    </div>
  )
}
