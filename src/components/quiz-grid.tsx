"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  Play,
  Clock,
  BookOpen,
  Brain,
  Code,
  Globe,
  Lightbulb,
} from "lucide-react"

import { getQuiz, getCategory } from "@/services/quiz.service"

type Difficulty = "EASY" | "MEDIUM" | "HARD"
type Status = "ACTIVE" | "INACTIVE"

interface Category {
  id: number
  name: string
}

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

const difficultyColors: Record<Difficulty, string> = {
  EASY: "bg-chart-3/20 text-chart-3 border-chart-3/30",
  MEDIUM: "bg-chart-1/20 text-chart-1 border-chart-1/30",
  HARD: "bg-destructive/20 text-destructive border-destructive/30",
}

const getCategoryStyle = (categoryName: string) => {
  switch (categoryName) {
    case "Programming":
      return { icon: Code, color: "text-chart-1", bg: "bg-chart-1/10" }
    case "Geography":
      return { icon: Globe, color: "text-chart-2", bg: "bg-chart-2/10" }
    case "Science":
      return { icon: Lightbulb, color: "text-chart-3", bg: "bg-chart-3/10" }
    case "History":
      return { icon: BookOpen, color: "text-chart-5", bg: "bg-chart-5/10" }
    case "Logic":
      return { icon: Brain, color: "text-primary", bg: "bg-primary/10" }
    default:
      return { icon: BookOpen, color: "text-muted-foreground", bg: "bg-muted/10" }
  }
}

export function QuizGrid() {
  const navigate = useNavigate()

  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [difficultyFilter, setDifficultyFilter] = useState("all")

  useEffect(() => {
    const loadData = async () => {
      try {
        const [quizData, categoryData] = await Promise.all([
          getQuiz(),
          getCategory(),
        ])
        setQuizzes(quizData)
        setCategories(categoryData)
      } catch (err) {
        console.error("Failed to load quiz data", err)
      }
    }
    loadData()
  }, [])

  const filteredQuizzes = quizzes.filter((quiz) => {
    const categoryMatch =
      categoryFilter === "all" || quiz.category.name === categoryFilter

    const difficultyMatch =
      difficultyFilter === "all" || quiz.difficulty === difficultyFilter

    return categoryMatch && difficultyMatch
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <h2 className="text-2xl font-bold">Available Quizzes</h2>

        <div className="flex gap-3 flex-wrap">
          {/* Category Filter */}
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.name}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              <SelectItem value="EASY">Easy</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HARD">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredQuizzes.map((quiz) => {
          const { icon: Icon, color, bg } = getCategoryStyle(
            quiz.category.name
          )

          return (
            <Card
              key={quiz.id}
              className="p-6 border-border/50 hover:shadow-lg transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`${bg} ${color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6" />
                </div>

                <Badge
                  variant="secondary"
                  className={difficultyColors[quiz.difficulty]}
                >
                  {quiz.difficulty}
                </Badge>
              </div>

              <h3 className="text-xl font-bold mb-2 group-hover:text-primary">
                {quiz.title}
              </h3>

              <p className="text-sm text-muted-foreground mb-4">
                {quiz.description}
              </p>

              <div className="flex items-center justify-between text-sm mb-4">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {quiz.questions} questions
                </div>

                <Badge variant="outline">{quiz.category.name}</Badge>
              </div>

              <Button
                className="w-full flex gap-2"
                onClick={() => navigate(`/quiz/${quiz.id}`)}
              >
                <Play className="h-4 w-4" />
                Start Quiz
              </Button>
            </Card>
          )
        })}
      </div>

      {filteredQuizzes.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No quizzes found matching your filters.
        </div>
      )}
    </div>
  )
}
