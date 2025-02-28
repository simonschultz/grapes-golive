
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Settings, Plus, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { AppLayout } from "@/components/layout/AppLayout";
import { GroupNavigation } from "@/components/group/GroupNavigation";

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
  const [userRole, setUserRole] = useState<string | null>(null);

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
        setUserRole(memberData.role);

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

  // Function to get color based on event title
  const getEventColor = (eventTitle: string) => {
    // Simple hash function to generate a consistent color for each event
    const hash = eventTitle.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    // List of attractive blue shades instead of purple
    const colors = [
      'bg-[#0EA5E9]', // Ocean Blue
      'bg-[#1EAEDB]', // Bright Blue
      'bg-[#33C3F0]', // Sky Blue
      'bg-[#0FA0CE]', // Bright Blue
      'bg-[#221F26]', // Dark Blue/Charcoal
      'bg-[#2C5282]', // Navy Blue
      'bg-[#3B82F6]', // Bright Blue
      'bg-[#1D4ED8]', // Royal Blue
    ];
    
    // Use the hash to select a color from the array
    const colorIndex = Math.abs(hash) % colors.length;
    return colors[colorIndex];
  };

  // Function to get text color based on background color
  const getTextColor = (bgColor: string) => {
    // Darker backgrounds need white text, lighter ones need dark text
    const lightBackgrounds = ['bg-[#33C3F0]'];
    return lightBackgrounds.includes(bgColor) ? 'text-gray-800' : 'text-white';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!group) return null;

  return (
    <AppLayout showFooter={false}>
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

        <GroupNavigation slug={slug || ''} userRole={userRole} />

        <main className="flex-1 max-w-3xl mx-auto px-4 py-6 mb-16">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-6">Group Events</h2>

            {events.length === 0 ? (
              <p className="text-gray-600 text-center py-8">
                No events scheduled yet. Create your first event using the button below!
              </p>
            ) : (
              <div className="space-y-6 mb-6">
                {events.map((event) => {
                  const bgColor = getEventColor(event.title);
                  const textColor = getTextColor(bgColor);
                  
                  return (
                    <div
                      key={event.id}
                      className="rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                      onClick={() => navigate(`/groups/${slug}/calendar/${event.id}`)}
                    >
                      <div className={`${bgColor} p-4`}>
                        <h3 className={`font-bold text-xl ${textColor}`}>{event.title}</h3>
                      </div>
                      
                      <div className="flex bg-white">
                        <div className="min-w-[100px] p-4 flex flex-col items-center justify-center border-r">
                          <p className="text-4xl font-bold text-gray-800">
                            {format(new Date(event.date), 'd')}
                          </p>
                          <p className="text-sm text-gray-600 uppercase font-medium">
                            {format(new Date(event.date), 'MMM')}
                          </p>
                        </div>
                        
                        <div className="p-4 flex-1">
                          {event.description && (
                            <p className="text-gray-700 mb-3">{event.description}</p>
                          )}
                          
                          <div className="flex items-center text-sm text-gray-600 mb-2">
                            <span className="flex items-center">
                              {format(new Date(`2000-01-01T${event.time_start}`), 'h:mm a')}
                              {event.time_end && (
                                <> - {format(new Date(`2000-01-01T${event.time_end}`), 'h:mm a')}</>
                              )}
                            </span>
                          </div>
                          
                          {event.location && (
                            <div className="flex items-start text-sm text-gray-600">
                              <MapPin className="h-4 w-4 mr-2" />
                              <span>{event.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            <div className="flex justify-center">
              <Button 
                onClick={() => navigate(`/groups/${slug}/calendar/create`)}
                className="flex items-center gap-2"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create group event
              </Button>
            </div>
          </div>
        </main>
      </div>
    </AppLayout>
  );
};

export default GroupCalendar;
