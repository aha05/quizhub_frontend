import api from "./api"

export interface CategoryPayload {
  name: string
  description: string
}

export interface Category {
  id: number  
  name: string
  description?: string
}

export type Difficulty = "EASY" | "MEDIUM" | "HARD"
export type Status = "ACTIVE" | "INACTIVE"


export interface Quiz {
    id: number 
    title: string 
    description: string 
    category: Category 
    difficulty: Difficulty 
    status: Status
    questions: number
    timeLimit: number
    passPercentage: number
}

export interface QuizPayload {
    title: string
    description: string
    difficulty: Difficulty
    status: Status
    categoryId: number
    timeLimit: number
    passPercentage: number
}

export interface UpdateQuizPayload {
  title: string
  description?: string
  categoryId: number
  difficulty: Difficulty
  status: Status
  timeLimit: number
  passPercentage: number
}

interface SubmitAnswer {
  userId?: number
  timeTaken: number
  answers: 
    {
      questionId: number
      selectedOptionIds: number[]
    }[]
}



export const createQuiz = async (payload: QuizPayload) => {
  const res = await api.post<Quiz>("/quiz", payload)
  return res.data
}

export const getQuiz = async (): Promise<Quiz[]> => {
  const res = await api.get<Quiz[]>("/quiz")
  return res.data
}

export const getQuizById = async (quizId: number): Promise<Quiz> => {
  const res = await api.get<Quiz>(`/quiz/${quizId}`)
  return res.data
}

export const updateQuiz = async (
  quizId: number,
  payload: UpdateQuizPayload
) => {
  console.log(payload);
  const res = await api.put(`/quiz/${quizId}`, payload)
  return res.data
}

export const deleteQuiz = async (quizId: number) => {
  const res = await api.delete(`/quiz/${quizId}`)
  return res.data
}

export const createCategory = async (payload: CategoryPayload) => {
  const res = await api.post<Category>("/quiz/category", payload)
  return res.data
}

export const getCategory = async (): Promise<Category[]> => {
  const res = await api.get<Category[]>("/quiz/category")
  return res.data
}

export const submitQuiz = async (
  quizId: number,
  payload: SubmitAnswer
) => {
  const res = await api.post(`/quiz/${quizId}/submit`, payload)
  return res.data
}






