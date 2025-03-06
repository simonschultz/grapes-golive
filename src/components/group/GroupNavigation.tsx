
import { Button } from "@/components/ui/button";
import { Home, MessageSquare, Calendar, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface GroupNavigationProps {
  slug: string;
  userRole: string | null;
}

export const GroupNavigation = ({ slug, userRole }: GroupNavigationProps) => {
  const navigate = useNavigate();

  return (
    <nav className="bg-white border-b sticky top-0 z-10">
      <div className="max-w-full md:max-w-3xl mx-auto px-0 sm:px-4">
        <div className="flex justify-between">
          <Button 
            variant="ghost" 
            className="py-3 px-1 sm:py-4 md:py-6 sm:px-2 flex-1"
            onClick={() => navigate(`/groups/${slug}/front`)}
          >
            <Home className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 mr-1 sm:mr-2 md:mr-3" />
            <span className="text-xs sm:text-sm md:text-base">Front</span>
          </Button>
          <Button 
            variant="ghost" 
            className="py-3 px-1 sm:py-4 md:py-6 sm:px-2 flex-1"
            onClick={() => navigate(`/groups/${slug}/chat`)}
          >
            <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 mr-1 sm:mr-2 md:mr-3" />
            <span className="text-xs sm:text-sm md:text-base">Chat</span>
          </Button>
          <Button 
            variant="ghost" 
            className="py-3 px-1 sm:py-4 md:py-6 sm:px-2 flex-1"
            onClick={() => navigate(`/groups/${slug}/calendar`)}
          >
            <Calendar className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 mr-1 sm:mr-2 md:mr-3" />
            <span className="text-xs sm:text-sm md:text-base">Calendar</span>
          </Button>
          <Button 
            variant="ghost" 
            className="py-3 px-1 sm:py-4 md:py-6 sm:px-2 flex-1"
            onClick={() => navigate(`/groups/${slug}/members`)}
          >
            <Users className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 mr-1 sm:mr-2 md:mr-3" />
            <span className="text-xs sm:text-sm md:text-base">Members</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};
