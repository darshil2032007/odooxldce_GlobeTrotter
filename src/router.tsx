import { createBrowserRouter, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { LandingPage } from "@/pages/LandingPage";
import { LoginPage } from "@/pages/auth/LoginPage";
import { SignupPage } from "@/pages/auth/SignupPage";
import { ForgotPasswordPage } from "@/pages/auth/ForgotPasswordPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { TripsPage } from "@/pages/TripsPage";
import { CreateTripPage } from "@/pages/CreateTripPage";
import { TripDetailPage } from "@/pages/TripDetailPage";
import { CitiesPage } from "@/pages/CitiesPage";
import { ActivitiesPage } from "@/pages/ActivitiesPage";

export const router = createBrowserRouter([
  // Public routes
  {
    element: <PublicLayout />,
    children: [
      { path: "/", element: <LandingPage /> },
      { path: "/login", element: <LoginPage /> },
      { path: "/signup", element: <SignupPage /> },
      { path: "/forgot-password", element: <ForgotPasswordPage /> },
    ],
  },
  // Authenticated app shell routes
  {
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: "/dashboard", element: <DashboardPage /> },
      { path: "/trips", element: <TripsPage /> },
      { path: "/trips/new", element: <CreateTripPage /> },
      { path: "/trips/:id", element: <TripDetailPage /> },
      { path: "/cities", element: <CitiesPage /> },
      { path: "/activities", element: <ActivitiesPage /> },
      // Fallback for settings or unhandled inside shell
      { path: "/settings", element: <DashboardPage /> },
    ],
  },
  // Global 404 / Catch-all
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
