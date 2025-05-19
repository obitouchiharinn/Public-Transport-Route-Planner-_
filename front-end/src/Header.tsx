import {useNavigate} from "react-router-dom";

export default function Header(){
    const navigate = useNavigate();

    return (
        <div 
        className="header"
        style={{textAlign: "center"}}>
            <h1 className="main_header" onClick={() => navigate("/")}>Public Transport Route Planner</h1>
            <p>A transit route planning app, providing you with tools to assist in navigating the greater Vancouver area.</p>
        </div>
    );
}
