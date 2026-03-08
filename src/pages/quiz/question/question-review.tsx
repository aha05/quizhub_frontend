import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { QuizQuestion } from "@/components/review-quiz"
import { Clock, CheckCircle2 } from "lucide-react"
import { getQuestion } from "@/services/question.service"
import { getQuizById } from "@/services/quiz.service"
import { getHistoryById} from "@/services/activity.service"


export type Type = "SINGLE" | "MULTIPLE"

interface Option {
  id: number
  text: string
  correct: boolean
}

interface Question {
  id: number
  content: string
  type: Type
  options: Option[]
}

interface Answer {
  questionId: number
  selectedOptionIds: number[]
}

interface HistoryItem  {
  id: number
   quizId: number
   quizTitle: string
   totalQuestions: number
   correctAnswers: number
   scorePercentage: number
   quizCategory: string
   passed: boolean
   submittedAt: string 
   timeTaken: string
   answers: Answer[]
}


export default function ReviewQuestionPage() {
  const { quizId, id } = useParams<{ quizId: string, id: string }>()
  const [questions, setQuestions] = useState<Question[]>([])
  const [quizHistory, setQuizHistory] = useState<HistoryItem>()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null))
  const [timeRemaining, setTimeRemaining] = useState(600) // 10 minutes in seconds
  const [answerMap, setAnswerMap] = useState<Map<number, number[]>>(new Map())

    useEffect(() => {
      if (!quizId) return
  
      const loadQuiz = async () => {
        try {
          const [questionData, quizData, quizHistoryData] = await Promise.all([
            getQuestion(Number(quizId)),
            getQuizById(Number(quizId)),
            getHistoryById(Number(id))
          ])
          setQuestions(questionData)
          setQuizHistory(quizHistoryData)
          setAnswers(new Array(questionData.length).fill(null))
          setTimeRemaining(quizData.timeLimit * 60)
        } catch (err) {
          console.error("Failed to load quiz", err)
        } 
      }
  
      loadQuiz()
    }, [quizId])

useEffect(() => {
  if (!quizHistory?.answers) return

  const map = new Map<number, number[]>()
  quizHistory.answers.forEach(a => {
    map.set(a.questionId, a.selectedOptionIds)
  })

  setAnswerMap(map)
  }, [quizHistory])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) setCurrentQuestion(currentQuestion + 1)
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const question = questions[currentQuestion]
  const selectedOptionIds = answerMap.get(question?.id) ?? []
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">QuizHub</h1>
          <p className="text-muted-foreground">Review your submitted answers</p>
        </div>

        {/* Quiz Card */}
        <div className="bg-card rounded-xl border border-border shadow-lg p-6 md:p-8">
          {/* Timer and Progress */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-border">
            <div className="flex items-center gap-2">
              <Clock className={`w-5 h-5 text-primary`} />
              <span className={`text-xl font-mono font-semibold text-foreground`}>
                {formatTime(Number(quizHistory?.timeTaken))}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-accent" />
              <span className="text-muted-foreground">
                Answered <span className="text-foreground font-semibold">{quizHistory?.correctAnswers}</span> / {questions.length}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Progress</span>
              <span className="text-sm text-foreground font-medium">
                {Math.round(((quizHistory?.correctAnswers ?? 0) / questions.length) * 100)}%
              </span>
            </div>
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 ease-out"
                style={{ width: `${((quizHistory?.correctAnswers ?? 0) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <QuizQuestion
            question={questions[currentQuestion]}
            questionNumber={currentQuestion + 1}
            totalQuestions={questions.length}
            selectedOptionIds={selectedOptionIds}
            disabled={timeRemaining <= 0}
          />

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
            <button
              onClick={handlePrevious}
              className="px-6 py-2.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Previous
            </button>

            {currentQuestion === questions.length - 1 ? (
              <></>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
              >
                Next
              </button>
            )}
          </div>
        </div>

        {/* Question Navigator */}
        <div className="mt-6 bg-card rounded-xl border border-border shadow-lg p-4">
          <p className="text-sm text-muted-foreground mb-3">Quick Navigation</p>
          <div className="flex flex-wrap gap-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-10 h-10 rounded-lg font-medium transition-all ${
                  currentQuestion === index
                    ? "bg-primary text-primary-foreground shadow-lg scale-110"
                    : answers[index] !== null
                      ? "bg-accent text-accent-foreground"
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
