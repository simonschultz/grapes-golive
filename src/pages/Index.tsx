
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";
import { 
  Users, 
  UserPlus, 
  MessageSquare, 
  Calendar, 
  Bell, 
  Grid3X3, 
  Heart 
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    checkAuth();
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session?.user);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleButtonClick = () => {
    navigate(isAuthenticated ? "/front" : "/auth");
  };

  return <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 bg-[#000080]">
      <Helmet>
        <title>Grapes - create and join groups</title>
        <meta name="description" content="A simple platform to create and join groups for friends, family and like-minded people." />
        <meta property="og:title" content="Grapes - create and join groups" />
        <meta property="og:description" content="A simple platform to create and join groups for friends, family and like-minded people." />
        <meta property="og:image" content="/lovable-uploads/987d0824-15e3-4e4a-b4e8-535baf108d42.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Grapes - create and join groups" />
        <meta name="twitter:description" content="A simple platform to create and join groups for friends, family and like-minded people." />
        <meta name="twitter:image" content="/lovable-uploads/987d0824-15e3-4e4a-b4e8-535baf108d42.png" />
      </Helmet>
      
      <main className="w-full max-w-2xl mx-auto text-center space-y-8">
        <div className="flex flex-col items-center">
          <img src="/lovable-uploads/c6d042f1-d2f4-4f1b-9676-48717f7576ff.png" alt="Grapes logo" className="h-24 w-24 mb-4" />
          <h1 className="text-5xl font-bold tracking-tight text-white animate-fade-in sm:text-5xl">Grapes</h1>
        </div>
        
        <p className="text-xl text-white/90 leading-relaxed animate-fade-in sm:text-xl">
          A simple platform to create and join groups for friends, family and like-minded people.
        </p>

        <div className="space-y-4">
          <Button className="bg-white/20 backdrop-blur-lg hover:bg-white/30 text-white text-lg px-8 py-6 rounded-xl font-medium transition-all duration-300 hover:-translate-y-1" onClick={handleButtonClick}>
            {isAuthenticated ? "Go to dashboard" : "Create account"}
          </Button>
          {!isAuthenticated && <div>
              <Link to="/magic-link" className="text-white/40 hover:text-white transition-colors duration-200 underline underline-offset-4">
                Already have an account?
              </Link>
            </div>}
        </div>
        
        <div className="mt-20 pt-16 border-t border-white/10 text-left">
          <h2 className="text-3xl font-bold text-white text-center mb-12">What is Grapes?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Feature 1: Find groups */}
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl hover:bg-white/15 transition-colors duration-300">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-white/20 rounded-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">Find groups</h3>
              </div>
              <p className="text-white/80">
                Browse groups that fits your interests. Or accept invites from friends.
              </p>
            </div>
            
            {/* Feature 2: Create groups */}
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl hover:bg-white/15 transition-colors duration-300">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-white/20 rounded-lg">
                  <UserPlus className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">Create private and public groups</h3>
              </div>
              <p className="text-white/80">
                Create a group for friends and like-minded people. For forever or specific events. You decide who can join.
              </p>
            </div>
            
            {/* Feature 3: Chat */}
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl hover:bg-white/15 transition-colors duration-300">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-white/20 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">Chat</h3>
              </div>
              <p className="text-white/80">
                Chat with other group members. In pure text. Or uploaded images.
              </p>
            </div>
            
            {/* Feature 4: Calendar */}
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl hover:bg-white/15 transition-colors duration-300">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-white/20 rounded-lg">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">Calendar</h3>
              </div>
              <p className="text-white/80">
                Schedule group events and manage the attendance with yes, no or maybe RSVPs from everyone invited.
              </p>
            </div>
            
            {/* Feature 5: Notifications */}
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl hover:bg-white/15 transition-colors duration-300">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-white/20 rounded-lg">
                  <Bell className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">Notifications</h3>
              </div>
              <p className="text-white/80">
                Never miss a beat. We will notify you when new activities are happening in your groups.
              </p>
            </div>
            
            {/* Feature 6: Overview */}
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl hover:bg-white/15 transition-colors duration-300">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-white/20 rounded-lg">
                  <Grid3X3 className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">Overview</h3>
              </div>
              <p className="text-white/80">
                Your personal overview of what events to attend and what is happening across groups.
              </p>
            </div>
            
            {/* Feature 7: We care! */}
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-xl hover:bg-white/15 transition-colors duration-300 md:col-span-2">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-white/20 rounded-lg">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white">We care!</h3>
              </div>
              <p className="text-white/80">
                We have built Grapes, because we care. About alternatives. About your data. And your own control.{" "}
                <Link to="/about" className="text-white underline underline-offset-4 hover:text-white/80">
                  Read more
                </Link>
              </p>
            </div>
          </div>
        </div>
        
        <footer className="mt-12 w-full p-6 text-sm text-center">
          <nav className="space-x-6">
            <a href="/about" className="text-white/70 hover:text-white transition-colors duration-200 underline underline-offset-4">
              About
            </a>
            <a href="/privacy" className="text-white/70 hover:text-white transition-colors duration-200 underline underline-offset-4">
              Privacy policy
            </a>
            <a href="/terms" className="text-white/70 hover:text-white transition-colors duration-200 underline underline-offset-4">
              Terms of service
            </a>
          </nav>
        </footer>
      </main>
    </div>;
};

export default Index;
