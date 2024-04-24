import { Navigate } from "react-router-dom";
import useAuth from "./useAuth";

// Prevents child from being accessed without being authenticated
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { authed } = useAuth();
  return authed === true ? <>{children}</> : <Navigate to="/login" replace />;
};

export default RequireAuth;
