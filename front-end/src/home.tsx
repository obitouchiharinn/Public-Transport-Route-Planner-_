import "./home.css";
import NavBar from "./Nav";
import MapComponent from "./map";
import Header from "./Header";

const HomePage = () => {

  //Temp homepage for accessing available components
  return (
    <div className="homepage-container">
      <NavBar page={"home"}/>
      <Header/>
      
      <MapComponent></MapComponent>
    </div>
  );

};

export default HomePage;



// const navigate = useNavigate();
  // const handleMap = () => {
  //   navigate("/map");
  // };
  // const handleStaticTimetable = () => {
  //   navigate("/static");
  // };
  // const handleLiveTimetable = () => {
  //   navigate("/live");
  // };
  // const handleRegister = () => {
  //   navigate("/register")
  // };
  // const handleLogin= () => {
  //   navigate("/login")
  // };
  // const handleProfile= () => {
  //   navigate("/profile")
  // };
//     <h1 className=""> __APP NAME PLACEHOLDER__ </h1>
  //     <div className="button-container">
  //       <button className="homepage-btn" onClick={handleMap}>GO TO MAP</button>
  //       <button className="homepage-btn" onClick={handleStaticTimetable} >GO TO STATIC TIME TABLE</button>
  //       <button className="homepage-btn" onClick={handleLiveTimetable}>GO TO LIVE TIME TABLE</button>
  //       <button className="homepage-btn" onClick={handleRegister}>REGISTER</button>
  //       <button className="homepage-btn" onClick={handleLogin}>LOGIN</button>
  //       <button className="homepage-btn" onClick={handleProfile}>VIEW PROFILE</button>
  //     </div>
  //   </div>
  // );