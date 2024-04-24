import React, { createContext, useState, useContext } from "react";
//Provides a single source for authentication state
interface AuthContextType {
  authed: boolean;
  token: string;
  login: (email :string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email:string, name: string, password:string) => Promise<void>;
}
interface LoginResponse {
  message: string;
  token: string;
}

const SERVER = import.meta.env["VITE_SERVER"];
const authContext = createContext<AuthContextType | undefined>(undefined);

function useAuth(): AuthContextType {
  const [token, setToken] = useState<string>(localStorage.getItem("token") || "");
  const [authed, setAuthed] = useState(token !== "");
  return {
    authed,
    token,
    async login(email: string, password: string) {
        const res = await fetch(`${SERVER}/users/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: email, password: password }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error);
        }
        setAuthed(true);
        const data: LoginResponse = await res.json();
        localStorage.setItem("token", data.token);
        setToken(data.token);
        return;
      },
    logout() {
      return new Promise<void>((res) => {
        setAuthed(false);
        setToken("");
        localStorage.setItem('token','');
        res();
      });
    },
    async register(email: string, name: string, password: string) {
        const res = await fetch(`${SERVER}/users/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: email, name: name, password: password }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error);
        }
        return;
      }
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  return <authContext.Provider value={auth}>{children}</authContext.Provider>;
}

export function AuthConsumer() {
  const context = useContext(authContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthConsumer;
