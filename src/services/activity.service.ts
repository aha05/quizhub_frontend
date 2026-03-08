import api from "./api"

interface Answer {
  questionId: number
  selectedOptionIds: number[]
}


export interface History {
   id: number
   quizId: number
   quizTitle: string
   totalQuestions: number
   correctAnswers: number
   scorePercentage: number
   quizCategory: string
   passed: boolean
   submittedAt: string 
   timeTaken: string
   answers: Answer[]
}

export interface Leaderboard {
    userId: number
    username: string
    score: number
    quizzesAttempted: number
    rank: number
}

export interface UserActivity {
    name: string
    level: string
    totalQuizzes: number
    completed: number
    badges: string[]
    highestScorePercentage: number
    leaderboard: number
    averageScore: number
}

export const getHistory = async (): Promise<History[]> => {
  const res = await api.get<History[]>(`/user-activity/history`)
  return res.data
}

export const getLeaderboard = async (): Promise<Leaderboard[]> => {
  const res = await api.get<Leaderboard[]>(`/user-activity/leaderboard`)
  return res.data
}

export const getHistoryById = async (id: number): Promise<History> => {
  const res = await api.get<History>(`/quiz/quizResult/${id}`)
  return res.data
}

export const getBestScore = async (quizId: number): Promise<History[]> => {
  const res = await api.get<History[]>(`/quiz/${quizId}/bestResult`)
  return res.data
}

export const getUserActivity = async (): Promise<UserActivity> => {
  const res = await api.get<UserActivity>(`/user-activity`)
  return res.data
}



