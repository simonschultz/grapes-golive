
import { useState } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Calendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const navigate = useNavigate();
  
  // Sample upcoming events - in a real app, these would come from a database
  const upcomingEvents = [
    {
      id: '1',
      title: 'Weekly Group Meeting',
      date: 'Tomorrow at 6:00 PM',
      groupSlug: 'community-garden'
    },
    {
      id: '2',
      title: 'Neighborhood Cleanup',
      date: 'Saturday at 10:00 AM',
      groupSlug: 'neighborhood-watch'
    },
    {
      id: '3',
      title: 'Book Club Discussion',
      date: 'Next Tuesday at 7:30 PM',
      groupSlug: 'book-lovers'
    }
  ];

  return (
    <AppLayout>
      <div className="min-h-screen bg-white flex flex-col">
        <header className="flex justify-between items-center p-4 border-b md:px-6 md:py-5">
          <h1 className="text-xl font-semibold md:text-2xl">Calendar</h1>
        </header>
        
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-3xl mx-auto">
            <div className="grid gap-6 md:grid-cols-[1fr_300px]">
              {/* Calendar */}
              <Card className="bg-white border rounded-lg shadow-sm">
                <CardHeader className="border-b pb-3">
                  <CardTitle>Select a Date</CardTitle>
                </CardHeader>
                <CardContent className="pt-4 flex justify-center">
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    className="rounded-md border"
                  />
                </CardContent>
              </Card>
              
              {/* Upcoming Events */}
              <Card className="bg-white border rounded-lg shadow-sm">
                <CardHeader className="border-b pb-3">
                  <CardTitle>Upcoming Events</CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  {upcomingEvents.length > 0 ? (
                    <div className="space-y-4">
                      {upcomingEvents.map((event) => (
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
                            <p className="text-sm text-gray-500">{event.date}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 text-gray-400 mt-2" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 py-4">
                      No upcoming events
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </AppLayout>
  );
};

export default Calendar;
