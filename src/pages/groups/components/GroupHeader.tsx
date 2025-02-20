
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface GroupHeaderProps {
  title: string;
  slug: string;
}

export const GroupHeader = ({ title, slug }: GroupHeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <header className="bg-white border-b">
      <div className="max-w-3xl mx-auto">
        <div className="p-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">{title}</h1>
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
  );
};
