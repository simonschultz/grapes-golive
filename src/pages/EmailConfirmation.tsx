
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Helmet } from "react-helmet-async";

const EmailConfirmation = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#D6BCFA]">
      <Helmet>
        <title>Email Confirmation | Grapes</title>
        <meta name="description" content="Email confirmation for your Grapes account" />
        <meta property="og:title" content="Email Confirmation | Grapes" />
        <meta property="og:description" content="Email confirmation for your Grapes account" />
        <meta property="og:image" content="/lovable-uploads/987d0824-15e3-4e4a-b4e8-535baf108d42.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Email Confirmation | Grapes" />
        <meta name="twitter:description" content="Email confirmation for your Grapes account" />
        <meta name="twitter:image" content="/lovable-uploads/987d0824-15e3-4e4a-b4e8-535baf108d42.png" />
      </Helmet>
      
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-lg animate-fade-in">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">Email on its way</h2>
          <p className="text-gray-600">
            We have sent you an email to confirm your email address. Hate to tell you, but it might be worth checking your spam folder.
          </p>
        </div>

        <div className="text-center">
          <Link to="/">
            <Button variant="link" className="text-primary hover:text-primary/90">
              Back to home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmation;
