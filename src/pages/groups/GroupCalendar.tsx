
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Home, MessageSquare, Calendar, Users, Bell, Settings, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface GroupData {
  id: string;
  title: string;
  description: string | null;
  is_private: boolean;
  created_by: string;
}

interface GroupEvent {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  date: string;
  time_start: string;
  time_end: string | null;
}

const GroupCalendar = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [group, setGroup] = useState<GroupData | null>(null);
  const [events, setEvents] = useState<GroupEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
        if (!memberData || (memberData.role !== 'member' && memberData.role !== 'admin')) {
          navigate(`/groups/${slug}`);
          return;
        }

        setGroup(groupData);

        // Fetch group events
        const { data: eventsData, error: eventsError } = await supabase
          .from('group_events')
          .select('*')
          .eq('group_id', groupData.id)
          .order('date', { ascending: true })
          .order('time_start', { ascending: true });

        if (eventsError) throw eventsError;
        setEvents(eventsData);

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!group) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b">
        <div className="max-w-3xl mx-auto">
          <div className="p-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold">{group.title}</h1>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate(`/groups/${slug}/settings`)}
              >
                <Settings className="h-5 w-5" />
              </Button>
            </div>
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
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6">Group Events</h2>

          {events.length === 0 ? (
            <p className="text-gray-600 text-center py-8">
              No events scheduled yet. Create your first event using the button below!
            </p>
          ) : (
            <div className="space-y-4 mb-6">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/groups/${slug}/calendar/${event.id}`)}
                >
                  <div className="flex gap-6 items-start">
                    <div className="min-w-[80px] text-center">
                      <p className="text-4xl font-bold">
                        {format(new Date(event.date), 'd')}
                      </p>
                      <p className="text-sm text-gray-600">
                        {format(new Date(event.date), 'MMM')}
                      </p>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{event.title}</h3>
                      {event.description && (
                        <p className="text-gray-600 mt-1">{event.description}</p>
                      )}
                      <p className="text-gray-600 mt-2">
                        {format(new Date(`2000-01-01T${event.time_start}`), 'h:mm a')}
                        {event.time_end && (
                          <> - {format(new Date(`2000-01-01T${event.time_end}`), 'h:mm a')}</>
                        )}
                      </p>
                      {event.location && (
                        <p className="text-gray-600 mt-2">
                          📍 {event.location}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex justify-center">
            <Button 
              onClick={() => navigate(`/groups/${slug}/calendar/create`)}
              className="flex items-center gap-2"
            >
              <Calendar className="h-5 w-5" />
              Create group event
            </Button>
          </div>
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

export default GroupCalendar;
