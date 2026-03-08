import { Route } from "react-router-dom";

import QuizPage from "@/pages/quiz/quiz";
import QuestionPage from "@/pages/quiz/question/question";
import ReviewQuestionPage from "@/pages/quiz/question/question-review";
import History from "@/pages/History";
import Leaderboard from "@/pages/Leaderboard";
import Home from "@/pages/Home";
import ProtectedRoute from "./protected.route"


export default function UserRoutes() {
  return (
    <Route element={<ProtectedRoute allowedRoles={["ADMIN", "USER"]} />}>
        <Route path="/" element={<Home />} />
        <Route path="/quiz/:quizId" element={<QuizPage />} />
        <Route path="/quiz/:quizId/questions" element={<QuestionPage />} />
        <Route path="/quiz/:quizId/history/:id" element={<ReviewQuestionPage/>} />
        <Route path="/history" element={<History />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
    </Route>
  )
}
