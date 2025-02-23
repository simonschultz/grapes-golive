
import { Button } from "@/components/ui/button";
import { Home, Users, Calendar, BellRing } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUnreadNotifications } from "@/hooks/useUnreadNotifications";

export const NavigationFooter = () => {
  const navigate = useNavigate();
  const hasUnread = useUnreadNotifications();

  return (
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
        <Button variant="ghost" className="flex flex-col items-center gap-1 h-full relative" onClick={() => navigate('/activity')}>
          <BellRing className="h-5 w-5 text-[#000080] fill-[#000080]" />
          {hasUnread && (
            <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full" />
          )}
          <span className="text-xs">Activity</span>
        </Button>
      </div>
    </nav>
  );
};

