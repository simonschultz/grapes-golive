
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import Front from "./pages/Front";
import Auth from "./pages/Auth";
import Welcome from "./pages/Welcome";
import Settings from "./pages/Settings";
import Groups from "./pages/Groups";
import Calendar from "./pages/Calendar";
import Activity from "./pages/Activity";
import Admin from "./pages/Admin";
import About from "./pages/About";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import EmailConfirmation from "./pages/EmailConfirmation";
import MagicLink from "./pages/MagicLink";
import NotFound from "./pages/NotFound";
import Create from "./pages/groups/Create";
import Join from "./pages/groups/Join";
import Group from "./pages/groups/Group";
import GroupFront from "./pages/groups/GroupFront";
import GroupChat from "./pages/groups/GroupChat";
import GroupCalendar from "./pages/groups/GroupCalendar";
import GroupMembers from "./pages/groups/GroupMembers";
import GroupEdit from "./pages/groups/GroupEdit";
import GroupEventCreate from "./pages/groups/GroupEventCreate";
import GroupEventOverview from "./pages/groups/GroupEventOverview";
import Index from "./pages/Index";
import AuthCallback from "./pages/AuthCallback";
import Logout from "./pages/Logout";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setAuthenticated(!!user);
      setLoading(false);
    };
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthenticated(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (!authenticated) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const GroupRouteGuard = ({ children }: { children: React.ReactNode }) => {
  const { pathname } = useLocation();
  const { slug } = useParams();

  if (pathname === `/groups/${slug}`) {
    return <>{children}</>;
  }

  return <Navigate to={`/groups/${slug}`} replace />;
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/about" element={<About />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/email-confirmation" element={<EmailConfirmation />} />
        <Route path="/magic-link" element={<MagicLink />} />

        <Route path="/welcome" element={<ProtectedRoute><Welcome /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/front" element={<ProtectedRoute><Front /></ProtectedRoute>} />
        <Route path="/groups" element={<ProtectedRoute><Groups /></ProtectedRoute>} />
        <Route path="/calendar" element={<ProtectedRoute><Calendar /></ProtectedRoute>} />
        <Route path="/activity" element={<ProtectedRoute><Activity /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        <Route path="/groups/create" element={<ProtectedRoute><Create /></ProtectedRoute>} />
        <Route path="/groups/join" element={<ProtectedRoute><Join /></ProtectedRoute>} />
        
        <Route path="groups/:slug">
          <Route index element={<GroupRouteGuard><Group /></GroupRouteGuard>} />
          <Route path="front" element={<ProtectedRoute><GroupFront /></ProtectedRoute>} />
          <Route path="chat" element={<ProtectedRoute><GroupChat /></ProtectedRoute>} />
          <Route path="calendar" element={<ProtectedRoute><GroupCalendar /></ProtectedRoute>} />
          <Route path="calendar/create" element={<ProtectedRoute><GroupEventCreate /></ProtectedRoute>} />
          <Route path="calendar/:id" element={<ProtectedRoute><GroupEventOverview /></ProtectedRoute>} />
          <Route path="members" element={<ProtectedRoute><GroupMembers /></ProtectedRoute>} />
          <Route path="settings" element={<ProtectedRoute><GroupEdit /></ProtectedRoute>} />
          <Route path="*" element={<GroupRouteGuard><Group /></GroupRouteGuard>} />
        </Route>

        <Route path="/" element={<Index />} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
