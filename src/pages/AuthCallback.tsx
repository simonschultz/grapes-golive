
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Handle the authentication callback
    const handleAuthCallback = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Error during auth callback:', error);
        navigate('/auth');
        return;
      }

      if (user) {
        navigate('/welcome');
      } else {
        navigate('/auth');
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#000080]">
      <div className="bg-white p-8 rounded-xl shadow-lg animate-fade-in">
        <p className="text-lg text-center">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
