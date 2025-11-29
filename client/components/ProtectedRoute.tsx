import { ReactNode, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const navigate = useNavigate();

  useEffect(() => {
    const authStatus = localStorage.getItem("bartender-auth");
    if (authStatus !== "authenticated") {
      navigate("/");
    }
  }, [navigate]);

  const authStatus = localStorage.getItem("bartender-auth");
  if (authStatus !== "authenticated") {
    return null;
  }

  return <>{children}</>;
}

