import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, X } from "lucide-react"

import {
  createQuestion,
  updateQuestion,
  createOption,
  updateOption,
  deleteOption,
} from "@/services/question.service"

/* ===================== TYPES ===================== */

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

interface QuestionDialogProps {
  open: boolean
  quizId: number
  question?: Question | null
  onOpenChange: (open: boolean) => void
  onSave: () => void
}

export function QuestionDialog({
  open,
  quizId,
  question,
  onOpenChange,
  onSave,
}: QuestionDialogProps) {
  const [questionText, setQuestionText] = useState("")
  const [questionType, setQuestionType] =
    useState<"SINGLE" | "MULTIPLE">("SINGLE")
  const [options, setOptions] = useState<Option[]>([])

  /* ---------- INIT ---------- */

  useEffect(() => {
    if (question) {
      setQuestionText(question.content)
      setQuestionType(question.type)
      setOptions(
        question.options.map((o, index) => ({
          ...o,
          tempId: index + 1,
        }))
      )
    } else {
      resetForm()
    }
  }, [question])

  const resetForm = () => {
    setQuestionText("")
    setQuestionType("SINGLE")
    setOptions([
      { id: 1, text: "", correct: false },
      { id: 2, text: "", correct: false },
    ])
  }

  /* ---------- OPTION HELPERS ---------- */

  const addOption = () => {
    setOptions(prev => [
      ...prev,
      {
        id: Math.max(...prev.map(o => o.id)) + 1,
        text: "",
        correct: false,
      },
    ])
  }

  const removeOption = async (tempId: number) => {
    if (options.length <= 2) return

    const option = options.find(o => o.id === tempId)

    // delete from backend if already exists
    if (option?.id) {
      await deleteOption(question?.id ?? 0, option.id)
    }

    setOptions(prev => prev.filter(o => o.id !== tempId))
  }

  const updateOptionText = (tempId: number, text: string) => {
    setOptions(prev =>
      prev.map(o => (o.id === tempId ? { ...o, text } : o))
    )
  }

  const toggleCorrect = (tempId: number) => {
    setOptions(prev =>
      questionType === "SINGLE"
        ? prev.map(o => ({ ...o, correct: o.id === tempId }))
        : prev.map(o =>
            o.id === tempId
              ? { ...o, correct: !o.correct }
              : o
          )
    )
  }

  /* ---------- SUBMIT ---------- */

  const handleSubmit = async () => {
    if (!questionText.trim()) return alert("Question is required")
    if (options.some(o => !o.text.trim())) return alert("Fill all options")
    if (!options.some(o => o.correct))
      return alert("Select at least one correct answer")

    let questionId: number

    /* ----- CREATE ----- */
    if (!question) {
      const created = await createQuestion(quizId, {
        content: questionText,
        type: questionType,
      })

      questionId = created.id

      for (const o of options) {
        await createOption(questionId, {
          text: o.text,
          correct: o.correct,
        })
      }
    }

    /* ----- UPDATE ----- */
    else {
      questionId = question.id

      await updateQuestion(questionId, {
        content: questionText,
        type: questionType,
      })

      for (const o of options) {
        if (o.id) {
          // existing option
          await updateOption(questionId, o.id, {
            text: o.text,
            correct: o.correct,
          })
        } else {
          // newly added option
          await createOption(questionId, {
            text: o.text,
            correct: o.correct,
          })
        }
      }
    }

    onSave()
    onOpenChange(false)
    resetForm()
  }

  /* ===================== UI ===================== */

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {question ? "Edit Question" : "Add Question"}
          </DialogTitle>
          <DialogDescription>
            Enter the question and its options
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* QUESTION */}
          <div>
            <Label className="mb-3">Question</Label>
            <Textarea
              rows={3}
              value={questionText}
              onChange={e => setQuestionText(e.target.value)}
            />
          </div>

          {/* TYPE */}
          <RadioGroup
            value={questionType}
            onValueChange={v =>
              setQuestionType(v as "SINGLE" | "MULTIPLE")
            }
            className="flex gap-6"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="SINGLE" />
              <Label>Single Choice</Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="MULTIPLE" />
              <Label>Multiple Choice</Label>
            </div>
          </RadioGroup>

          {/* OPTIONS */}
          <div className="space-y-3">
            <div className="flex justify-between">
              <Label>Options</Label>
              <Button size="sm" variant="outline" onClick={addOption}>
                <Plus className="h-4 w-4 mr-1" />
                Add Option
              </Button>
            </div>

            {/* SINGLE */}
            {questionType === "SINGLE" && (
              <RadioGroup
                value={options.find(o => o.correct)?.id.toString()}
                onValueChange={v => toggleCorrect(Number(v))}
                className="space-y-2"
              >
                {options.map((o, i) => (
                  <div key={o.id} className="flex items-center gap-2">
                    <RadioGroupItem value={o.id.toString()} />
                    <Input
                      value={o.text}
                      onChange={e =>
                        updateOptionText(o.id, e.target.value)
                      }
                      placeholder={`Option ${String.fromCharCode(65 + i)}`}
                    />
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeOption(o.id)}
                      disabled={options.length <= 2}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </RadioGroup>
            )}

            {/* MULTIPLE */}
            {questionType === "MULTIPLE" &&
              options.map((o, i) => (
                <div key={o.id} className="flex items-center gap-2">
                  <Checkbox
                    checked={o.correct}
                    onCheckedChange={() => toggleCorrect(o.id)}
                  />
                  <Input
                    value={o.text}
                    onChange={e =>
                      updateOptionText(o.id, e.target.value)
                    }
                    placeholder={`Option ${String.fromCharCode(65 + i)}`}
                  />
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => removeOption(o.id)}
                    disabled={options.length <= 2}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {question ? "Update" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
