import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useUserData } from "@/hooks/useUserData";

interface RouteProps {
  children: ReactNode;
}

interface RoleProtectedRouteProps extends RouteProps {
  requiredIntent: "sell" | "buy";
}

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="w-8 h-8 border-3 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
);

export const ProtectedRoute = ({ children }: RouteProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export const RoleProtectedRoute = ({ children, requiredIntent }: RoleProtectedRouteProps) => {
  const { user, isLoading } = useAuth();
  const { userData } = useUserData();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const userIntent = userData.intent || "sell";
  if (userIntent !== requiredIntent) {
    const redirectTo = userIntent === "sell" ? "/home" : "/buyer-home";
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export const PublicOnlyRoute = ({ children }: RouteProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (user) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};
