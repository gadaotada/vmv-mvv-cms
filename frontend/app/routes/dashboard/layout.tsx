import { useAuth } from "~/providers/AuthProvider";
import { DefaultUIvalsProvider } from "~/providers/DefaultUIvals";
import { Navigate, Outlet } from "react-router";
import { SideBar } from "~/ui/sidebar";

export default function DashboardLayout() {
  const { isAuthenticated, authLoading } = useAuth();
    // Redirect to login if not authenticated
    if (authLoading) {
      return null;
    }

    if (!isAuthenticated) {
      return <Navigate to="/" replace />;
    }
    
    return (
      <div className="flex min-h-screen min-w-screen">
        <DefaultUIvalsProvider>
          <SideBar />
          <section className="flex-1">
            <Outlet />
          </section>
        </DefaultUIvalsProvider>
      </div>
    );
  }