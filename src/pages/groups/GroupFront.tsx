
import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GroupHeader } from "@/components/group/GroupHeader";
import { GroupNavigation } from "@/components/group/GroupNavigation";
import { GroupInfo } from "@/components/group/GroupInfo";
import { GroupActionButton } from "@/components/group/GroupActionButton";
import { GroupCreatedOverlay } from "@/components/group/GroupCreatedOverlay";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/AppLayout";

interface GroupData {
  id: string;
  title: string;
  description: string | null;
  is_private: boolean;
  created_by: string;
  slug: string;
  image_url: string | null;
}

const GroupFront = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const location = useLocation();
  const [group, setGroup] = useState<GroupData | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [showCreatedOverlay, setShowCreatedOverlay] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const hasCreatedParam = searchParams.get('created') === 'true';
    
    if (hasCreatedParam) {
      setShowCreatedOverlay(true);
      
      // Remove the query parameter without refreshing the page
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
  }, [location]);

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/auth');
          return;
        }

        setCurrentUserId(user.id);

        const { data: groupData, error: groupError } = await supabase
          .from('groups')
          .select()
          .eq('slug', slug)
          .maybeSingle();

        if (groupError) throw groupError;
        if (!groupData) {
          navigate('/not-found');
          return;
        }

        setGroup(groupData);

        const { data: memberData, error: memberError } = await supabase
          .from('group_members')
          .select('role')
          .eq('group_id', groupData.id)
          .eq('user_id', user.id)
          .maybeSingle();

        if (memberError) throw memberError;
        setUserRole(memberData?.role || null);

      } catch (error: any) {
        console.error('Error fetching group data:', error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroupData();
  }, [slug, navigate, toast]);

  const handleCopyLink = () => {
    if (!group) return;
    
    const groupUrl = `${window.location.origin}/groups/${group.slug}`;
    navigator.clipboard.writeText(groupUrl);
    toast({
      title: "Link copied",
      description: "Group link has been copied to your clipboard",
    });
    setShowShareDialog(false);
  };

  const handleShareButtonClick = () => {
    setShowShareDialog(true);
    setShowCreatedOverlay(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!group) return null;

  const canEdit = userRole === 'admin' || group.created_by === currentUserId;

  return (
    <AppLayout>
      <div className="min-h-screen bg-gray-50">
        <GroupHeader 
          title={group.title}
          imageUrl={group.image_url}
        />
        <GroupNavigation 
          slug={group.slug} 
          userRole={userRole}
        />
        <main className="max-w-full md:max-w-3xl mx-auto px-2 sm:px-4 pb-24">
          <div className="bg-white rounded-lg shadow">
            <GroupInfo 
              title={group.title}
              description={group.description}
              isPrivate={group.is_private}
            />
            {canEdit && (
              <div className="p-3 sm:p-4 border-t">
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => navigate(`/groups/${slug}/settings`)}
                >
                  Edit Group
                </Button>
              </div>
            )}
            
            {userRole && (
              <div className="p-3 sm:p-4 border-t">
                <GroupActionButton 
                  group={group} 
                  userRole={userRole} 
                  showInline={true} 
                  onShareClick={() => setShowShareDialog(true)}
                />
              </div>
            )}
          </div>
        </main>
        
        {!userRole && <GroupActionButton group={group} userRole={userRole} />}
        
        {/* Success Overlay */}
        <GroupCreatedOverlay 
          isOpen={showCreatedOverlay}
          onClose={() => setShowCreatedOverlay(false)}
          onShare={handleShareButtonClick}
          isPrivate={group.is_private}
        />
      </div>
    </AppLayout>
  );
};

export default GroupFront;
