import api from "./api"

export type Type = "SINGLE" | "MULTIPLE"

export interface Option {
    id: number
    text: string
    correct: boolean
}

export interface OptionPayload {
    text: string
    correct: boolean
}

export interface Question {
    id: number
    content: string
    type: Type
    options: Option[]
}

export interface QuestionPayload {
    content: string
    type: Type
    options?: Option[]
    
}

export const createQuestion = async (
  quizId: number,
  payload: QuestionPayload) => {
  const res = await api.post<Question>(`/quiz/${quizId}/question`, payload)
  return res.data
}

export const getQuestion = async (quizId: number): Promise<Question[]> => {
  const res = await api.get<Question[]>(`/quiz/${quizId}/questions`)
  return res.data
}

export const updateQuestion = async (
  questionId: number,
  payload: QuestionPayload
) => {
  const res = await api.put(`/question/${questionId}`, payload)
  return res.data
}

export const deleteQuestion = async (questionId: number) => {
  const res = await api.delete(`/question/${questionId}`)
  return res.data
}

export const createOption = async (
  questionId: number,
  payload: OptionPayload) => {
  const res = await api.post<Option>(`/question/${questionId}/options`, payload)
  return res.data
}

export const getOption = async (quizId: number): Promise<Option[]> => {
  const res = await api.get<Option[]>(`/quiz/${quizId}/question`)
  return res.data
}

export const updateOption = async (
  questionId: number,
  optionId: number,
  payload: OptionPayload
) => {
  const res = await api.put(`/question/${questionId}/option/${optionId}`, payload)
  return res.data
}

export const deleteOption = async (questionId: number, optionId: number) => {
  const res = await api.delete(`/question/${questionId}/option/${optionId}`)
  return res.data
}








