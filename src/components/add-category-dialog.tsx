import { useState } from "react"
import { Button }  from "@/components/ui/button"
import { createCategory } from "@/services/quiz.service"
import toast from "react-hot-toast"

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


interface CategoryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface CategoryFormData {
  name: string
  description?: string
}

export function AddCategoryDialog({
  open,
  onOpenChange,
}: CategoryDialogProps) {
  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    description: "",
  })

  const [loading, setLoading] = useState(false)


  const handleSubmit = async () => {
    if (!formData.name.trim()) {
      toast.error("Category name is required")
      return
    }

    try {
      setLoading(true)

      await createCategory({
        name: formData.name,
        description: formData?.description ?? "",
      })

      toast.success("Category added successfully")
      onOpenChange(false)
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Failed to add category"
      )
      console.error("Create category error:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {"Create New Category"}
          </DialogTitle>
          <DialogDescription>
            Fill in the category details below
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter category name"
              disabled={loading}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Enter category description"
              rows={3}
              disabled={loading}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
