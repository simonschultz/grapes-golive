
import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon, ChevronRight, Loader2, List } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Event {
  id: string;
  title: string;
  date: string;
  time_start: string;
  time_end: string | null;
  location: string | null;
  groupSlug: string;
  groupName: string;
}

const Calendar = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          navigate('/auth');
          return;
        }
        
        // Fetch events created by the user
        const { data: createdEvents, error: createdError } = await supabase
          .from('group_events')
          .select(`
            id, 
            title, 
            date, 
            time_start, 
            time_end, 
            location,
            group_id,
            groups(title, slug)
          `)
          .eq('created_by', user.id)
          .order('date', { ascending: true });
          
        if (createdError) throw createdError;
        
        // Fetch events the user has RSVP'd to with 'yes' or 'maybe'
        const { data: rsvpEvents, error: rsvpError } = await supabase
          .from('group_event_attendance')
          .select(`
            event_id,
            status,
            group_events(
              id, 
              title, 
              date, 
              time_start, 
              time_end, 
              location,
              group_id,
              groups(title, slug)
            )
          `)
          .eq('user_id', user.id)
          .in('status', ['yes', 'maybe'])
          .order('group_events.date', { ascending: true });
          
        if (rsvpError) throw rsvpError;
        
        console.log("Created events:", createdEvents);
        console.log("RSVP events:", rsvpEvents);
        
        // Format events created by the user
        const formattedCreatedEvents = createdEvents.map(event => ({
          id: event.id,
          title: event.title,
          date: event.date,
          time_start: event.time_start,
          time_end: event.time_end,
          location: event.location,
          groupSlug: event.groups?.slug || '',
          groupName: event.groups?.title || '',
        }));
        
        // Format events the user has RSVP'd to
        const formattedRsvpEvents = rsvpEvents
          .filter(item => item.group_events) // Ensure the referenced event exists
          .map(item => ({
            id: item.group_events?.id || '',
            title: item.group_events?.title || '',
            date: item.group_events?.date || '',
            time_start: item.group_events?.time_start || '',
            time_end: item.group_events?.time_end || null,
            location: item.group_events?.location || null,
            groupSlug: item.group_events?.groups?.slug || '',
            groupName: item.group_events?.groups?.title || '',
            status: item.status
          }));
        
        // Use a Map to deduplicate events (a user might have created an event and also RSVP'd to it)
        const eventMap = new Map();
        
        formattedCreatedEvents.forEach(event => {
          eventMap.set(event.id, event);
        });
        
        formattedRsvpEvents.forEach(event => {
          if (!eventMap.has(event.id)) {
            eventMap.set(event.id, event);
          }
        });
        
        // Convert Map back to array and sort by date and time
        let combinedEvents = Array.from(eventMap.values());
        combinedEvents = combinedEvents.sort((a, b) => {
          const dateA = new Date(a.date + 'T' + a.time_start);
          const dateB = new Date(b.date + 'T' + b.time_start);
          return dateA.getTime() - dateB.getTime();
        });
        
        // Filter out past events
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const upcomingEvents = combinedEvents.filter(event => {
          const eventDate = new Date(event.date);
          eventDate.setHours(0, 0, 0, 0);
          return eventDate >= today;
        });
        
        console.log("Final upcoming events:", upcomingEvents);
        setEvents(upcomingEvents);
      } catch (error: any) {
        console.error('Error fetching events:', error);
        toast({
          title: "Error",
          description: "Failed to load events. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [navigate, toast]);
  
  const formatEventDate = (eventDate: string, timeStart: string) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const date = new Date(eventDate);
    
    if (date.toDateString() === today.toDateString()) {
      return `Today at ${format(new Date(`2000-01-01T${timeStart}`), 'h:mm a')}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Tomorrow at ${format(new Date(`2000-01-01T${timeStart}`), 'h:mm a')}`;
    } else {
      return `${format(date, 'MMM d')} at ${format(new Date(`2000-01-01T${timeStart}`), 'h:mm a')}`;
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-white flex flex-col">
        <header className="flex justify-between items-center p-4 border-b md:px-6 md:py-5">
          <h1 className="text-xl font-semibold md:text-2xl">Calendar</h1>
        </header>
        
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-5xl mx-auto">
            <Card className="bg-white border rounded-lg shadow-sm">
              <CardHeader className="border-b pb-4 flex flex-row items-center">
                <List className="h-5 w-5 text-[#000080] mr-2" />
                <CardTitle>Your Events</CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                {isLoading ? (
                  <div className="flex justify-center items-center py-8">
                    <Loader2 className="h-8 w-8 text-[#000080] animate-spin" />
                  </div>
                ) : events.length > 0 ? (
                  <div className="space-y-4">
                    {events.map((event) => (
                      <div 
                        key={event.id} 
                        className="flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0 cursor-pointer"
                        onClick={() => navigate(`/groups/${event.groupSlug}/calendar/${event.id}`)}
                      >
                        <div className="bg-[#000080]/10 text-[#000080] rounded-full p-2 mt-1">
                          <CalendarIcon className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-sm">{event.title}</h3>
                          <p className="text-sm text-gray-500">{formatEventDate(event.date, event.time_start)}</p>
                          <p className="text-xs text-gray-400 mt-1">{event.groupName}</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-gray-400 mt-2" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-8">
                    No upcoming events. Join a group to participate in events!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </AppLayout>
  );
};

export default Calendar;
