
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Upload, Smartphone, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { AppLayout } from "@/components/layout/AppLayout";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [acceptEmail, setAcceptEmail] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if the device is iOS
    const checkIfIOS = () => {
      const userAgent = window.navigator.userAgent.toLowerCase();
      return /iphone|ipad|ipod/.test(userAgent);
    };
    
    setIsIOS(checkIfIOS());

    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Update UI to notify the user they can add to home screen
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name, avatar_url, accept_email')
        .eq('id', user.id)
        .single();

      if (profile) {
        setFirstName(profile.first_name || "");
        setLastName(profile.last_name || "");
        setAvatarUrl(profile.avatar_url);
        setAcceptEmail(profile.accept_email || false);
      }
    };

    loadProfile();
  }, [navigate]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("No user found");

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('profile-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('profile-images')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);
      toast({
        title: "Success",
        description: "Profile image uploaded successfully",
      });
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

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("No user found");

      const { error } = await supabase
        .from('profiles')
        .update({
          first_name: firstName,
          last_name: lastName,
          avatar_url: avatarUrl,
          accept_email: acceptEmail,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
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

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to log out",
        variant: "destructive",
      });
    }
  };

  const handleDeleteProfile = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No user found");

      // Delete the profile first
      const { error: profileError } = await supabase
        .from('profiles')
        .delete()
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Sign out the user
      await supabase.auth.signOut();
      
      toast({
        title: "Account deleted",
        description: "Your account has been deleted. Contact support if you need to restore it.",
      });
      
      navigate('/');
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete account",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addToHomeScreen = async () => {
    if (deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      
      // We no longer need the prompt regardless of outcome
      setDeferredPrompt(null);
      
      // Check the outcome
      if (outcome === 'accepted') {
        toast({
          title: "Success!",
          description: "The app is being installed on your home screen.",
        });
      } else {
        toast({
          title: "Installation cancelled",
          description: "You can install the app later if you change your mind.",
        });
      }
    } else if (isIOS) {
      // For iOS devices, show specific instructions
      toast({
        title: "Add to Home Screen - iOS",
        description: "Tap the share icon in your browser and select 'Add to Home Screen'.",
      });
    } else {
      // For other browsers that don't support installation
      toast({
        title: "Add to Home Screen",
        description: "Open your browser menu and select 'Add to Home Screen' or 'Install App' to create a shortcut.",
      });
    }
  };

  return (
    <AppLayout showFooter={false}>
      <div className="min-h-screen bg-white flex flex-col">
        <header className="flex justify-between items-center p-4 border-b md:px-6 md:py-5">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} className="md:hidden">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold md:text-2xl">Settings</h1>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-md mx-auto space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={avatarUrl || ""} />
                <AvatarFallback>
                  {firstName ? firstName[0]?.toUpperCase() : "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex items-center">
                <Label
                  htmlFor="picture"
                  className="cursor-pointer flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  <Input
                    id="picture"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isLoading}
                  />
                  <Upload className="w-4 h-4" />
                  Change profile picture
                </Label>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter your first name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter your last name"
                />
              </div>

              <div className="bg-sky-100 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="acceptEmail"
                    checked={acceptEmail}
                    onCheckedChange={(checked) => setAcceptEmail(checked as boolean)}
                  />
                  <Label
                    htmlFor="acceptEmail"
                    className="text-sm text-gray-700"
                  >
                    Yes, please send occasional updates on my groups' activities.
                  </Label>
                </div>
              </div>
              
              <Button
                className="w-full"
                onClick={handleSave}
                disabled={isLoading}
                style={{ backgroundColor: "#000080" }}
              >
                {isLoading ? "Saving..." : "Save changes"}
              </Button>
              
              {/* Add to home screen section - Moved below Save button and above logout */}
              <div className="bg-blue-50 p-4 rounded-lg mt-6">
                <div className="flex items-start space-x-3">
                  <Smartphone className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-800">Add Grapes to home screen</h3>
                    <p className="text-sm text-gray-700 mt-1">
                      {isInstallable 
                        ? "Your browser supports adding this app to your home screen."
                        : isIOS 
                          ? "Tap the button below for instructions on adding to your iOS home screen."
                          : "Clicking below will help add a bookmark/shortcut on your device's home screen."
                      }
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-2 border-blue-300 text-blue-800 hover:bg-blue-100"
                      onClick={addToHomeScreen}
                    >
                      {isInstallable ? "Install App" : "Add to home screen"}
                    </Button>
                    
                    {isIOS && (
                      <div className="mt-2 flex items-start space-x-2 text-xs text-blue-700">
                        <Info className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <p>On iOS: Tap the share icon (rectangle with arrow) at the bottom of your browser and scroll to find "Add to Home Screen"</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 flex flex-col items-center gap-4">
                <Button
                  variant="ghost"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={handleLogout}
                >
                  Log out
                </Button>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="link"
                      className="text-red-600 hover:text-red-700"
                    >
                      Delete my profile
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action will permanently delete your account and all associated data. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDeleteProfile}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          </div>
        </main>
      </div>
    </AppLayout>
  );
};

export default Settings;
