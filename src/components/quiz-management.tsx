import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import toast from "react-hot-toast"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, MoreHorizontal, Pencil, Trash2, FileQuestion } from "lucide-react"

import { AddQuizDialog } from "@/components/add-quiz-dialog"
import { AddCategoryDialog } from "@/components/add-category-dialog"
import { EditQuizDialog } from "@/components/edit-quiz-dialog"
import { DeleteQuizDialog } from "@/components/delete-quiz-dialog"
import { getQuiz, getCategory, deleteQuiz } from "@/services/quiz.service"


type Difficulty = "EASY" | "MEDIUM" | "HARD"
type Status = "ACTIVE" | "INACTIVE"

interface Category {
  id: number
  name: string
  description?: string
}

interface Quiz {
  id: number
  title: string
  description: string
  category: Category
  difficulty: Difficulty
  questions: number
  status: Status
  timeLimit: number
  passPercentage: number
}

export function QuizManagement() {
  const navigate = useNavigate()

  // State
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)

  // Dialog state
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [addCategoryDialogOpen, setAddCategoryDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null)

  const itemsPerPage = 10

  // Load quizzes and categories
  useEffect(() => {
    const loadData = async () => {
      try {
        const [quizData, categoryData] = await Promise.all([getQuiz(), getCategory()])
        setQuizzes(quizData)
        setCategories(categoryData)
      } catch (error) {
        toast.error("Failed to load quizzes or categories")
        console.error(error)
      }
    }
    loadData()
  }, [])

  // Filtered & paginated quizzes
  const filteredQuizzes = quizzes.filter((quiz) => {
    const matchesSearch = quiz.title.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = categoryFilter === "all" || quiz.category.name === categoryFilter
    const matchesDifficulty = difficultyFilter === "all" || quiz.difficulty === difficultyFilter
    return matchesSearch && matchesCategory && matchesDifficulty
  })

  const totalPages = Math.ceil(filteredQuizzes.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedQuizzes = filteredQuizzes.slice(startIndex, startIndex + itemsPerPage)

  const handleDeleteQuiz = async () => {
    if (!selectedQuiz) return
    try{
      await deleteQuiz(selectedQuiz.id)
      toast.success("Delete succeeded!")
    } catch(error){
        toast.error("Delete Failed!")
    }
    setQuizzes(quizzes.filter((q) => q.id !== selectedQuiz.id))
    setDeleteDialogOpen(false)
    setSelectedQuiz(null)
  }


  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "EASY":
        return "bg-chart-2/20 text-chart-2"
      case "MEDIUM":
        return "bg-chart-3/20 text-chart-3"
      case "HARD":
        return "bg-destructive/20 text-destructive"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  const getStatusColor = (status: string) => {
    return status === "ACTIVE" ? "bg-chart-2/20 text-chart-2" : "bg-muted text-muted-foreground"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-balance">Quiz Management</h1>
          <p className="text-muted-foreground mt-1">Create, edit, and manage quizzes</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Quiz
          </Button>
          <Button onClick={() => setAddCategoryDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add Category
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search quizzes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
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
              <SelectTrigger>
                <SelectValue placeholder="All Difficulties" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Difficulties</SelectItem>
                <SelectItem value="EASY">Easy</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HARD">Hard</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Quiz Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Difficulty</TableHead>
                <TableHead>Questions</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedQuizzes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No quizzes found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedQuizzes.map((quiz) => (
                  <TableRow key={quiz.id}>
                    <TableCell className="font-medium">{quiz.title}</TableCell>
                    <TableCell>{quiz.category.name}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getDifficultyColor(quiz.difficulty)}>
                        {quiz.difficulty}
                      </Badge>
                    </TableCell>
                    <TableCell>{quiz.questions}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getStatusColor(quiz.status)}>
                        {quiz.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => navigate(`/admin/quizzes/${quiz.id}/questions`)}>
                            <FileQuestion className="mr-2 h-4 w-4" /> Questions
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedQuiz(quiz)
                              setEditDialogOpen(true)
                            }}
                          >
                            <Pencil className="mr-2 h-4 w-4" /> Edit Quiz
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setSelectedQuiz(quiz)
                              setDeleteDialogOpen(true)
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Quiz
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredQuizzes.length)} of {filteredQuizzes.length} results
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1}>
              Previous
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button key={page} variant={currentPage === page ? "default" : "outline"} size="sm" onClick={() => setCurrentPage(page)}>
                {page}
              </Button>
            ))}
            <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Dialogs */}
      <AddQuizDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
      <AddCategoryDialog open={addCategoryDialogOpen} onOpenChange={setAddCategoryDialogOpen} />
      {selectedQuiz && (
        <>
          <EditQuizDialog open={editDialogOpen} onOpenChange={setEditDialogOpen} quiz={selectedQuiz} />
          <DeleteQuizDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen} quizTitle={selectedQuiz.title} onDelete={handleDeleteQuiz} />
        </>
      )}
    </div>
  )
}
