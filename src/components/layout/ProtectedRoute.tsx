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

/** Logged-in home: never default to seller — missing intent goes to intent picker. */
const homePathForIntent = (intent: "sell" | "buy" | undefined): string => {
  if (intent === "buy") return "/buyer-home";
  if (intent === "sell") return "/home";
  return "/intent";
};

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
  const { userData, profileHydrated } = useUserData();

  if (isLoading || !profileHydrated) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  const userIntent = userData.intent;
  if (userIntent !== "sell" && userIntent !== "buy") {
    return <Navigate to="/intent" replace />;
  }

  if (userIntent !== requiredIntent) {
    return <Navigate to={homePathForIntent(userIntent)} replace />;
  }

  return <>{children}</>;
};

export const PublicOnlyRoute = ({ children }: RouteProps) => {
  const { user, isLoading } = useAuth();
  const { userData, profileHydrated } = useUserData();

  if (isLoading || (user && !profileHydrated)) {
    return <LoadingSpinner />;
  }

  if (user) {
    return <Navigate to={homePathForIntent(userData.intent)} replace />;
  }

  return <>{children}</>;
};

/** Intent page: show picker unless user already has a stored role (then send to the right app). */
export const IntentAccessRoute = ({ children }: RouteProps) => {
  const { user, isLoading } = useAuth();
  const { userData, profileHydrated } = useUserData();

  if (isLoading || (user && !profileHydrated)) {
    return <LoadingSpinner />;
  }

  if (user && (userData.intent === "buy" || userData.intent === "sell")) {
    return <Navigate to={homePathForIntent(userData.intent)} replace />;
  }

  return <>{children}</>;
};

export const VerificationRoute = ({ children }: RouteProps) => {
  const { user, isLoading } = useAuth();
  const { userData, profileHydrated } = useUserData();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (user) {
    if (!profileHydrated) {
      return <LoadingSpinner />;
    }
    return <Navigate to={homePathForIntent(userData.intent)} replace />;
  }

  return <>{children}</>;
};
