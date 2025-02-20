
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, MessageSquare, Calendar, Users, Settings } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const GroupEventCreate = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    timeStart: "",
    timeEnd: "",
    location: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      // Create the event
      const { data: eventData, error: eventError } = await supabase
        .from('group_events')
        .insert([
          {
            title: formData.title,
            description: formData.description,
            date: formData.date,
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
        <div className="bg-white rounded-lg shadow p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Event Title *
              </label>
              <input
                type="text"
                id="title"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>

            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Date *
              </label>
              <input
                type="date"
                id="date"
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="timeStart" className="block text-sm font-medium text-gray-700">
                  Start Time *
                </label>
                <input
                  type="time"
                  id="timeStart"
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  value={formData.timeStart}
                  onChange={(e) => setFormData(prev => ({ ...prev, timeStart: e.target.value }))}
                />
              </div>

              <div>
                <label htmlFor="timeEnd" className="block text-sm font-medium text-gray-700">
                  End Time
                </label>
                <input
                  type="time"
                  id="timeEnd"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                  value={formData.timeEnd}
                  onChange={(e) => setFormData(prev => ({ ...prev, timeEnd: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                Location
              </label>
              <input
                type="text"
                id="location"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>

            <div className="flex justify-end space-x-2">
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
              >
                Create Event
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default GroupEventCreate;
