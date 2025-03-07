
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

const ADMIN_EMAILS = ['simon@commis.dk', 'hi@grapes.group'];

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        console.log("Current user:", user?.email);
        
        if (user && user.email) {
          const isAdminEmail = ADMIN_EMAILS.some(email => 
            email.toLowerCase() === user.email?.toLowerCase()
          );
          
          console.log("Is admin email match:", isAdminEmail);
          setIsAdmin(isAdminEmail);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error checking admin access:", error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };
    
    checkAdminAccess();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      const isAdminEmail = user && user.email && 
        ADMIN_EMAILS.some(email => email.toLowerCase() === user.email?.toLowerCase());
      
      setIsAdmin(!!isAdminEmail);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (!isAdmin) {
    console.log("Access denied to admin route");
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

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
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [isMember, setIsMember] = useState(false);

  useEffect(() => {
    const checkAuthAndMembership = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const isAuthenticated = !!user;
      setAuthenticated(isAuthenticated);

      if (isAuthenticated && slug) {
        try {
          const { data: groupData, error: groupError } = await supabase
            .from('groups')
            .select('id')
            .eq('slug', slug)
            .single();
            
          if (groupError) {
            console.error("Error finding group by slug:", groupError);
            setLoading(false);
            return;
          }
          
          const groupId = groupData.id;
          
          const { data: membership, error } = await supabase
            .from('group_members')
            .select('role')
            .eq('group_id', groupId)
            .eq('user_id', user.id)
            .maybeSingle();

          if (error) {
            console.error("Error checking group membership:", error);
          }

          setIsMember(!!membership && ['admin', 'member'].includes(membership.role));
        } catch (error) {
          console.error("Error in group route guard:", error);
        }
      }

      setLoading(false);
    };

    checkAuthAndMembership();
  }, [slug]);

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  // For any group page URL (except base), check authentication and membership
  if (!authenticated) {
    return <Navigate to={`/groups/${slug}`} replace />;
  }

  if (authenticated && !isMember) {
    return <Navigate to={`/groups/${slug}`} replace />;
  }

  return <>{children}</>;
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
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminRoute>
              <Admin />
            </AdminRoute>
          </ProtectedRoute>
        } />
        <Route path="/groups/create" element={<ProtectedRoute><Create /></ProtectedRoute>} />
        <Route path="/groups/join" element={<ProtectedRoute><Join /></ProtectedRoute>} />
        
        <Route path="groups/:slug">
          <Route index element={<Group />} />
          <Route path="front" element={<GroupRouteGuard><GroupFront /></GroupRouteGuard>} />
          <Route path="chat" element={<GroupRouteGuard><GroupChat /></GroupRouteGuard>} />
          <Route path="calendar" element={<GroupRouteGuard><GroupCalendar /></GroupRouteGuard>} />
          <Route path="calendar/create" element={<GroupRouteGuard><GroupEventCreate /></GroupRouteGuard>} />
          <Route path="calendar/:id" element={<GroupRouteGuard><GroupEventOverview /></GroupRouteGuard>} />
          <Route path="members" element={<GroupRouteGuard><GroupMembers /></GroupRouteGuard>} />
          <Route path="settings" element={<GroupRouteGuard><GroupEdit /></GroupRouteGuard>} />
          <Route path="*" element={<Navigate to="." replace />} />
        </Route>

        <Route path="/" element={<Index />} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

export default App;
