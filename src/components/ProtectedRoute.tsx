import { Navigate } from "react-router-dom";
import { useUsuarioStore } from "../context/UsuarioContext";
import type { ReactNode } from "react";

type ProtectedRouteProps = {
  children: ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { usuario } = useUsuarioStore();
  const storedUser = localStorage.getItem("usuario");
  const isAuthenticated = usuario || storedUser;

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
