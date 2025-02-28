
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
      <div className="max-w-3xl mx-auto px-2 md:max-w-full md:px-8">
        <div className="flex justify-start md:justify-center">
          <Button 
            variant="ghost" 
            size="icon"
            className="py-4 md:py-6 md:px-8"
            onClick={() => navigate(`/groups/${slug}/front`)}
          >
            <Home className="h-5 w-5 md:h-6 md:w-6" />
            <span className="sr-only md:not-sr-only md:ml-2 md:text-lg">Home</span>
          </Button>
          <Button 
            variant="ghost" 
            className="py-4 px-3 md:py-6 md:px-8"
            onClick={() => navigate(`/groups/${slug}/chat`)}
          >
            <MessageSquare className="h-5 w-5 md:h-6 md:w-6 md:mr-3" />
            <span className="sr-only md:not-sr-only md:text-lg">Chat</span>
          </Button>
          <Button 
            variant="ghost" 
            className="py-4 px-3 md:py-6 md:px-8"
            onClick={() => navigate(`/groups/${slug}/calendar`)}
          >
            <Calendar className="h-5 w-5 md:h-6 md:w-6 md:mr-3" />
            <span className="sr-only md:not-sr-only md:text-lg">Calendar</span>
          </Button>
          <Button 
            variant="ghost" 
            className="py-4 px-3 md:py-6 md:px-8"
            onClick={() => navigate(`/groups/${slug}/members`)}
          >
            <Users className="h-5 w-5 md:h-6 md:w-6 md:mr-3" />
            <span className="sr-only md:not-sr-only md:text-lg">Members</span>
          </Button>
        </div>
      </div>
    </nav>
  );
};
