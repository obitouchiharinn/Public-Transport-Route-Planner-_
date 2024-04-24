import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "./Nav";
import "./user_page.css";
import useAuth from "./useAuth";
import Header from "./Header";

const SERVER = import.meta.env["VITE_SERVER"];
async function fetchProfile(token: string) {
  const res = await fetch(`${SERVER}/users/profile`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error);
  }
  const data = await res.json();
  return data;
}

function UserPage() {
  const [user, setUser] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const {token, authed, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };
  useEffect(() => {
    console.log(authed);
    console.log(token);
    const fetchUserProfile = async () => {
      // const token = localStorage.getItem("token");
      if (token === "") {
        setErrorMessage("Token not found");
        return;
      }

      try {
        const data = await fetchProfile(token);
        setUser(data);
        setErrorMessage("");
      } catch (error: any) {
        setErrorMessage(error.message || "An unexpected error occurred");
      }
    };

    fetchUserProfile();
  }, [authed, token]);

  return (
    <div className="userpage-component-wrapper">
      <Header/>
      <NavBar page={"profile"}/>
      <h2>Profile</h2>
      {errorMessage && <p>{errorMessage}</p>}
      {user &&(
        <div>
          <p>Email: {user.email}</p>
          <p>Name: {user.name}</p>
          <p>User ID: {user.user_id}</p>
        </div>
      )}
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default UserPage;
