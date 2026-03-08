import { BrowserRouter, Routes} from "react-router-dom"
import AdminRoutes from "./admin.routes"
import UserRoutes from "./user.routes"
import PublicRoutes from "./public.routes"


export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {PublicRoutes()}
        {UserRoutes()}
        {AdminRoutes()}
      </Routes>
    </BrowserRouter>
  )
}
