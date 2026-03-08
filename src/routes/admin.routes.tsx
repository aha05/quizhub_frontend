import ProtectedRoute from "./admin.protected.route"
import {DashboardLayout} from "@/components/dashboard-layout"
import Dashboard from "@/pages/admin/Dashboard"
import Quiz from "@/pages/admin/Quiz"
import Question from "@/pages/admin/Question"
import User from "@/pages/admin/User"
import Report from "@/pages/admin/Report"
import { Route } from "react-router-dom";

export default function AdminRoutes() {
  return (
    <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
      <Route element={<DashboardLayout />}>
        <Route path="/admin" element={<Dashboard />} />
        <Route path="/admin/quizzes" element={<Quiz />} />
        <Route path="/admin/quizzes/:quizId/questions" element={<Question />} />
        <Route path="/admin/users" element={<User />} />
        <Route path="/admin/reports" element={<Report />} />
      </Route>
    </Route>
  )
}
