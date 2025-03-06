
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, X, HelpCircle, Calendar, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface GroupEvent {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  date: string;
  end_date: string | null;
  time_start: string;
  time_end: string | null;
  group_id: string;
}

interface Attendance {
  user_id: string;
  status: 'yes' | 'no' | 'maybe';
  profiles: {
    first_name: string | null;
    last_name: string | null;
  };
}

const GroupEventOverview = () => {
  const { slug, id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [event, setEvent] = useState<GroupEvent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [attendanceList, setAttendanceList] = useState<Attendance[]>([]);
  const [userAttendance, setUserAttendance] = useState<'yes' | 'no' | 'maybe' | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/auth');
          return;
        }

        // Fetch event details
        const { data: eventData, error: eventError } = await supabase
          .from('group_events')
          .select('*')
          .eq('id', id)
          .maybeSingle();

        if (eventError) throw eventError;
        if (!eventData) {
          navigate('/not-found');
          return;
        }

        setEvent(eventData);

        // Fetch attendance list
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('group_event_attendance')
          .select(`
            user_id,
            status,
            profiles (
              first_name,
              last_name
            )
          `)
          .eq('event_id', id);

        if (attendanceError) throw attendanceError;
        setAttendanceList(attendanceData || []);

        // Get user's attendance status
        const { data: userAttendanceData, error: userAttendanceError } = await supabase
          .from('group_event_attendance')
          .select('status')
          .eq('event_id', id)
          .eq('user_id', user.id)
          .maybeSingle();

        if (userAttendanceError) throw userAttendanceError;
        setUserAttendance(userAttendanceData?.status || null);

      } catch (error: any) {
        console.error('Error fetching event details:', error);
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

    fetchEventDetails();
  }, [id, navigate, toast]);

  const updateAttendance = async (newStatus: 'yes' | 'no' | 'maybe') => {
    try {
      setIsUpdating(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // If user already has an RSVP and tries to select a different one
      if (userAttendance && newStatus !== userAttendance) {
        toast({
          title: "Action Required",
          description: "Please deselect your original RSVP to this event before changing it",
        });
        return;
      }

      // If clicking the same status again, delete the RSVP
      if (newStatus === userAttendance) {
        const { error } = await supabase
          .from('group_event_attendance')
          .delete()
          .eq('event_id', id)
          .eq('user_id', user.id);

        if (error) throw error;
        setUserAttendance(null);
        toast({
          title: "Success",
          description: "Your RSVP has been removed",
        });
      } else {
        // If no current RSVP, add new one
        const { error } = await supabase
          .from('group_event_attendance')
          .upsert({
            event_id: id,
            user_id: user.id,
            status: newStatus,
          });

        if (error) throw error;
        setUserAttendance(newStatus);
        toast({
          title: "Success",
          description: "Your RSVP has been updated",
        });
      }

      // Refresh attendance list
      const { data: attendanceData } = await supabase
        .from('group_event_attendance')
        .select(`
          user_id,
          status,
          profiles (
            first_name,
            last_name
          )
        `)
        .eq('event_id', id);

      setAttendanceList(attendanceData || []);

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!event) return null;

  // Format date display - handle multi-day events
  const formatEventDate = () => {
    const startDate = new Date(event.date);
    
    if (event.end_date && event.end_date !== event.date) {
      const endDate = new Date(event.end_date);
      return `${format(startDate, 'EEEE, MMMM d, yyyy')} - ${format(endDate, 'EEEE, MMMM d, yyyy')}`;
    }
    
    return format(startDate, 'EEEE, MMMM d, yyyy');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-3xl mx-auto">
          <div className="p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/groups/${slug}/calendar`)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6 text-[#000080]">{event.title}</h1>
          
          <div className="space-y-6">
            <div>
              <p className="text-lg font-medium">
                {formatEventDate()}
              </p>
              <p className="text-gray-600">
                {format(new Date(`2000-01-01T${event.time_start}`), 'h:mm a')}
                {event.time_end && (
                  <> - {format(new Date(`2000-01-01T${event.time_end}`), 'h:mm a')}</>
                )}
              </p>
            </div>

            {event.description && (
              <div>
                <h2 className="text-lg font-medium mb-2">Description</h2>
                <p className="text-gray-600">{event.description}</p>
              </div>
            )}

            {event.location && (
              <div>
                <h2 className="text-lg font-medium mb-2">Location</h2>
                <div className="flex items-start text-gray-600">
                  <MapPin className="h-5 w-5 mr-2 text-gray-500" />
                  <span>{event.location}</span>
                </div>
              </div>
            )}

            <div className="border-t pt-6">
              <h2 className="text-lg font-medium mb-4">Your RSVP</h2>
              <div className="flex gap-3">
                <Button
                  onClick={() => updateAttendance('yes')}
                  variant={userAttendance === 'yes' ? 'default' : 'outline'}
                  disabled={isUpdating}
                  className={`flex items-center gap-2 ${userAttendance === 'yes' ? 'bg-[#000080] hover:bg-[#000080]/90' : ''}`}
                >
                  <Check className="h-4 w-4" />
                  Yes
                </Button>
                <Button
                  onClick={() => updateAttendance('no')}
                  variant={userAttendance === 'no' ? 'default' : 'outline'}
                  disabled={isUpdating}
                  className={`flex items-center gap-2 ${userAttendance === 'no' ? 'bg-[#000080] hover:bg-[#000080]/90' : ''}`}
                >
                  <X className="h-4 w-4" />
                  No
                </Button>
                <Button
                  onClick={() => updateAttendance('maybe')}
                  variant={userAttendance === 'maybe' ? 'default' : 'outline'}
                  disabled={isUpdating}
                  className={`flex items-center gap-2 ${userAttendance === 'maybe' ? 'bg-[#000080] hover:bg-[#000080]/90' : ''}`}
                >
                  <HelpCircle className="h-4 w-4" />
                  Maybe
                </Button>
              </div>
            </div>

            <div className="border-t pt-6">
              <h2 className="text-lg font-medium mb-4">Who's going?</h2>
              <div className="space-y-4">
                {['yes', 'maybe', 'no'].map((status) => {
                  const statusAttendees = attendanceList.filter(a => a.status === status);
                  if (statusAttendees.length === 0) return null;

                  return (
                    <div key={status}>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">
                        {status === 'yes' ? 'Going' : 
                         status === 'maybe' ? 'Maybe' : 
                         'Not going'} ({statusAttendees.length})
                      </h3>
                      <div className="space-y-2">
                        {statusAttendees.map((attendance) => (
                          <div key={attendance.user_id} className="text-sm">
                            {attendance.profiles.first_name} {attendance.profiles.last_name}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GroupEventOverview;
