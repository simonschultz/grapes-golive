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
            <div className="space-y-4">
              {events.map((event) => (
                <div
                  key={event.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                  onClick={() => navigate(`/groups/${event.group.slug}/calendar/${event.id}`)}
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
                      <p className="text-sm text-blue-600 mt-1">
                        {event.group.title}
                      </p>
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
        </main>
      </div>

      <NavigationFooter />
    </div>
  );
};

export default CalendarPage;
