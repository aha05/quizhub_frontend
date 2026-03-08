"use client"

import { useEffect, useState } from "react"
import { Link, useParams } from "react-router-dom"
import toast from "react-hot-toast"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  Pencil,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  Circle,
} from "lucide-react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import { QuestionDialog } from "@/components/question-dialog"
import { getQuestion, deleteQuestion } from "@/services/question.service"

interface Option {
  id: number
  text: string
  correct: boolean
}

interface Question {
  id: number
  content: string
  type: "SINGLE" | "MULTIPLE"
  options: Option[]
}

export function QuestionManager() {
  const { quizId } = useParams<{ quizId: string }>()

  const [questions, setQuestions] = useState<Question[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null)

  /** Load questions */
  useEffect(() => {
    if (!quizId) return

    const loadQuestions = async () => {
      try {
        const data = await getQuestion(Number(quizId))
        console.log(data)
        setQuestions(data)
      } catch (error) {
        toast.error("Failed to load questions")
        console.error(error)
      }
    }

    loadQuestions()
  }, [quizId])

  const handleCreate = () => {
    setEditingQuestion(null)
    setDialogOpen(true)
  }

  const handleEdit = (question: Question) => {
    setEditingQuestion(question)
    setDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteQuestion(id)
      setQuestions(prev => prev.filter(q => q.id !== id))
      toast.success("Question deleted")
    } catch (error) {
      toast.error("Failed to delete question")
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link to="/quizzes">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>

        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">
            Question Management
          </h1>
          <p className="text-muted-foreground">
            Manage quiz questions and answers
          </p>
        </div>

        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Add Question
        </Button>
      </div>

      {/* Question List */}
      <Card>
        <CardHeader>
          <CardTitle>Questions ({questions.length})</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {questions.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No questions added yet.
            </p>
          )}

          <Accordion type="single" collapsible className="space-y-2">
            {questions.map((question, index) => (
              <AccordionItem
                key={question.id}
                value={`question-${question.id}`}
                className="rounded-lg border px-4"
              >
                <AccordionTrigger className="hover:no-underline">
                  <div className="flex gap-4 text-left">
                    <Badge variant="secondary">Q{index + 1}</Badge>

                    <div className="flex-1">
                      <p className="font-medium">{question.content}</p>
                      <div className="flex gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {question.type === "SINGLE"
                            ? "Single Choice"
                            : "Multiple Choice"}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {question.options.length} Options
                        </Badge>
                      </div>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="pt-4 space-y-3">
                  <p className="text-sm font-medium text-muted-foreground">
                    Options
                  </p>

                  {question.options.map((option, i) => (
                    <div
                      key={option.id}
                      className={`flex items-start gap-3 rounded-lg border p-3 ${
                        option.correct
                          ? "border-accent bg-accent/10"
                          : ""
                      }`}
                    >
                      {option.correct ? (
                        <CheckCircle2 className="h-5 w-5 text-accent" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}

                      <div className="flex-1">
                        <span className="mr-2 text-sm font-medium text-muted-foreground">
                          {String.fromCharCode(65 + i)}.
                        </span>
                        {option.text}
                      </div>

                      {option.correct && (
                        <Badge
                          variant="outline"
                          className="border-accent text-accent"
                        >
                          Correct
                        </Badge>
                      )}
                    </div>
                  ))}

                  <div className="flex justify-end gap-2 pt-3 border-t">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(question)}
                    >
                      <Pencil className="mr-2 h-3 w-3" />
                      Edit
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(question.id)}
                    >
                      <Trash2 className="mr-2 h-3 w-3 text-destructive" />
                      Delete
                    </Button>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Dialog */}
      <QuestionDialog
        open={dialogOpen}
        quizId={Number(quizId)}
        question={editingQuestion}
        onOpenChange={setDialogOpen}
        onSave={() => {
          setDialogOpen(false)
        }}
      />
    </div>
  )
}
