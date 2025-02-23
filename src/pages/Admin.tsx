
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Admin = () => {
  const { toast } = useToast();
  const [isSendingEmails, setIsSendingEmails] = useState(false);

  const handleTestEmailDigest = async () => {
    try {
      setIsSendingEmails(true);
      const { error } = await supabase.functions.invoke('send-activity-emails');
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Email digest job has been triggered",
      });
    } catch (error) {
      console.error('Error triggering email digest:', error);
      toast({
        title: "Error",
        description: "Failed to trigger email digest",
        variant: "destructive",
      });
    } finally {
      setIsSendingEmails(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="flex justify-between items-center p-4 border-b bg-white">
        <div className="flex items-center gap-2">
          <img 
            src="/lovable-uploads/c8d510f1-af2f-4971-a8ae-ce69e945c096.png" 
            alt="Grapes Logo" 
            className="w-8 h-8"
          />
          <h1 className="text-xl font-semibold">Admin Dashboard</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 flex-1">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Email Digest Testing</h2>
          <Button 
            variant="outline"
            onClick={handleTestEmailDigest}
            disabled={isSendingEmails}
          >
            {isSendingEmails ? "Sending..." : "Test Email Digest"}
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Admin;

