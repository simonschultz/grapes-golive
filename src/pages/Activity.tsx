
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BellRing, Calendar, MessageSquare, Users, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Activity = () => {
  const [tab, setTab] = useState("all");
  const navigate = useNavigate();
  
  // Sample activity items - in a real app, these would come from a database
  const activities = [
    {
      id: '1',
      type: 'chat',
      message: 'John posted a new message in Community Garden',
      time: '2 hours ago',
      read: false,
      groupSlug: 'community-garden',
      icon: <MessageSquare className="h-4 w-4" />
    },
    {
      id: '2',
      type: 'event',
      message: 'New event "Weekly Meeting" in Neighborhood Watch',
      time: 'Yesterday',
      read: true,
      groupSlug: 'neighborhood-watch',
      icon: <Calendar className="h-4 w-4" />
    },
    {
      id: '3',
      type: 'member',
      message: 'Sarah joined Book Lovers Club',
      time: '2 days ago',
      read: true,
      groupSlug: 'book-lovers',
      icon: <Users className="h-4 w-4" />
    },
    {
      id: '4',
      type: 'chat',
      message: 'New replies in "Gardening Tips" thread',
      time: '3 days ago',
      read: true,
      groupSlug: 'community-garden',
      icon: <MessageSquare className="h-4 w-4" />
    }
  ];

  // Filter activities based on the selected tab
  const filteredActivities = tab === "all" 
    ? activities 
    : activities.filter(activity => activity.type === tab);

  // Handle marking an item as read
  const handleActivityClick = (activity: any) => {
    // In a real app, this would update the read status in the database
    navigate(`/groups/${activity.groupSlug}`);
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
                    {filteredActivities.length > 0 ? (
                      <div className="space-y-4">
                        {filteredActivities.map((activity) => (
                          <div 
                            key={activity.id} 
                            className={`flex items-start gap-3 border-b pb-3 last:border-0 last:pb-0 cursor-pointer ${!activity.read ? 'bg-blue-50' : ''}`}
                            onClick={() => handleActivityClick(activity)}
                          >
                            <div className="bg-[#000080]/10 text-[#000080] rounded-full p-2 mt-1">
                              {activity.icon}
                            </div>
                            <div className="flex-1">
                              <p className={`text-sm ${!activity.read ? 'font-medium' : ''}`}>
                                {activity.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
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
              </TabsContent>
            </Card>
          </div>
        </main>
      </div>
    </AppLayout>
  );
};

export default Activity;
