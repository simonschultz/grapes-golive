
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { Link } from "lucide-react";

interface GroupActionButtonProps {
  group: {
    id: string;
    title: string;
    description: string | null;
    is_private: boolean;
    created_by: string;
    slug: string;
    image_url: string | null;
  };
  userRole: string | null;
  showInline?: boolean;
  onShareClick?: () => void;
}

export const GroupActionButton = ({ group, userRole, showInline = false, onShareClick }: GroupActionButtonProps) => {
  const [isLeaveDialogOpen, setIsLeaveDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLeaveGroup = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', group.id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Successfully left the group",
      });
      setIsLeaveDialogOpen(false);
      navigate('/groups');
    } catch (error: any) {
      console.error('Error leaving group:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleJoinGroup = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      const { error } = await supabase
        .from('group_members')
        .insert({
          group_id: group.id,
          user_id: user.id,
          role: 'member'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Successfully joined the group",
      });
      navigate(`/groups/${group.slug}/front`);
    } catch (error: any) {
      console.error('Error joining group:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleCopyLink = () => {
    const groupUrl = `${window.location.origin}/groups/${group.slug}`;
    navigator.clipboard.writeText(groupUrl);
    toast({
      title: "Link copied",
      description: "Group link has been copied to your clipboard",
    });
    setIsShareDialogOpen(false);
  };

  const handleShareClick = () => {
    if (onShareClick) {
      onShareClick();
    } else {
      setIsShareDialogOpen(true);
    }
  };

  if (userRole) {
    return (
      <>
        {showInline ? (
          <div className="flex flex-col items-center gap-3 mt-6 mb-8">
            <Button
              onClick={handleShareClick}
              className="bg-[#000080] hover:bg-[#000060] text-white w-full max-w-xs"
            >
              Share group
            </Button>
            <button
              onClick={() => setIsLeaveDialogOpen(true)}
              className="text-red-600 hover:text-red-800 transition-colors font-medium text-sm"
            >
              Leave Group
            </button>
          </div>
        ) : (
          <div className="fixed bottom-20 left-0 right-0 flex justify-center gap-6">
            <button
              onClick={handleShareClick}
              className={cn(
                "text-[#221F26] hover:text-[#000080] transition-colors",
                "font-medium text-sm"
              )}
            >
              Share group
            </button>
            <button
              onClick={() => setIsLeaveDialogOpen(true)}
              className={cn(
                "text-red-600 hover:text-red-800 transition-colors",
                "font-medium text-sm"
              )}
            >
              Leave Group
            </button>
          </div>
        )}

        <AlertDialog open={isLeaveDialogOpen} onOpenChange={setIsLeaveDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Leave Group</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to leave this group? You'll need to be invited back to rejoin.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleLeaveGroup}
                className="bg-red-600 hover:bg-red-700"
              >
                Leave Group
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Share this group</DialogTitle>
              <DialogDescription>
                Share this group link with people you would want to join this group.
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center gap-2 mt-4">
              <div className="flex-1 p-3 bg-gray-50 rounded-md text-sm text-gray-600 break-all">
                {`${window.location.origin}/groups/${group.slug}`}
              </div>
              <Button
                onClick={handleCopyLink}
                className="flex items-center gap-2"
              >
                <Link className="h-4 w-4" />
                Copy link
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <div className="fixed bottom-20 left-0 right-0 flex justify-center">
      <button
        onClick={handleJoinGroup}
        className={cn(
          "bg-blue-600 hover:bg-blue-700 text-white",
          "px-4 py-2 rounded-md shadow-lg",
          "font-medium text-sm transition-colors"
        )}
      >
        Join Group
      </button>
    </div>
  );
};
