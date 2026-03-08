"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { QuizQuestion } from "@/components/quiz-question"
import { QuizResultModal } from "@/components/quiz-result-modal"
import { Clock, CheckCircle2 } from "lucide-react"
import { getQuestion } from "@/services/question.service"
import { getQuizById, submitQuiz } from "@/services/quiz.service"
import toast from "react-hot-toast"


export type Type = "SINGLE" | "MULTIPLE"

interface Quiz {
  id: number
  timeLimit: number // minutes
  passPercentage: number
}

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

interface SubmitAnswerPayload {
  timeTaken: number
  answers: {
    questionId: number
    selectedOptionIds: number[]
  }[]
}

export default function QuestionPage() {
  const { quizId } = useParams<{ quizId: string }>()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<(number | null)[]>(Array(questions.length).fill(null))
  const [timeRemaining, setTimeRemaining] = useState(600) // 10 minutes in seconds
  const [isQuizComplete, setIsQuizComplete] = useState(false)
  const [startTime] = useState(Date.now())
  const [timeTaken, setTimeTaken] = useState(0)

    useEffect(() => {
      if (!quizId) return
  
      const loadQuiz = async () => {
        try {
          const [questionData, quizData] = await Promise.all([
            getQuestion(Number(quizId)),
            getQuizById(Number(quizId)),
          ])
          setQuestions(questionData)
          setQuiz(quizData)
          setAnswers(new Array(questionData.length).fill(null))
          setTimeRemaining(quizData.timeLimit * 60)
        } catch (err) {
          console.error("Failed to load quiz", err)
        } 
      }
  
      loadQuiz()
    }, [quizId])

  // Timer countdown
  useEffect(() => {
    if (timeRemaining <= 0) {
      handleSubmit()
      return
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => prev - 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [timeRemaining])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = answerIndex
    setAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) setCurrentQuestion(currentQuestion + 1)
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmit = async () => {
     const unanswered = answers.findIndex((ans) => ans === null)

    if (timeRemaining <= 0) {
      toast.error("Time is up!")
      return
    }

    if (unanswered !== -1) {
      toast.error("Please answer all questions")
      setCurrentQuestion(unanswered) // optionally jump to first unanswered question
      return
    }

    const totalTime = Math.floor((Date.now() - startTime) / 1000)

     const payload: SubmitAnswerPayload = {
      timeTaken: totalTime,
      answers: questions.map((q, index) => {
        const selectedIndex = answers[index]!
        return {
          questionId: q.id,
          selectedOptionIds: [q.options[selectedIndex].id],
        }
      }),
    }

    try {
      await submitQuiz(Number(quizId), payload)
      setTimeTaken(totalTime)
      setIsQuizComplete(true)
    } catch (err) {
      console.error(err)
      toast.error("Failed to submit quiz")
    }
  }

  const calculateScore = () => {
    let correct = 0
    answers.forEach((answer, index) => {
      if (answer !== null && questions[index].options[answer]?.correct) correct++
    })
    return correct
  }

  const handleRetry = () => {
    setCurrentQuestion(0)
    setAnswers(new Array(questions.length).fill(null))
    setTimeRemaining(quiz?.timeLimit! * 60)
    setIsQuizComplete(false)
  }

  const answeredCount = answers.filter((a) => a !== null).length
  const isLowTime = timeRemaining <= 60

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">QuizHub</h1>
          <p className="text-muted-foreground">Test your knowledge</p>
        </div>

        {/* Quiz Card */}
        <div className="bg-card rounded-xl border border-border shadow-lg p-6 md:p-8">
          {/* Timer and Progress */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-border">
            <div className="flex items-center gap-2">
              <Clock className={`w-5 h-5 ${isLowTime ? "text-destructive animate-pulse" : "text-primary"}`} />
              <span className={`text-xl font-mono font-semibold ${isLowTime ? "text-destructive" : "text-foreground"}`}>
                {formatTime(timeRemaining)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-accent" />
              <span className="text-muted-foreground">
                Answered <span className="text-foreground font-semibold">{answeredCount}</span> / {questions.length}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Progress</span>
              <span className="text-sm text-foreground font-medium">
                {Math.round((answeredCount / questions.length) * 100)}%
              </span>
            </div>
            <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300 ease-out"
                style={{ width: `${(answeredCount / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <QuizQuestion
            question={questions[currentQuestion]}
            questionNumber={currentQuestion + 1}
            totalQuestions={questions.length}
            selectedAnswer={answers[currentQuestion]}
            onAnswerSelect={handleAnswerSelect}
            disabled={timeRemaining <= 0}
          />

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t border-border">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0 || timeRemaining <= 0}
              className="px-6 py-2.5 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              Previous
            </button>

            {currentQuestion === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={timeRemaining <= 0}
                className="px-8 py-2.5 rounded-lg bg-gradient-to-r from-primary to-accent text-primary-foreground hover:opacity-90 transition-opacity font-semibold shadow-lg"
              >
                Submit Quiz
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={timeRemaining <= 0}
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
                disabled={timeRemaining <= 0}
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

      {/* Result Modal */}
      {isQuizComplete && (
        <QuizResultModal
          score={calculateScore()}
          totalQuestions={questions.length}
          timeTaken={timeTaken}
          passPercentage={quiz?.passPercentage ?? 0}
          onRetry={handleRetry}
        />
      )}
    </div>
  )
}
