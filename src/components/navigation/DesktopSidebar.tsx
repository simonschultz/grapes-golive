
import { Button } from "@/components/ui/button";
import { Home, Users, Calendar, BellRing, Settings } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useUnreadNotifications } from "@/hooks/useUnreadNotifications";

export const DesktopSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const hasUnread = useUnreadNotifications();

  const isActive = (path: string) => {
    if (path === '/front' && location.pathname === '/front') return true;
    if (path === '/groups' && location.pathname.startsWith('/groups')) return true;
    if (path === '/calendar' && location.pathname === '/calendar') return true;
    if (path === '/activity' && location.pathname === '/activity') return true;
    if (path === '/settings' && location.pathname === '/settings') return true;
    return false;
  };

  return (
    <div className="hidden md:flex flex-col w-64 border-r h-screen sticky top-0 bg-white">
      <div className="p-4 flex items-center border-b">
        <img 
          src="/lovable-uploads/c8d510f1-af2f-4971-a8ae-ce69e945c096.png" 
          alt="Grapes Logo" 
          className="w-8 h-8 mr-2"
        />
        <h1 className="text-xl font-semibold">Grapes</h1>
      </div>
      
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          <li>
            <Button 
              variant={isActive('/front') ? "secondary" : "ghost"} 
              className="w-full justify-start"
              onClick={() => navigate('/front')}
            >
              <Home className="h-5 w-5 mr-3 text-[#000080]" />
              <span>Home</span>
            </Button>
          </li>
          <li>
            <Button 
              variant={isActive('/groups') ? "secondary" : "ghost"} 
              className="w-full justify-start"
              onClick={() => navigate('/groups')}
            >
              <Users className="h-5 w-5 mr-3 text-[#000080]" />
              <span>Groups</span>
            </Button>
          </li>
          <li>
            <Button 
              variant={isActive('/calendar') ? "secondary" : "ghost"} 
              className="w-full justify-start"
              onClick={() => navigate('/calendar')}
            >
              <Calendar className="h-5 w-5 mr-3 text-[#000080]" />
              <span>Calendar</span>
            </Button>
          </li>
          <li>
            <Button 
              variant={isActive('/activity') ? "secondary" : "ghost"} 
              className="w-full justify-start relative"
              onClick={() => navigate('/activity')}
            >
              <BellRing className="h-5 w-5 mr-3 text-[#000080]" />
              {hasUnread && (
                <span className="absolute top-3 left-3 h-2 w-2 bg-red-500 rounded-full" />
              )}
              <span>Activity</span>
            </Button>
          </li>
        </ul>
      </nav>
      
      <div className="p-2 border-t">
        <Button 
          variant={isActive('/settings') ? "secondary" : "ghost"} 
          className="w-full justify-start"
          onClick={() => navigate('/settings')}
        >
          <Settings className="h-5 w-5 mr-3 text-[#000080]" />
          <span>Settings</span>
        </Button>
      </div>
    </div>
  );
};
