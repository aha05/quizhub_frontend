"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Shield } from "lucide-react"
import toast from "react-hot-toast"
import { updateUserRole } from "@/services/user.service"

interface User {
  id: number
  name: string
  email: string
  role: "ADMIN" | "USER"
}

interface ChangeRoleDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User
}

export function ChangeRoleDialog({
  open,
  onOpenChange,
  user,
}: ChangeRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState<"ADMIN" | "USER">(user.role)
  const [loading, setLoading] = useState(false)

  // Sync role when dialog opens or user changes
  useEffect(() => {
    if (open) {
      setSelectedRole(user.role)
    }
  }, [open, user.role])

  const handleSubmit = async () => {
    if (selectedRole === user.role) {
      toast.error("No role change detected")
      return
    }

    try {
      setLoading(true)

      await updateUserRole(user.id, selectedRole)

      toast.success("User role updated successfully")
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err?.message || "Failed to update user role")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle>Change User Role</DialogTitle>
          </div>
          <DialogDescription className="pt-2">
            Update the role for{" "}
            <span className="font-semibold text-foreground">
              {user.name}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label>Role</Label>
            <Select
              value={selectedRole}
              onValueChange={(value) =>
                setSelectedRole(value as "ADMIN" | "USER")
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ADMIN">Admin</SelectItem>
                <SelectItem value="USER">User</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-lg border border-border bg-muted/50 p-3 text-sm">
            <p className="mb-2 font-medium">Role Permissions:</p>
            <ul className="space-y-1 text-muted-foreground">
              {selectedRole === "ADMIN" && (
                <>
                  <li>• Full access to all features</li>
                  <li>• Manage users and roles</li>
                  <li>• Create and delete quizzes</li>
                </>
              )}
              {selectedRole === "USER" && (
                <>
                  <li>• Take quizzes</li>
                  <li>• View own statistics</li>
                  <li>• View leaderboards</li>
                </>
              )}
            </ul>
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
            {loading ? "Updating..." : "Update Role"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
