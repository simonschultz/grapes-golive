import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Home, Users, Calendar, BellRing, Settings, MessageSquare, Calendar as CalendarIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

interface Notification {
  id: string;
  type: 'chat' | 'event' | 'member';
  message: string;
  created_at: string;
  read: boolean;
  group_id: string;
  related_item_id: string;
  groups: {
    slug: string;
  };
}

const Activity = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/auth');
          return;
        }

        const { data, error } = await supabase
          .from('notifications')
          .select(`
            *,
            groups (
              slug
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(50);

        if (error) throw error;
        
        const typedData = (data || []).map(item => ({
          ...item,
          type: item.type as 'chat' | 'event' | 'member'
        }));
        
        setNotifications(typedData);

        // Mark all as read
        const { error: updateError } = await supabase
          .from('notifications')
          .update({ read: true })
          .eq('user_id', user.id)
          .eq('read', false);

        if (updateError) {
          console.error('Error marking notifications as read:', updateError);
        }
      } catch (error: any) {
        console.error('Error fetching notifications:', error);
        toast({
          title: "Error",
          description: "Failed to load notifications",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotifications();
  }, [navigate, toast]);

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'chat':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'event':
        return <CalendarIcon className="h-5 w-5 text-green-500" />;
      case 'member':
        return <Users className="h-5 w-5 text-purple-500" />;
      default:
        return <BellRing className="h-5 w-5 text-gray-500" />;
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    const { type, groups, related_item_id } = notification;
    const groupPath = `/groups/${groups.slug}`;
    
    switch (type) {
      case 'chat':
        navigate(`${groupPath}/chat`);
        break;
      case 'event':
        navigate(`${groupPath}/calendar/${related_item_id}`);
        break;
      case 'member':
        navigate(`${groupPath}/members`);
        break;
      default:
        navigate(groupPath);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex-1 pb-16">
        <header className="flex justify-between items-center p-4 border-b bg-white">
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/c8d510f1-af2f-4971-a8ae-ce69e945c096.png" 
              alt="Grapes Logo" 
              className="w-8 h-8"
            />
            <h1 className="text-xl font-semibold">Activity</h1>
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
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-start gap-4 bg-white p-4 rounded-lg border">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8 bg-white rounded-lg border">
              <BellRing className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No activity yet</h3>
              <p className="text-gray-500 mt-2">
                This is your overview of what happens in groups you have joined.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`flex items-start gap-4 p-4 rounded-lg border cursor-pointer transition-colors
                    ${notification.read ? 'bg-white' : 'bg-blue-50'} hover:bg-gray-50`}
                >
                  <div className="flex-shrink-0 mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{notification.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {format(new Date(notification.created_at), 'MMM d, h:mm a')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <nav className="fixed bottom-0 left-0 right-0 border-t bg-white z-30">
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
            <BellRing className="h-5 w-5 text-[#000080] fill-[#000080]" />
            <span className="text-xs">Activity</span>
          </Button>
        </div>
      </nav>
    </div>
  );
};

export default Activity;
