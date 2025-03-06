
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Check, X, HelpCircle, Calendar, MapPin, Users, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { GroupHeader } from "@/components/group/GroupHeader";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface GroupEvent {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  link: string | null;
  date: string;
  end_date: string | null;
  time_start: string;
  time_end: string | null;
  group_id: string;
}

interface GroupData {
  id: string;
  title: string;
  image_url: string | null;
}

interface Attendance {
  user_id: string;
  status: 'yes' | 'no' | 'maybe';
  profiles: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
}

const GroupEventOverview = () => {
  const { slug, id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [event, setEvent] = useState<GroupEvent | null>(null);
  const [group, setGroup] = useState<GroupData | null>(null);
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

        // Fetch group details including image
        const { data: groupData, error: groupError } = await supabase
          .from('groups')
          .select('id, title, image_url')
          .eq('id', eventData.group_id)
          .maybeSingle();
          
        if (groupError) throw groupError;
        setGroup(groupData);

        // Fetch attendance list with profile images
        const { data: attendanceData, error: attendanceError } = await supabase
          .from('group_event_attendance')
          .select(`
            user_id,
            status,
            profiles (
              first_name,
              last_name,
              avatar_url
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

  if (!event || !group) return null;

  // Format date display - handle multi-day events
  const formatEventDate = () => {
    const startDate = new Date(event.date);
    
    if (event.end_date && event.end_date !== event.date) {
      const endDate = new Date(event.end_date);
      return `${format(startDate, 'EEEE, MMMM d, yyyy')} - ${format(endDate, 'EEEE, MMMM d, yyyy')}`;
    }
    
    return format(startDate, 'EEEE, MMMM d, yyyy');
  };

  // Get initials for avatar fallback
  const getInitials = (firstName: string | null, lastName: string | null) => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Add Group Header with image */}
      <GroupHeader imageUrl={group.image_url} title={group.title} />

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

            {event.link && (
              <div>
                <h2 className="text-lg font-medium mb-2">Link</h2>
                <div className="flex items-start text-gray-600">
                  <LinkIcon className="h-5 w-5 mr-2 text-gray-500" />
                  <a 
                    href={event.link.startsWith('http') ? event.link : `https://${event.link}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-[#000080] hover:underline"
                  >
                    {event.link}
                  </a>
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
              <div className="space-y-6">
                {['yes', 'maybe', 'no'].map((status) => {
                  const statusAttendees = attendanceList.filter(a => a.status === status);
                  if (statusAttendees.length === 0) return null;

                  return (
                    <div key={status}>
                      <h3 className="text-sm font-medium text-gray-500 mb-3">
                        {status === 'yes' ? 'Going' : 
                         status === 'maybe' ? 'Maybe' : 
                         'Not going'} ({statusAttendees.length})
                      </h3>
                      
                      {/* Enhance the attendees list with profile images */}
                      <div className={`${status === 'no' ? 'opacity-60' : ''}`}>
                        <div className="flex flex-wrap gap-4">
                          {statusAttendees.map((attendance) => (
                            <div key={attendance.user_id} className="flex flex-col items-center">
                              <Avatar className="w-12 h-12 mb-1">
                                {attendance.profiles.avatar_url ? (
                                  <AvatarImage 
                                    src={supabase.storage.from('avatars').getPublicUrl(attendance.profiles.avatar_url).data.publicUrl} 
                                    alt={`${attendance.profiles.first_name} ${attendance.profiles.last_name}`} 
                                  />
                                ) : (
                                  <AvatarFallback className="bg-[#000080] text-white">
                                    {getInitials(attendance.profiles.first_name, attendance.profiles.last_name) || (
                                      <Users className="h-6 w-6" />
                                    )}
                                  </AvatarFallback>
                                )}
                              </Avatar>
                              <span className="text-sm font-medium text-center">
                                {attendance.profiles.first_name} {attendance.profiles.last_name}
                              </span>
                            </div>
                          ))}
                        </div>
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
