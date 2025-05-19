import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css";
import NavBar from "./Nav";
import useAuth from "./useAuth";
import Header from "./Header";
// const SERVER = import.meta.env["VITE_SERVER"];

// interface LoginResponse {
//   message: string;
//   token: string;
// }
// async function login(email: string, password: string) {
//   const res = await fetch(`${SERVER}/users/login`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ email: email, password: password }),
//   });
//   if (!res.ok) {
//     const data = await res.json();
//     throw new Error(data.error);
//   }
//   const data: LoginResponse = await res.json();
//   localStorage.setItem("token", data.token);
//   return;
// }

const Login = () => {
  const {login} = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    login(email, password)
      .then(() => {
        navigate("/profile");
      })
      .catch((error) => {
        if (error instanceof Error) {
          setErrorMessage(error.message); // Set error message state
        } else {
          setErrorMessage("An unexpected error occurred.");
        }
      });
    }
  return (
    <div className="Login-component-wrapper">
      <NavBar page={"login"}/>
      <Header/>
      
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email:</label>
        <input
          type="text"
          id="email"
          value={email}
          placeholder="Enter your email address"
          onChange={(event) => setEmail(event.target.value)}
        />      
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        
        <p></p>
        <button type="submit" id="Login-btn">Login</button>
        {errorMessage && <p>{errorMessage}</p>}
      </form>
    </div>
  );
};

export default Login;
