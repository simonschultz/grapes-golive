
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Home, MessageSquare, Calendar, Users, Bell, Settings, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface GroupData {
  id: string;
  title: string;
  description: string | null;
  is_private: boolean;
  created_by: string;
}

interface MemberData {
  profiles: {
    id: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
  role: string;
}

const GroupMembers = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [group, setGroup] = useState<GroupData | null>(null);
  const [members, setMembers] = useState<MemberData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/auth');
          return;
        }

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

        const { data: memberData, error: memberError } = await supabase
          .from('group_members')
          .select('role')
          .eq('group_id', groupData.id)
          .eq('user_id', user.id)
          .maybeSingle();

        if (memberError) throw memberError;
        if (!memberData) {
          navigate(`/groups/${slug}`);
          return;
        }

        setIsAdmin(memberData.role === 'admin');
        setGroup(groupData);

        // Fetch all members with their profile information
        // Order by role to show requests first, then admins, then regular members
        const { data: membersData, error: membersError } = await supabase
          .from('group_members')
          .select(`
            role,
            profiles (
              id,
              first_name,
              last_name,
              avatar_url
            )
          `)
          .eq('group_id', groupData.id)
          .order('role', { ascending: false });

        if (membersError) throw membersError;
        
        // Sort members to show requests first, then admins, then members
        const sortedMembers = (membersData || []).sort((a, b) => {
          const roleOrder = { request: 0, admin: 1, member: 2 };
          return (roleOrder[a.role as keyof typeof roleOrder] || 0) - (roleOrder[b.role as keyof typeof roleOrder] || 0);
        });
        
        setMembers(sortedMembers);

      } catch (error: any) {
        console.error('Error checking access:', error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        navigate('/not-found');
      } finally {
        setIsLoading(false);
      }
    };

    checkAccess();
  }, [slug, navigate, toast]);

  const handleAcceptRequest = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('group_members')
        .update({ role: 'member' })
        .eq('group_id', group!.id)
        .eq('user_id', userId);

      if (error) throw error;

      // Update the local state
      setMembers(members.map(member => 
        member.profiles.id === userId 
          ? { ...member, role: 'member' }
          : member
      ));

      toast({
        title: "Success",
        description: "Member request accepted",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleRejectRequest = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', group!.id)
        .eq('user_id', userId);

      if (error) throw error;

      // Update the local state
      setMembers(members.filter(member => member.profiles.id !== userId));

      toast({
        title: "Success",
        description: "Member request rejected",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'request':
        return 'Requested access';
      case 'admin':
        return 'Admin';
      case 'member':
        return 'Member';
      default:
        return role;
    }
  };

  const renderMemberItem = (member: MemberData) => {
    const profile = member.profiles;
    const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ') || 'Unnamed Member';
    const memberIsAdmin = member.role === 'admin';
    const isRequest = member.role === 'request';

    return (
      <div 
        key={profile.id}
        className="flex items-center space-x-4 p-4 bg-white rounded-lg border w-full max-w-xl mx-auto"
      >
        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
          {profile.avatar_url ? (
            <img 
              src={profile.avatar_url}
              alt={fullName}
              className="w-full h-full object-cover"
            />
          ) : (
            <Users className="w-6 h-6 text-gray-500" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900 truncate">{fullName}</span>
            {memberIsAdmin && (
              <Shield className="h-4 w-4 text-blue-600 flex-shrink-0" aria-label="Administrator" />
            )}
          </div>
          <p className="text-sm text-gray-600">{getRoleDisplay(member.role)}</p>
          {isAdmin && isRequest && (
            <div className="mt-2 space-x-4 text-sm">
              <button 
                onClick={() => handleAcceptRequest(profile.id)}
                className="text-blue-600 hover:underline"
              >
                Accept
              </button>
              <button 
                onClick={() => handleRejectRequest(profile.id)}
                className="text-red-600 hover:underline"
              >
                Reject
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white border-b">
          <div className="max-w-3xl mx-auto">
            <div className="p-4">
              <Skeleton className="h-6 w-32" />
            </div>
          </div>
        </header>
        <nav className="bg-white border-b">
          <div className="max-w-3xl mx-auto px-2">
            <Skeleton className="h-14 w-full" />
          </div>
        </nav>
        <main className="flex-1 max-w-3xl mx-auto px-4 py-6">
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!group) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b">
        <div className="max-w-3xl mx-auto">
          <div className="p-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold">{group?.title}</h1>
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

      <nav className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-2">
          <div className="flex">
            <Button 
              variant="ghost" 
              size="icon"
              className="py-4"
              onClick={() => navigate(`/groups/${slug}/front`)}
            >
              <Home className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              className="py-4 px-3"
              onClick={() => navigate(`/groups/${slug}/chat`)}
            >
              <MessageSquare className="h-5 w-5 mr-2" />
              Chat
            </Button>
            <Button 
              variant="ghost" 
              className="py-4 px-3"
              onClick={() => navigate(`/groups/${slug}/calendar`)}
            >
              <Calendar className="h-5 w-5 mr-2" />
              Calendar
            </Button>
            <Button 
              variant="ghost" 
              className="py-4 px-3"
              onClick={() => navigate(`/groups/${slug}/members`)}
            >
              <Users className="h-5 w-5 mr-2" />
              Members
            </Button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-3xl mx-auto px-4 py-6 mb-16">
        <div className="space-y-4">
          {members.map(member => renderMemberItem(member))}
        </div>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 border-t bg-white z-10">
        <div className="flex justify-around items-center h-16">
          <Button variant="ghost" className="flex flex-col items-center gap-1 h-full" onClick={() => navigate('/front')}>
            <Home className="h-5 w-5 text-[#000080] fill-[#000080]" />
            <span className="text-xs">Home</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center gap-1 h-full" onClick={() => navigate('/groups')}>
            <Users className="h-5 w-5 text-[#000080] fill-[#000080]" />
            <span className="text-xs">Groups</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center gap-1 h-full" onClick={() => navigate('/calendar')}>
            <Calendar className="h-5 w-5 text-[#000080] fill-[#000080]" />
            <span className="text-xs">Calendar</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center gap-1 h-full" onClick={() => navigate('/activity')}>
            <Bell className="h-5 w-5 text-[#000080] fill-[#000080]" />
            <span className="text-xs">Activity</span>
          </Button>
        </div>
      </nav>
    </div>
  );
};

export default GroupMembers;
