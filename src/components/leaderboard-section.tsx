"use client"

import { useState, useEffect } from "react"
import { Trophy } from "lucide-react"
import { getLeaderboard } from "@/services/activity.service"

export interface Leaderboard {
    userId: number
    username: string
    score: number
    quizzesAttempted: number
    rank: number
}

export function LeaderboardTable() {
  const [leaderboard, setLeaderboard] = useState<Leaderboard[]>([])

  useEffect(() => {
    
        const loadLeaderboard = async () => {
          try {
            const leaderboardData = await getLeaderboard()
            setLeaderboard(leaderboardData)
          } catch (err) {
            console.error("Failed to load quiz", err)
          } 
        }
    
        loadLeaderboard()
      }, []) 

  return (
    <div className="overflow-x-auto">
      <h2 className="text-2xl font-bold text-balance mb-4">Leaderboard</h2>
      <table className="w-full text-left border-collapse border border-border/50">
        <thead>
          <tr className="bg-card/50">
            <th className="px-4 py-2 border border-border/50">Rank</th>
            <th className="px-4 py-2 border border-border/50">Username</th>
            <th className="px-4 py-2 border border-border/50">Score</th>
            <th className="px-4 py-2 border border-border/50">Quizzes Completed</th>
          </tr>
        </thead>
        <tbody>
          {leaderboard.map((user) => (
            <tr

              className={`${
                user.rank === 1 ? "" : "bg-card/50"
              } hover:bg-primary/10 transition-colors`}
            >
              <td className="px-4 py-2 border border-border/50 flex items-center gap-2">
                <Trophy className={`h-4 w-4 ${user.rank === 1 ? "text-yellow-500" : "text-muted-foreground"}`} />
                {user.rank}
              </td>
              <td className="px-4 py-2 border border-border/50">{user.username}</td>
              <td className="px-4 py-2 border border-border/50">{user.score}</td>
              <td className="px-4 py-2 border border-border/50">{user.quizzesAttempted}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
