
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Navigation, Group, CalendarDays, BellRing, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { AppLayout } from "@/components/layout/AppLayout";

interface PublicGroup {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  image_url: string | null;
  member_count: number;
}

const JoinGroups = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [groups, setGroups] = useState<PublicGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }
      setCurrentUser(user.id);
    };
    checkUser();
  }, [navigate]);

  useEffect(() => {
    const fetchGroups = async () => {
      if (!currentUser) return;
      
      try {
        setIsLoading(true);
        
        // Get the groups the user is already a member of
        const { data: userGroups } = await supabase
          .from('group_members')
          .select('group_id')
          .eq('user_id', currentUser);

        const userGroupIds = userGroups?.map(g => g.group_id) || [];
        
        // Base query to get public groups with member count
        let baseQuery = supabase
          .from('groups')
          .select(`
            *,
            group_members!group_members_group_id_fkey (count)
          `, { count: 'exact' })
          .eq('is_private', false);

        // If user is already a member of some groups, exclude them
        if (userGroupIds.length > 0) {
          baseQuery = baseQuery.not('id', 'in', `(${userGroupIds.join(',')})`);
        }

        // Add search if query exists
        if (searchQuery) {
          baseQuery = baseQuery.textSearch('title', searchQuery, {
            type: 'plain',
            config: 'english'
          });
        }

        const { data, error } = await baseQuery.limit(10);

        if (error) throw error;

        // Transform the data to match PublicGroup interface
        const transformedGroups = data?.map(group => ({
          id: group.id,
          title: group.title,
          description: group.description,
          slug: group.slug,
          image_url: group.image_url,
          member_count: group.group_members?.[0]?.count || 0
        })) || [];

        // Randomize the order of groups
        const shuffledGroups = [...transformedGroups].sort(() => Math.random() - 0.5);

        setGroups(shuffledGroups);
      } catch (error: any) {
        console.error('Error fetching groups:', error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroups();
  }, [currentUser, searchQuery, toast]);

  const handleJoinGroup = async (groupId: string, slug: string) => {
    if (!currentUser) return;

    try {
      const { error } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          user_id: currentUser,
          role: 'member'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Successfully joined the group",
      });
      navigate(`/groups/${slug}/front`);
    } catch (error: any) {
      console.error('Error joining group:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Mobile UI component
  const MobileView = () => (
    <div className="flex flex-col min-h-screen bg-gray-50 md:hidden">
      <div className="flex-1 pb-16">
        <header className="bg-white border-b">
          <div className="p-4">
            <h1 className="text-xl font-semibold">Join Groups</h1>
          </div>
          <div className="px-4 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search public groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </header>

        <main className="flex-1 p-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No groups found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchQuery 
                  ? "Try a different search term" 
                  : "There are no public groups available to join at the moment"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="bg-white rounded-lg border p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => navigate(`/groups/${group.slug}`)}
                      className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 hover:opacity-80 transition-opacity"
                    >
                      {group.image_url ? (
                        <img
                          src={supabase.storage.from('group-images').getPublicUrl(group.image_url).data.publicUrl}
                          alt={group.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <Users className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </button>
                    <div className="flex-1 min-w-0">
                      <button 
                        onClick={() => navigate(`/groups/${group.slug}`)}
                        className="text-left hover:underline"
                      >
                        <h3 className="text-lg font-semibold text-gray-900 truncate">
                          {group.title}
                        </h3>
                      </button>
                      {group.description && (
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                          {group.description}
                        </p>
                      )}
                      <p className="mt-1 text-sm text-gray-600">
                        {group.member_count} {group.member_count === 1 ? 'member' : 'members'}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleJoinGroup(group.id, group.slug)}
                      className="flex-shrink-0"
                    >
                      Join
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 border-t bg-white z-30">
        <div className="flex justify-around items-center h-16">
          <Button variant="ghost" className="flex flex-col items-center gap-1 h-full" onClick={() => navigate('/front')}>
            <Navigation className="h-5 w-5 text-[#000080]" />
            <span className="text-xs">Home</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center gap-1 h-full" onClick={() => navigate('/groups')}>
            <Group className="h-5 w-5 text-[#000080]" />
            <span className="text-xs">Groups</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center gap-1 h-full" onClick={() => navigate('/calendar')}>
            <CalendarDays className="h-5 w-5 text-[#000080]" />
            <span className="text-xs">Calendar</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center gap-1 h-full" onClick={() => navigate('/activity')}>
            <BellRing className="h-5 w-5 text-[#000080]" />
            <span className="text-xs">Activity</span>
          </Button>
        </div>
      </nav>
    </div>
  );

  // Desktop UI component
  const DesktopView = () => (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <header className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Find Groups to Join</h1>
            <Button onClick={() => navigate('/groups')}>Back to My Groups</Button>
          </div>
          <div className="max-w-md relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search public groups..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </header>

        <main>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-48 w-full" />
              ))}
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg border shadow-sm">
              <Users className="mx-auto h-16 w-16 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">No groups found</h3>
              <p className="mt-2 text-gray-500 max-w-md mx-auto">
                {searchQuery 
                  ? "Try a different search term" 
                  : "There are no public groups available to join at the moment"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="bg-white rounded-lg border overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div 
                    className="h-32 bg-gray-100 relative cursor-pointer"
                    onClick={() => navigate(`/groups/${group.slug}`)}
                  >
                    {group.image_url ? (
                      <img
                        src={supabase.storage.from('group-images').getPublicUrl(group.image_url).data.publicUrl}
                        alt={group.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Users className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <button 
                      onClick={() => navigate(`/groups/${group.slug}`)}
                      className="text-left hover:underline"
                    >
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {group.title}
                      </h3>
                    </button>
                    {group.description && (
                      <p className="mt-2 text-sm text-gray-500 line-clamp-3">
                        {group.description}
                      </p>
                    )}
                    <div className="mt-3 flex items-center justify-between">
                      <p className="text-sm text-gray-600">
                        {group.member_count} {group.member_count === 1 ? 'member' : 'members'}
                      </p>
                      <Button
                        onClick={() => handleJoinGroup(group.id, group.slug)}
                        className="bg-[#000080] hover:bg-[#000060]"
                      >
                        Join
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </AppLayout>
  );

  // Render different views based on screen size using CSS
  return (
    <>
      <MobileView />
      <div className="hidden md:block">
        <DesktopView />
      </div>
    </>
  );
};

export default JoinGroups;
