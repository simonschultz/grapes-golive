
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock, Home, MessageSquare, Users, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

const GroupEventCreate = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState<Date>();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    timeStart: "",
    timeEnd: "",
    location: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!date) {
      toast({
        title: "Error",
        description: "Please select a date for the event",
        variant: "destructive",
      });
      return;
    }
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/auth');
        return;
      }

      // Get group ID from slug
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('id')
        .eq('slug', slug)
        .single();

      if (groupError || !groupData) {
        throw new Error('Group not found');
      }

      // Format date as ISO string and extract just the date part
      const formattedDate = date.toISOString().split('T')[0];

      // Create the event
      const { data: eventData, error: eventError } = await supabase
        .from('group_events')
        .insert([
          {
            title: formData.title,
            description: formData.description,
            date: formattedDate,
            time_start: formData.timeStart,
            time_end: formData.timeEnd || null,
            location: formData.location || null,
            group_id: groupData.id,
            created_by: user.id,
          }
        ])
        .select()
        .single();

      if (eventError) throw eventError;

      // Create attendance record for creator
      await supabase
        .from('group_event_attendance')
        .insert([
          {
            event_id: eventData.id,
            user_id: user.id,
            status: 'yes'
          }
        ]);

      toast({
        title: "Success",
        description: "Event created successfully",
      });

      navigate(`/groups/${slug}/calendar/${eventData.id}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b">
        <div className="max-w-3xl mx-auto">
          <div className="p-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold">Create Event</h1>
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

      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6 bg-white rounded-lg shadow p-6">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title *</Label>
            <Input
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter event title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Add event description"
              className="text-base md:text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label>Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : "Select date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <CalendarComponent
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeStart">Start Time *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  id="timeStart"
                  type="time"
                  required
                  className="pl-10"
                  value={formData.timeStart}
                  onChange={(e) => setFormData(prev => ({ ...prev, timeStart: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeEnd">End Time</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                <Input
                  id="timeEnd"
                  type="time"
                  className="pl-10"
                  value={formData.timeEnd}
                  onChange={(e) => setFormData(prev => ({ ...prev, timeEnd: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              placeholder="Add location"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/groups/${slug}/calendar`)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[#000080] hover:bg-[#000080]/90"
            >
              Create Event
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default GroupEventCreate;
