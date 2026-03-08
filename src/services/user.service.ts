import api from "./api"

export type Status = "ACTIVE" | "DISABLED"

export type Role = "ADMIN" | "USER"

export interface User {
    id: number
    name: string
    email: string
    role: string
    status: string
}

export interface UserPayload {
    name: string
    email: string
    password: string
}

export interface UserStats {
    userId: number
    name: string
    quizzesAttempted: number
    highestScorePercentage: number
}

export const getCurrentUser = async (): Promise<User> => {
  const res = await api.get<User>(`/auth/me`)
  return res.data
}

export const getUser = async (): Promise<User[]> => {
  const res = await api.get<User[]>(`/users`)
  return res.data
}

export const getUserStats = async (userId: number): Promise<UserStats> => {
  const res = await api.get<UserStats>(`user-activity/user/${userId}/stats`)
  return res.data
}

export const createUser = async (
  payload: UserPayload) => {
  const res = await api.post<User>(`/users`, payload)
  return res.data
}

export const updateProfile = async (
  payload: UserPayload) => {
  const res = await api.put<User>(`/users/profile`, payload)
  return res.data
}

export const updateUser = async (
  userId: number,
  payload: UserPayload) => {
    console.log(payload, userId)
  const res = await api.put<User>(`/users/${userId}`, payload)

  return res.data
}

export const updateUserStatus = async (userId: number, status: Status) => {
  const res = await api.put(`/users/${userId}/status`, {status: status})
  return res.data
}

export const updateUserRole = async (userId: number, role: Role) => {
  const res = await api.put(`/users/${userId}/role`, {role: role})
  return res.data
}

export const deleteUser = async (userId: number) => {
  const res = await api.delete(`/users/${userId}}`)
  return res.data
}
