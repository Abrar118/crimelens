import { createBrowserRouter, Navigate } from "react-router-dom";
import ErrorPage from "./pages/error/error";
import { ThemeProvider } from "./components/theme-provider";
import App from "./App";
import { ProfileLayout } from "./pages/profile/ProfileLayout";
import Dashboard from "./pages/profile/General/dashboard/Dashboard";
import General from "./pages/profile/General/General";
import ReportForm from "./pages/profile/General/report/ReportForm";
import CrimeFeed from "./pages/profile/General/crim-feed/CrimeFeed";
import MyProfile from "./pages/profile/my-profile/MyProfile";
import ProfileInfo from "./pages/profile/my-profile/information/ProfileInfo";
import MyReports from "./pages/profile/my-profile/my-reports/MyReports";
import Survey from "./pages/profile/survey/Survey";
import Heatmap from "./pages/profile/survey/heatmap/Heatmap";
import Leaderboard from "./pages/profile/survey/leaderboard/Leaderboard";
import Login from "./pages/auth/login/Login";
import Signup from "./pages/auth/Signup/Signup";

import AlertUpdate from "./pages/profile/alert-update/AlertUpdate";
import Notification from "./pages/profile/alert-update/notification/Notification";
import Emergency from "./pages/profile/alert-update/emergency/Emergency";
import AdminLayout from "./AdminLayout";
import AdminDashboard from "./admin/Dashboard";
import Users from "./admin/Users";
import Alert from "./admin/Alert";
import Security from "./admin/Security";
import Settings from "./admin/Settings";

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <App />
      </ThemeProvider>
    ),
    children: [
      {
        path: "/",
        element: <Login />,
        children: [],
      },
      {
        path: "/signup",
        element: <Signup />,
        children: [],
      },
      {
        path: "profile",
        element: <ProfileLayout />,
        children: [
          {
            path: "general",
            element: <General />,
            children: [
              {
                path: "dashboard",
                element: <Dashboard />,
              },
              {
                path: "report",
                element: <ReportForm />,
              },
              {
                path: "crime-feed",
                element: <CrimeFeed />,
              },
            ],
          },
          {
            path: "my-profile",
            element: <MyProfile />,
            children: [
              {
                path: "info",
                element: <ProfileInfo />,
              },
              {
                path: "my-reports",
                element: <MyReports />,
              },
            ],
          },
          {
            path: "alert-update",
            element: <AlertUpdate />,
            children: [
              {
                path: "notification",
                element: <Notification />,
              },
              {
                path: "emergency",
                element: <Emergency />,
              },
            ],
          },
          {
            path: "survey",
            element: <Survey />,
            children: [
              {
                path: "heatmap",
                element: <Heatmap />,
              },
              {
                path: "leaderboard",
                element: <Leaderboard />,
              },
            ],
          },
        ],
      },
      {
        path: "admin",
        element: <AdminLayout />,
        children: [
          {
            path: "dashboard",
            element: <AdminDashboard />,
          },
          {
            path: "users",
            element: <Users/>,
          },
          {
            path: "alerts",
            element: <Alert/>,
          },
          {
            path: "security",
            element: <Security/>,
          },
          {
            path: "settings",
            element: <Settings/>,
          },
        ],
      },
      {
        path: "*",
        element: <Navigate to="/admin/dashboard" replace />,
        errorElement: <ErrorPage />,
      },
    ],
    errorElement: <ErrorPage />,
  },
]);

export { router };
