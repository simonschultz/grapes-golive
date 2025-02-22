import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Settings, Plus, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { NavigationFooter } from "@/components/navigation/NavigationFooter";

interface Group {
  id: string;
  title: string;
  created_by: string;
  slug: string;
  image_url: string | null;
}

const Groups = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkProfileAndLoadGroups = async () => {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError || !user) {
          navigate('/auth');
          return;
        }

        setCurrentUserId(user.id);

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single();

        if (profileError || !profile?.first_name || !profile?.last_name) {
          navigate('/welcome');
          return;
        }

        const { data: memberGroups, error: groupsError } = await supabase
          .from('groups')
          .select('*')
          .in('id', (
            await supabase
              .from('group_members')
              .select('group_id')
              .eq('user_id', user.id)
          ).data?.map(member => member.group_id) || [])
          .order('created_at', { ascending: false });

        if (groupsError) throw groupsError;
        setGroups(memberGroups || []);
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

    checkProfileAndLoadGroups();
  }, [navigate, toast]);

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center flex-1 p-4 space-y-4">
      <Users className="w-16 h-16 text-gray-400" />
      <h2 className="text-xl font-semibold text-gray-900">You have not joined any groups yet</h2>
      <p className="text-center text-gray-600">
        Create, join or ask for an invite
      </p>
      <div className="flex flex-col w-full max-w-xs gap-3">
        <Button 
          className="w-full" 
          onClick={() => navigate('/groups/create')}
        >
          Create a new group
        </Button>
        <Button 
          variant="outline"
          className="w-full" 
          onClick={() => navigate('/groups/join')}
        >
          Find groups to join
        </Button>
      </div>
    </div>
  );

  const GroupList = () => (
    <div className="flex-1 p-4">
      <div className="grid gap-4">
        {groups.map((group) => (
          <div
            key={group.id}
            className="flex items-center space-x-4 p-4 bg-white rounded-lg border hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => navigate(`/groups/${group.slug}/front`)}
          >
            <div className="w-16 h-16 rounded-lg bg-gray-100 overflow-hidden flex items-center justify-center bg-blue-100 text-blue-600">
              {group.image_url ? (
                <img 
                  src={supabase.storage.from('group-images').getPublicUrl(group.image_url).data.publicUrl}
                  alt={group.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Users className="w-8 h-8" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">{group.title}</h3>
                {group.created_by === currentUserId && (
                  <User className="h-4 w-4 text-blue-600" />
                )}
              </div>
              <p className="text-sm text-gray-600">
                {group.created_by === currentUserId ? 'Created by you' : 'Member'}
              </p>
            </div>
          </div>
        ))}
        <Button
          variant="outline"
          className="w-full mt-4"
          onClick={() => navigate('/groups/join')}
        >
          Find more groups
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex-1 pb-16 relative">
        <header className="flex justify-between items-center p-4 bg-white border-b">
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/c8d510f1-af2f-4971-a8ae-ce69e945c096.png" 
              alt="Grapes Logo" 
              className="w-8 h-8"
            />
            <h1 className="text-xl font-semibold">My groups</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-[#000080]"
            onClick={() => navigate('/settings')}
          >
            <Settings className="h-5 w-5" />
          </Button>
        </header>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-gray-600">Loading...</p>
          </div>
        ) : groups.length === 0 ? (
          <EmptyState />
        ) : (
          <GroupList />
        )}

        <Button
          className="fixed bottom-20 right-4 rounded-full w-14 h-14 shadow-lg bg-[#000080] hover:bg-[#000060]"
          onClick={() => navigate('/groups/create')}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      <NavigationFooter />
    </div>
  );
};

export default Groups;
