import { useAuth } from "~/providers/AuthProvider";
import type { Route } from "./+types/home";
import Login from "~/features/sign/login";
import { Navigate } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Home() {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  return <div className="w-full h-full flex justify-center items-center pt-10">
    <Login />
  </div>
}
