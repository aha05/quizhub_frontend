import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

export type Type = "SINGLE" | "MULTIPLE"
export type Status = "ACTIVE" | "INACTIVE"

interface Option {
  id: number
  text: string
  correct: boolean
}

interface QuizQuestionProps {
  question: {
    id: number
    content: string
    type: Type
    options: Option[]
  }
  questionNumber: number
  totalQuestions: number
  selectedOptionIds: number[] 
  disabled?: boolean
}

export function QuizQuestion({
  question,
  questionNumber,
  totalQuestions,
  selectedOptionIds,
  disabled,
}: QuizQuestionProps) {  
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-accent font-semibold mb-2">
          Question {questionNumber} of {totalQuestions}
        </p>
        <h2 className="text-2xl font-bold text-foreground leading-relaxed">{question?.content}</h2>
      </div>

      <RadioGroup
        className="space-y-3"
      >
        {question?.options?.map((option:any, index:any) => {
          const isSelected = selectedOptionIds.includes(option?.id)
          const isCorrect = option?.correct

          const borderColor = isSelected
            ? isCorrect
              ? "border-green-300 bg-green-50/10"
              : "border-red-300 bg-red-50/10"
            : isCorrect
              ? "border-green-300 bg-green-50/10"
              : "border-border bg-card"
        return (
          <div
            key={option.id}
            className={`relative flex items-center space-x-3 rounded-lg border-2 p-4 transition-all ${borderColor}`}
          >
            <RadioGroupItem  value={option?.id.toString()}
                    checked={isSelected}
                    disabled={disabled} 
                    className="shrink-0" />
            <Label htmlFor={`option-${question.id}-${index}`} className="flex-1 cursor-pointer text-base font-medium text-foreground">
              {option.text} 
            </Label>
            {isCorrect && (
                <span className="text-xs font-semibold text-green-700">
                  Correct
                </span>
              )}
              {isSelected && !isCorrect && (
                <span className="text-xs font-semibold text-red-700">
                  Your Answer
                </span>
              )}
          </div>
          )
        })}
      </RadioGroup>
    </div>
  )
}
