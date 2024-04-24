import { Navigate } from "react-router-dom";
import useAuth from "./useAuth";

// Prevents child from being accessed without being authenticated
const RequireNoAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authed } = useAuth();
  return authed === false ? <>{children}</> : <Navigate to="/profile" replace />;
};

export default RequireNoAuth;
