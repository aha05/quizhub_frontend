"use client"

import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import {
  Card, CardContent, CardHeader, CardTitle
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import {
  Search, MoreHorizontal, Shield, Ban, Eye,
  UsersIcon, UserCheck, UserX
} from "lucide-react"
import {
  Avatar, AvatarFallback, AvatarImage
} from "@/components/ui/avatar"

import { ChangeRoleDialog } from "@/components/change-role-dialog"
import { UserDetailsDialog } from "@/components/user-details-dialog"
import {
  getUser, getUserStats, updateUserStatus
} from "@/services/user.service"


type UserRole = "ADMIN" | "USER"
type UserStatus = "ACTIVE" | "DISABLED"

interface User {
  id: number
  name: string
  email: string
  role: UserRole
  status: UserStatus
  avatar?: string
  quizzesAttempted: number
  highestScore: number
}

/* ---------------- COMPONENT ---------------- */

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)

  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  /* ---------------- DATA LOAD ---------------- */

  useEffect(() => {
    async function loadUsers() {
      try {
        setLoading(true)

        const userList = await getUser()

        const enrichedUsers: User[] = await Promise.all(
          userList.map(async (u: any) => {
            const stats = await getUserStats(u.id)

            return {
              id: u.id,
              name: u.name,
              email: u.email,
              role: u.role,
              status: u.status,
              avatar: u.avatar,
              quizzesAttempted: stats?.quizzesAttempted ?? 0,
              highestScore: stats?.highestScorePercentage ?? 0,
            }
          })
        )

        setUsers(enrichedUsers)
      } catch {
        toast.error("Failed to load users")
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [])

  /* ---------------- STATUS TOGGLE ---------------- */

  const toggleStatus = async (user: User) => {
    const newStatus: UserStatus =
      user.status === "ACTIVE" ? "DISABLED" : "ACTIVE"

    try {
      await updateUserStatus(user.id, newStatus)

      // Update UI without refetching
      setUsers(prev =>
        prev.map(u =>
          u.id === user.id ? { ...u, status: newStatus } : u
        )
      )

      toast.success(`User ${newStatus.toLowerCase()}`)
    } catch (err: any) {
      toast.error(err?.message || "Failed to update status")
    }
  }

  /* ---------------- FILTERING ---------------- */

  const filteredUsers = users.filter(user => {
    const searchMatch =
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())

    const roleMatch =
      roleFilter === "all" || user.role === roleFilter

    const statusMatch =
      statusFilter === "all" || user.status === statusFilter

    return searchMatch && roleMatch && statusMatch
  })

  const stats = {
    total: users.length,
    active: users.filter(u => u.status === "ACTIVE").length,
    disabled: users.filter(u => u.status === "DISABLED").length,
  }

  /* ---------------- UI HELPERS ---------------- */

  const getRoleColor = (role: UserRole) =>
    role === "ADMIN"
      ? "bg-destructive/20 text-destructive"
      : "bg-muted text-muted-foreground"

  const getStatusColor = (status: UserStatus) =>
    status === "ACTIVE"
      ? "bg-chart-2/20 text-chart-2"
      : "bg-muted text-muted-foreground"

  const getInitials = (name: string) =>
    name.split(" ").map(n => n[0]).join("").toUpperCase()
  

  if (loading) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        Loading users...
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">
          Manage user accounts and permissions
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard title="Total Users" value={stats.total} icon={<UsersIcon />} />
        <StatCard title="Active Users" value={stats.active} icon={<UserCheck />} />
        <StatCard title="Disabled Users" value={stats.disabled} icon={<UserX />} />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="grid gap-4 md:grid-cols-3 p-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search name or email"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger><SelectValue placeholder="Role" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="USER">User</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="DISABLED">Disabled</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Quizzes</TableHead>
                <TableHead>Highest Score</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filteredUsers.map(user => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge className={getRoleColor(user.role)}>
                      {user.role}
                    </Badge>
                  </TableCell>

                  <TableCell>{user.quizzesAttempted}</TableCell>
                  <TableCell>{user.highestScore}%</TableCell>

                  <TableCell>
                    <Badge className={getStatusColor(user.status)}>
                      {user.status}
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="icon" variant="ghost">
                          <MoreHorizontal />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(user)
                            setDetailsDialogOpen(true)
                          }}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedUser(user)
                            setRoleDialogOpen(true)
                          }}
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          Change Role
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          onClick={() => toggleStatus(user)}
                        >
                          <Ban className="mr-2 h-4 w-4" />
                          {user.status === "ACTIVE" ? "Disable" : "Activate"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {selectedUser && (
        <>
          <ChangeRoleDialog
            open={roleDialogOpen}
            onOpenChange={setRoleDialogOpen}
            user={selectedUser}
          />
          <UserDetailsDialog
            open={detailsDialogOpen}
            onOpenChange={setDetailsDialogOpen}
            user={selectedUser}
          />
        </>
      )}
    </div>
  )
}

function StatCard({ title, value, icon }: any) {
  return (
    <Card>
      <CardHeader className="flex justify-between pb-2">
        <CardTitle className="text-sm text-muted-foreground">
          {title}
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}
