
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";

const Auth = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        navigate('/front');
      }
    };
    checkUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        navigate('/front');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!termsAccepted) {
      toast({
        title: "Terms Required",
        description: "Please accept the terms and privacy policy to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            terms_accepted: termsAccepted,
          },
          emailRedirectTo: window.location.origin + '/auth/callback'
        },
      });

      if (error) {
        if (error.message.includes('rate limit')) {
          toast({
            title: "Too Many Attempts",
            description: "Please wait a few minutes before trying again.",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
          });
        }
        return;
      }

      if (data.user) {
        // Navigate to email confirmation page
        navigate('/email-confirmation');
        
        // Clear the form
        setEmail("");
        setPassword("");
        setTermsAccepted(false);
        
        toast({
          title: "Success",
          description: "Please check your email for confirmation link.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#000080]">
      <Helmet>
        <title>Create Account | Grapes</title>
        <meta name="description" content="Create your Grapes account and start connecting with groups" />
        <meta property="og:title" content="Create Account | Grapes" />
        <meta property="og:description" content="Create your Grapes account and start connecting with groups" />
        <meta property="og:image" content="/lovable-uploads/987d0824-15e3-4e4a-b4e8-535baf108d42.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Create Account | Grapes" />
        <meta name="twitter:description" content="Create your Grapes account and start connecting with groups" />
        <meta name="twitter:image" content="/lovable-uploads/987d0824-15e3-4e4a-b4e8-535baf108d42.png" />
      </Helmet>
      
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-lg animate-fade-in">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Create your account</h2>
          <p className="mt-2 text-sm text-gray-600">
            Join our community and start connecting with others
          </p>
        </div>

        <form onSubmit={handleSignUp} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Enter your email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Create a password"
              minLength={6}
            />
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked as boolean)}
            />
            <div className="grid gap-1.5 leading-none">
              <Label
                htmlFor="terms"
                className="text-sm font-medium leading-none cursor-pointer"
              >
                Yes, I accept your{" "}
                <a
                  href="/privacy"
                  className="text-primary underline hover:text-primary/90"
                  target="_blank"
                >
                  privacy policy
                </a>{" "}
                and{" "}
                <a
                  href="/terms"
                  className="text-primary underline hover:text-primary/90"
                  target="_blank"
                >
                  terms
                </a>
              </Label>
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-opacity-80 hover:bg-opacity-100"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : "Create account"}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default Auth;
