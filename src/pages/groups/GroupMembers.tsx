import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/AppLayout";
import { GroupNavigation } from "@/components/group/GroupNavigation";

interface GroupMember {
  user_id: string;
  role: string;
  created_at: string;
  profiles: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
}

interface GroupData {
  id: string;
  title: string;
  created_by: string;
}

const GroupMembers = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [group, setGroup] = useState<GroupData | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [requests, setRequests] = useState<GroupMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
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
          .eq('slug', slug || '')
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
        if (!memberData || (memberData.role !== 'member' && memberData.role !== 'admin')) {
          navigate(`/groups/${slug}`);
          return;
        }

        setUserRole(memberData.role);

        const { data: membersData, error: membersError } = await supabase
          .from('group_members')
          .select(`
            user_id,
            role,
            created_at,
            profiles:user_id (
              first_name,
              last_name,
              avatar_url
            )
          `)
          .eq('group_id', groupData.id)
          .in('role', ['member', 'admin'])
          .order('role', { ascending: false });

        if (membersError) throw membersError;
        setMembers(membersData || []);

        if (memberData.role === 'admin' || groupData.created_by === user.id) {
          const { data: requestsData, error: requestsError } = await supabase
            .from('group_members')
            .select(`
              user_id,
              role,
              created_at,
              profiles:user_id (
                first_name,
                last_name,
                avatar_url
              )
            `)
            .eq('group_id', groupData.id)
            .eq('role', 'request');

          if (requestsError) throw requestsError;
          setRequests(requestsData || []);
        }
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

  const handleApproveJoinRequest = async (userId: string) => {
    try {
      if (!group) return;

      const { error } = await supabase
        .from('group_members')
        .update({ role: 'member' })
        .eq('group_id', group.id)
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User added to the group",
      });

      setRequests(prev => prev.filter(r => r.user_id !== userId));
      const approvedUser = requests.find(r => r.user_id === userId);
      if (approvedUser) {
        approvedUser.role = 'member';
        setMembers(prev => [...prev, approvedUser]);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRejectJoinRequest = async (userId: string) => {
    try {
      if (!group) return;

      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', group.id)
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Join request rejected",
      });

      setRequests(prev => prev.filter(r => r.user_id !== userId));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handlePromoteToAdmin = async (userId: string) => {
    try {
      if (!group) return;

      const { error } = await supabase
        .from('group_members')
        .update({ role: 'admin' })
        .eq('group_id', group.id)
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "User promoted to admin",
      });

      setMembers(prev => prev.map(member => 
        member.user_id === userId 
          ? { ...member, role: 'admin' } 
          : member
      ));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      if (!group) return;

      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', group.id)
        .eq('user_id', userId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Member removed from group",
      });

      setMembers(prev => prev.filter(member => member.user_id !== userId));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!group) return null;

  const isAdmin = userRole === 'admin' || group.created_by === currentUserId;

  return (
    <AppLayout showFooter={false}>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white border-b">
          <div className="max-w-3xl mx-auto">
            <div className="px-3 sm:px-4 py-4 flex items-center justify-between">
              <h1 className="text-xl font-semibold">{group.title}</h1>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate(`/groups/${slug}/settings`)}
              >
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        <GroupNavigation slug={slug || ''} userRole={userRole} />

        <main className="flex-1 max-w-3xl mx-auto px-3 sm:px-4 py-6">
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Members</h2>
              
              <div className="space-y-4">
                {members.map((member) => (
                  <div key={member.user_id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={member.profiles.avatar_url || undefined} />
                        <AvatarFallback>
                          {member.profiles.first_name?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {member.profiles.first_name} {member.profiles.last_name}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {member.role === 'admin' ? 'Admin' : 'Member'}
                        </div>
                      </div>
                    </div>
                    
                    {isAdmin && member.user_id !== currentUserId && (
                      <div className="flex gap-2">
                        {member.role !== 'admin' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handlePromoteToAdmin(member.user_id)}
                          >
                            Make Admin
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleRemoveMember(member.user_id)}
                        >
                          Remove
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
            
            {isAdmin && requests.length > 0 && (
              <div className="border-t p-6">
                <h2 className="text-xl font-semibold mb-4">Join Requests</h2>
                
                <div className="space-y-4">
                  {requests.map((request) => (
                    <div key={request.user_id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={request.profiles.avatar_url || undefined} />
                          <AvatarFallback>
                            {request.profiles.first_name?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="font-medium">
                          {request.profiles.first_name} {request.profiles.last_name}
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={() => handleApproveJoinRequest(request.user_id)}
                        >
                          Approve
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleRejectJoinRequest(request.user_id)}
                        >
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </AppLayout>
  );
};

export default GroupMembers;
