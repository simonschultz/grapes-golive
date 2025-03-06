
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar as CalendarIcon, Clock, Home, MessageSquare, Users, Settings, Link, PlusCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const GroupEventCreate = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startDate, setStartDate] = useState<Date>();
  const [showEndDateTime, setShowEndDateTime] = useState(false);
  const [endDate, setEndDate] = useState<Date>();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    link: "",
    timeStart: "",
    timeEnd: "",
    location: "",
  });

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        const timeValue = `${formattedHour}:${formattedMinute}`;
        const displayValue = `${formattedHour}:${formattedMinute}`;
        options.push({ value: timeValue, label: displayValue });
      }
    }
    return options;
  };

  const timeOptions = generateTimeOptions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate) {
      toast({
        title: "Error",
        description: "Please select a start date for the event",
        variant: "destructive",
      });
      return;
    }
    
    if (!formData.timeStart) {
      toast({
        title: "Error",
        description: "Please select a start time for the event",
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

      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('id')
        .eq('slug', slug)
        .single();

      if (groupError || !groupData) {
        throw new Error('Group not found');
      }

      const formattedStartDate = startDate.toISOString().split('T')[0];
      
      const formattedEndDate = endDate ? endDate.toISOString().split('T')[0] : formattedStartDate;

      console.log("Creating event with data:", {
        title: formData.title,
        description: formData.description,
        date: formattedStartDate,
        end_date: formattedEndDate,
        time_start: formData.timeStart,
        time_end: formData.timeEnd || null,
        group_id: groupData.id,
        link: formData.link || null,
      });

      // Now including the link field in the insert operation
      const { data: eventData, error: eventError } = await supabase
        .from('group_events')
        .insert([
          {
            title: formData.title,
            description: formData.description,
            date: formattedStartDate,
            end_date: formattedEndDate,
            time_start: formData.timeStart,
            time_end: formData.timeEnd || null,
            location: formData.location || null,
            link: formData.link || null,
            group_id: groupData.id,
            created_by: user.id,
          }
        ])
        .select()
        .single();

      if (eventError) {
        console.error("Error creating event:", eventError);
        throw eventError;
      }

      if (!eventData) {
        throw new Error("Failed to create event: No data returned");
      }

      console.log("Event created successfully:", eventData);

      const { error: attendanceError } = await supabase
        .from('group_event_attendance')
        .insert([
          {
            event_id: eventData.id,
            user_id: user.id,
            status: 'yes'
          }
        ]);

      if (attendanceError) {
        console.error("Error creating attendance record:", attendanceError);
      }

      toast({
        title: "Success",
        description: "Event created successfully",
      });

      navigate(`/groups/${slug}/calendar/${eventData.id}`);
    } catch (error: any) {
      console.error("Error in event creation:", error);
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
              <CalendarIcon className="h-5 w-5 mr-2" />
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
              placeholder="Name your event"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your event"
              className="text-base md:text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="link">Link (optional)</Label>
            <div className="relative">
              <Link className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
              <Input
                id="link"
                type="url"
                className="pl-10"
                value={formData.link}
                onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                placeholder="Add a relevant link"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Start date *</Label>
            <div className="grid grid-cols-2 gap-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>

              <Select 
                onValueChange={(value) => setFormData(prev => ({ ...prev, timeStart: value }))} 
                value={formData.timeStart}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Start time" />
                </SelectTrigger>
                <SelectContent>
                  {timeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!showEndDateTime && (
              <Button
                type="button"
                variant="link"
                className="text-sm text-[#000080] mt-2 p-0"
                onClick={() => setShowEndDateTime(true)}
              >
                <PlusCircle className="h-3 w-3 mr-1" /> End date and time
              </Button>
            )}

            {showEndDateTime && (
              <div className="mt-4 space-y-2">
                <Label>End date and time</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !endDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? format(endDate, "PPP") : "Select end date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={endDate}
                        onSelect={setEndDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <Select 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, timeEnd: value }))} 
                    value={formData.timeEnd}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="End time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
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
