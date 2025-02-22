import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GroupHeader } from "@/components/group/GroupHeader";
import { GroupNavigation } from "@/components/group/GroupNavigation";
import { GroupInfo } from "@/components/group/GroupInfo";
import { GroupActionButton } from "@/components/group/GroupActionButton";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { NavigationFooter } from "@/components/navigation/NavigationFooter";

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
  const [group, setGroup] = useState<GroupData | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

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
    <div className="min-h-screen bg-gray-50">
      <GroupHeader 
        title={group.title}
        imageUrl={group.image_url}
      />
      <GroupNavigation 
        slug={group.slug} 
        userRole={userRole}
      />
      <main className="max-w-3xl mx-auto p-4 pb-24">
        <div className="bg-white rounded-lg shadow">
          <GroupInfo 
            title={group.title}
            description={group.description}
            isPrivate={group.is_private}
          />
          {canEdit && (
            <div className="p-4 border-t">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => navigate(`/groups/${slug}/settings`)}
              >
                Edit Group
              </Button>
            </div>
          )}
        </div>
      </main>
      <GroupActionButton group={group} userRole={userRole} />
      <NavigationFooter />
    </div>
  );
};

export default GroupFront;
