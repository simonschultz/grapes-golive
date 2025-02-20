
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const performLogout = async () => {
      await supabase.auth.signOut();
      navigate('/');
    };

    performLogout();
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#000080]">
      <div className="bg-white p-8 rounded-xl shadow-lg animate-fade-in">
        <p className="text-lg text-center">Signing out...</p>
      </div>
    </div>
  );
};

export default Logout;
