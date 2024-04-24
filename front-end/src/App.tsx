import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MapComponent from "./map.tsx";
import HomePage from "./home.tsx";
import StaticTimetable from "./timetable_static.tsx";
import RealTimeInfo from "./realtime.tsx";
import RouteFinder from "./route_finder.tsx";
import StopSchedule from "./stop_schedule.tsx";
import Login from "./login.tsx";
import Register from "./register.tsx";
import UserPage from "./user_page.tsx";
import { AuthProvider} from "./useAuth.tsx";
import RequireAuth from "./require_auth.tsx";
import RequireNoAuth from "./require_no_auth.tsx";
//import { useNavigate } from "react-router-dom";

function App() {
  return (
    // AKA HOMEPAGE
    <Router>
      <div className="App">
        <div className="content">
          <AuthProvider>
            <Routes>
              <Route path="/" element={<HomePage />}></Route>
              <Route path="/map" element={<MapComponent />}></Route>
              <Route path="/static" element={<StaticTimetable />}></Route>
              <Route path="/realtime" element={<RealTimeInfo/>}></Route>
              <Route path="/routefinder" element={<RouteFinder/>}></Route>
              <Route path="/schedule/:stopCode" element={<StopSchedule />}></Route>
              <Route path="/login" element={<RequireNoAuth><Login/></RequireNoAuth>}></Route>
              <Route path="/register" element={<RequireNoAuth><Register/></RequireNoAuth>}></Route>
              <Route path="/profile" element={<RequireAuth><UserPage/></RequireAuth>}></Route>
            </Routes>
          </AuthProvider>
        </div>
      </div>
    </Router>
  );
}

export default App;
