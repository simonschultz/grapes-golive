
import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BellRing, Calendar, MessageSquare, Users, ChevronRight, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

type Notification = {
  id: string;
  type: string;
  message: string;
  read: boolean;
  group_id: string;
  created_at: string;
  group_slug?: string; // Will be populated after fetching
};

const Activity = () => {
  const [tab, setTab] = useState("all");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Function to mark all notifications as read
  const markAllAsRead = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);
      
      if (error) throw error;
      
      // Update local state to reflect all notifications are read
      setNotifications(prevNotifications => prevNotifications.map(notification => ({
        ...notification,
        read: true
      })));
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };
  
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Get the current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error("User not authenticated");
        }
        
        // Fetch notifications for the current user
        const { data, error } = await supabase
          .from('notifications')
          .select(`
            *,
            groups:group_id (slug)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // Add the group slug to each notification for navigation
        const notificationsWithSlug = data.map((notification) => ({
          ...notification,
          group_slug: notification.groups?.slug
        }));
        
        setNotifications(notificationsWithSlug);
        
        // Mark all notifications as read when the page loads
        await markAllAsRead(user.id);
      } catch (err) {
        console.error("Error fetching notifications:", err);
        setError(err instanceof Error ? err.message : "Failed to load notifications");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchNotifications();
  }, []);
  
  // Filter notifications based on the selected tab
  const filteredNotifications = tab === "all" 
    ? notifications 
    : notifications.filter(notification => notification.type === tab);

  // Handle marking an item as read and navigating
  const handleNotificationClick = async (notification: Notification) => {
    try {
      if (!notification.read) {
        // Update the read status in the database
        const { error } = await supabase
          .from('notifications')
          .update({ read: true })
          .eq('id', notification.id);
        
        if (error) throw error;
        
        // Update the local state
        setNotifications(notifications.map(item => 
          item.id === notification.id ? { ...item, read: true } : item
        ));
      }
      
      // Navigate to the group page
      if (notification.group_slug) {
        navigate(`/groups/${notification.group_slug}`);
      }
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  };
  
  // Helper function to format the time of a notification
  const formatNotificationTime = (createdAt: string) => {
    const date = new Date(createdAt);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return "Just now";
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 172800) {
      return "Yesterday";
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} days ago`;
    }
  };
  
  // Get the appropriate icon based on notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'chat':
        return <MessageSquare className="h-4 w-4" />;
      case 'event':
        return <Calendar className="h-4 w-4" />;
      case 'member':
        return <Users className="h-4 w-4" />;
      default:
        return <BellRing className="h-4 w-4" />;
    }
  };

  return (
    <AppLayout>
      <div className="min-h-screen bg-white flex flex-col">
        <header className="flex justify-between items-center p-4 border-b md:px-6 md:py-5">
          <h1 className="text-xl font-semibold md:text-2xl">Activity</h1>
        </header>
        
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-3xl mx-auto">
            <Card className="bg-white border rounded-lg shadow-sm">
              <CardHeader className="border-b pb-3">
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <Tabs defaultValue="all" value={tab} onValueChange={setTab} className="w-full">
                <div className="px-4 pt-3">
                  <TabsList className="grid grid-cols-4 w-full">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="chat">Chat</TabsTrigger>
                    <TabsTrigger value="event">Events</TabsTrigger>
                    <TabsTrigger value="member">Members</TabsTrigger>
                  </TabsList>
                </div>
                <TabsContent value={tab} className="mt-0">
                  <CardContent className="pt-4">
                    {isLoading ? (
                      <div className="flex justify-center items-center py-8">
                        <Loader2 className="h-6 w-6 text-[#000080] animate-spin" />
                        <span className="ml-2">Loading activities...</span>
                      </div>
                    ) : error ? (
                      <div className="text-center text-red-500 py-4">
                        {error}
                      </div>
                    ) : filteredNotifications.length > 0 ? (
                      <div className="space-y-4">
                        {filteredNotifications.map((notification) => (
                          <div 
                            key={notification.id} 
                            className={`flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                            onClick={() => handleNotificationClick(notification)}
                          >
                            <div className="bg-[#000080]/10 text-[#000080] rounded-full p-2 mt-1">
                              {getNotificationIcon(notification.type)}
                            </div>
                            <div className="flex-1">
                              <p className={`text-sm ${!notification.read ? 'font-medium' : ''}`}>
                                {notification.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatNotificationTime(notification.created_at)}
                              </p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-400 mt-2" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-center text-gray-500 py-4">
                        No activities to display
                      </p>
                    )}
                  </CardContent>
                </TabsContent>
              </Tabs>
            </Card>
          </div>
        </main>
      </div>
    </AppLayout>
  );
};

export default Activity;
