import { useNavigate } from "react-router-dom";
import "./Nav.css";

const NavBar = ({page}: {page?: string;}) => {
  const navigate = useNavigate();

  const home = () => {
    navigate('/');
  };
  const handleStaticTimetable = () => {
    navigate("/static");
  };
  const handleRegister = () => {
    navigate("/register")
  };  const handleLogin= () => {
    navigate("/login")
  };  const handleProfile= () => {
    navigate("/profile")
  };
  const handleRealTime = () => {
    navigate("/realtime");
  };
  const handleRouteFinder = () => {
    navigate("/routefinder");
  }
  return (
    <div className="nav-container">
      <div className="nav-button-container">
        <button className={page === "home" ? "selected-nav-btn" : "nav-btn"} onClick={home}>MAP</button>
        <button className={page === "static" ? "selected-nav-btn" : "nav-btn"} onClick={handleStaticTimetable} >STATIC TIME TABLE</button>
        <button className={page === "realtime" ? "selected-nav-btn" : "nav-btn"} onClick={handleRealTime}>REAL-TIME ROUTES</button>
        <button className={page === "routefinder" ? "selected-nav-btn" : "nav-btn"} onClick={handleRouteFinder}>ROUTE FINDER</button>
        <button className={page === "register" ? "selected-nav-btn" : "nav-btn"} onClick={handleRegister}>REGISTER</button>
        <button className={page === "login" ? "selected-nav-btn" : "nav-btn"} onClick={handleLogin}>LOGIN</button>
        <button className={page === "profile" ? "selected-nav-btn" : "nav-btn"} onClick={handleProfile}>PROFILE</button>
      </div>
    </div>
  );
};

export default NavBar;