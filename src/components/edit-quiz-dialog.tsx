import { useEffect, useState } from "react"
import toast from "react-hot-toast"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { updateQuiz, getCategory } from "@/services/quiz.service"

type Difficulty = "EASY" | "MEDIUM" | "HARD"
type Status = "ACTIVE" | "INACTIVE"


interface Category {
  id: number
  name: string
}

interface Quiz {
  id: number
  title: string
  description?: string
  category: Category
  difficulty: Difficulty
  status: Status
  timeLimit: number
  passPercentage: number
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  quiz: Quiz | null
  onUpdated?: () => void
}

export function EditQuizDialog({
  open,
  onOpenChange,
  quiz,
  onUpdated,
}: Props) {
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])

  const [form, setForm] = useState({
    title: "",
    description: "",
    categoryId: 0,
    difficulty: "EASY" as Difficulty,
    status: "ACTIVE" as Status,
    timeLimit: 1,
    passPercentage: 70,
  })

  /* 🔹 Load categories when dialog opens */
  useEffect(() => {
    if (!open) return

    const loadCategories = async () => {
      try {
        const data = await getCategory()
        setCategories(data)
      } catch (err) {
        toast.error("Failed to load categories")
        console.error(err)
      }
    }

    loadCategories()
  }, [open])

  /* 🔹 Populate form AFTER quiz + categories are ready */
  useEffect(() => {
    if (!quiz || categories.length === 0) return

    setForm({
      title: quiz.title,
      description: quiz.description ?? "",
      categoryId: quiz.category.id,
      difficulty: quiz.difficulty,
      status: quiz.status,
      timeLimit: quiz.timeLimit,
      passPercentage: quiz.passPercentage
    })
  }, [quiz, categories])

  const handleSubmit = async () => {
    if (!quiz) return

    try {
      setLoading(true)

      await updateQuiz(quiz.id, {
        title: form.title,
        description: form.description,
        categoryId: form.categoryId,
        difficulty: form.difficulty,
        status: form.status,
        timeLimit: form.timeLimit,
        passPercentage: form.passPercentage
      })

      toast.success("Quiz updated successfully")
      onUpdated?.()
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Update failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Quiz</DialogTitle>
          <DialogDescription>
            Update quiz information
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Title */}
          <div className="grid gap-2">
            <Label>Quiz Title</Label>
            <Input
              value={form.title}
              onChange={(e) =>
                setForm({ ...form, title: e.target.value })
              }
            />
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label>Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              rows={3}
            />
          </div>

          {/* Category / Difficulty / Time */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label>Category</Label>
              <Select
                value={String(form.categoryId)}
                onValueChange={(v) =>
                  setForm({ ...form, categoryId: Number(v) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem
                      key={cat.id}
                      value={String(cat.id)}
                    >
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Difficulty</Label>
              <Select
                value={form.difficulty}
                onValueChange={(v) =>
                  setForm({ ...form, difficulty: v as Difficulty })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EASY">Easy</SelectItem>
                  <SelectItem value="MEDIUM">Medium</SelectItem>
                  <SelectItem value="HARD">Hard</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Time Limit (minutes)</Label>
              <Input
                type="number"
                min={1}
                max={180}
                value={form.timeLimit}
                onChange={(e) =>
                  setForm({
                    ...form,
                    timeLimit: Number(e.target.value),
                  })
                }
              />
            </div>
          </div>

          {/* Status */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="grid gap-2">
              <Label>Status</Label>
              <Select
                value={form.status}
                onValueChange={(v) =>
                  setForm({ ...form, status: v as Status })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ACTIVE">Active</SelectItem>
                  <SelectItem value="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
                <Label>Pass Percentage</Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={form.passPercentage}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      passPercentage: Number(e.target.value),
                    })
                  }
                />
            </div>
          </div>

        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Update Quiz"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
