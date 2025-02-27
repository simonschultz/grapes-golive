
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";

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
      </main>

      <footer className="fixed bottom-0 left-0 w-full p-6 text-sm text-center">
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
    </div>;
};

export default Index;
