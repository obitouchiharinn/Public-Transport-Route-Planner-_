import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "./useAuth"
import Header from "./Header";
import NavBar from "./Nav";
import "./register.css";
// const SERVER = import.meta.env["VITE_SERVER"];

// async function register(email: string, name: string, password: string) {
//   const res = await fetch(`${SERVER}/users/register`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({ email: email, name: name, password: password }),
//   });
//   if (!res.ok) {
//     const data = await res.json();
//     throw new Error(data.error);
//   }
//   return;
// }

const Register = () => {
  const {register} = useAuth();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const navigate = useNavigate();
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    register(email, name, password)
      .then(() => {
        navigate("/login");
      })
      .catch((error) => {
        if (error instanceof Error) {
          setErrorMessage(error.message); // Set error message state
        } else {
          setErrorMessage("An unexpected error occurred.");
        }
      });
  };
  return (
    <div>
      {/* <div className={"main-wrapper"}> */}
        <Header/>
        <NavBar page={"register"}/>
      {/* </div> */}
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="email">Email:</label>
        <input
          type="text"
          id="email"
          value={email}
          placeholder="Enter email address"
          onChange={(event) => setEmail(event.target.value)}
        />
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            placeholder="Enter name"
            onChange={(event) => setName(event.target.value)}
          />
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            placeholder="Enter password"
            onChange={(event) => setPassword(event.target.value)}
          />
          <p></p>
        <button type="submit">Register</button>
        {errorMessage && <p>{errorMessage}</p>}
      </form>
    </div>
  );
};

export default Register;
