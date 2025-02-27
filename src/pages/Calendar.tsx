
import { Button } from "@/components/ui/button";
import { Settings, CalendarIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { NavigationFooter } from "@/components/navigation/NavigationFooter";

interface Event {
  id: string;
  title: string;
  description: string | null;
  date: string;
  time_start: string;
  time_end: string | null;
  location: string | null;
  group: {
    title: string;
    slug: string;
  };
}

const CalendarPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/auth');
          return;
        }

        const { data: attendanceData, error } = await supabase
          .from('group_event_attendance')
          .select(`
            event_id,
            status,
            group_events (
              id,
              title,
              description,
              date,
              time_start,
              time_end,
              location,
              group_id,
              groups (
                title,
                slug
              )
            )
          `)
          .eq('user_id', user.id)
          .in('status', ['yes', 'maybe'])
          .order('group_events(date)', { ascending: true })
          .order('group_events(time_start)', { ascending: true });

        if (error) throw error;

        const formattedEvents = attendanceData
          .filter(attendance => attendance.group_events)
          .map(attendance => ({
            id: attendance.group_events.id,
            title: attendance.group_events.title,
            description: attendance.group_events.description,
            date: attendance.group_events.date,
            time_start: attendance.group_events.time_start,
            time_end: attendance.group_events.time_end,
            location: attendance.group_events.location,
            group: {
              title: attendance.group_events.groups.title,
              slug: attendance.group_events.groups.slug,
            }
          }));

        setEvents(formattedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [navigate]);

  // Function to get a color based on the event's group name
  const getEventColor = (groupTitle: string) => {
    // Simple hash function to generate a consistent color for each group
    const hash = groupTitle.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);
    
    // List of attractive purple and blue shades
    const colors = [
      'bg-[#9b87f5]', // Primary Purple
      'bg-[#7E69AB]', // Secondary Purple
      'bg-[#6E59A5]', // Tertiary Purple
      'bg-[#E5DEFF]', // Soft Purple
      'bg-[#8B5CF6]', // Vivid Purple
      'bg-[#0EA5E9]', // Ocean Blue
      'bg-[#33C3F0]', // Sky Blue
      'bg-[#D946EF]', // Magenta Pink
    ];
    
    // Use the hash to select a color from the array
    const colorIndex = Math.abs(hash) % colors.length;
    return colors[colorIndex];
  };

  // Function to get text color based on background color
  const getTextColor = (bgColor: string) => {
    // Darker backgrounds need white text, lighter ones need dark text
    const lightBackgrounds = ['bg-[#E5DEFF]'];
    return lightBackgrounds.includes(bgColor) ? 'text-gray-800' : 'text-white';
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <div className="flex-1 pb-16">
        <header className="flex justify-between items-center p-4 border-b">
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/c8d510f1-af2f-4971-a8ae-ce69e945c096.png" 
              alt="Grapes Logo" 
              className="w-8 h-8"
            />
            <h1 className="text-xl font-semibold">Calendar</h1>
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

        <main className="max-w-3xl mx-auto px-4 py-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <p>Loading events...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <CalendarIcon className="h-24 w-24 text-gray-400 mb-4" />
              <p className="text-xl font-semibold text-gray-900">Sorry, no upcoming events</p>
              <p className="text-gray-500 mt-2">
                All events that you (might) attend, will show up here.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {events.map((event) => {
                const bgColor = getEventColor(event.group.title);
                const textColor = getTextColor(bgColor);
                
                return (
                  <div
                    key={event.id}
                    className="rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
                    onClick={() => navigate(`/groups/${event.group.slug}/calendar/${event.id}`)}
                  >
                    <div className={`${bgColor} p-4`}>
                      <h3 className={`font-bold text-xl ${textColor}`}>{event.title}</h3>
                      <p className={`${textColor} opacity-90 text-sm font-medium mt-1`}>
                        {event.group.title}
                      </p>
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
                          <CalendarIcon className="h-4 w-4 mr-2 inline-block" />
                          <span>
                            {format(new Date(`2000-01-01T${event.time_start}`), 'h:mm a')}
                            {event.time_end && (
                              <> - {format(new Date(`2000-01-01T${event.time_end}`), 'h:mm a')}</>
                            )}
                          </span>
                        </div>
                        
                        {event.location && (
                          <div className="flex items-start text-sm text-gray-600">
                            <span className="mr-2">📍</span>
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
        </main>
      </div>

      <NavigationFooter />
    </div>
  );
};

export default CalendarPage;
