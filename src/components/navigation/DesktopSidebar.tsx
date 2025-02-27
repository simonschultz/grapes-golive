
import { Button } from "@/components/ui/button";
import { Home, Users, Calendar, BellRing, Settings } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUnreadNotifications } from "@/hooks/useUnreadNotifications";

export const DesktopSidebar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const hasUnread = useUnreadNotifications();

  const isActive = (path: string) => {
    return pathname.startsWith(path);
  };

  return (
    <div className="hidden md:flex flex-col w-64 h-screen bg-white border-r">
      <div className="p-4 border-b flex items-center gap-2">
        <img 
          src="/lovable-uploads/c8d510f1-af2f-4971-a8ae-ce69e945c096.png" 
          alt="Grapes Logo" 
          className="w-8 h-8"
        />
        <span className="text-xl font-semibold">Grapes</span>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <Button
              variant={isActive('/front') ? "default" : "ghost"}
              className={`w-full justify-start gap-2 ${isActive('/front') ? 'bg-[#000080] text-white' : 'text-gray-700'}`}
              onClick={() => navigate('/front')}
            >
              <Home className="h-5 w-5" />
              <span>Home</span>
            </Button>
          </li>
          <li>
            <Button
              variant={isActive('/groups') ? "default" : "ghost"}
              className={`w-full justify-start gap-2 ${isActive('/groups') ? 'bg-[#000080] text-white' : 'text-gray-700'}`}
              onClick={() => navigate('/groups')}
            >
              <Users className="h-5 w-5" />
              <span>Groups</span>
            </Button>
          </li>
          <li>
            <Button
              variant={isActive('/calendar') ? "default" : "ghost"}
              className={`w-full justify-start gap-2 ${isActive('/calendar') ? 'bg-[#000080] text-white' : 'text-gray-700'}`}
              onClick={() => navigate('/calendar')}
            >
              <Calendar className="h-5 w-5" />
              <span>Calendar</span>
            </Button>
          </li>
          <li>
            <Button
              variant={isActive('/activity') ? "default" : "ghost"}
              className={`w-full justify-start gap-2 relative ${isActive('/activity') ? 'bg-[#000080] text-white' : 'text-gray-700'}`}
              onClick={() => navigate('/activity')}
            >
              <BellRing className="h-5 w-5" />
              <span>Activity</span>
              {hasUnread && (
                <span className="absolute top-2 right-2 h-2 w-2 bg-red-500 rounded-full" />
              )}
            </Button>
          </li>
          <li>
            <Button
              variant={isActive('/settings') ? "default" : "ghost"}
              className={`w-full justify-start gap-2 ${isActive('/settings') ? 'bg-[#000080] text-white' : 'text-gray-700'}`}
              onClick={() => navigate('/settings')}
            >
              <Settings className="h-5 w-5" />
              <span>Settings</span>
            </Button>
          </li>
        </ul>
      </nav>
      <div className="p-4 border-t">
        <div className="text-xs text-gray-500">
          © 2024 Grapes Group
        </div>
      </div>
    </div>
  );
};
