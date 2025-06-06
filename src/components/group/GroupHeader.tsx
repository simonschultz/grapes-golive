
import { Button } from "@/components/ui/button";
import { ArrowLeft, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface GroupHeaderProps {
  imageUrl: string | null;
  title: string;
}

export const GroupHeader = ({ imageUrl, title }: GroupHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white border-b">
      <div className="max-w-full mx-auto md:max-w-none">
        <div className="p-2 sm:p-4 md:hidden">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
          </Button>
        </div>
        
        <div className="relative h-36 sm:h-48 md:h-64 lg:h-72 w-full overflow-hidden bg-gray-200 flex items-center justify-center">
          {imageUrl ? (
            <img 
              src={supabase.storage.from('group-images').getPublicUrl(imageUrl).data.publicUrl}
              alt={title}
              className="w-full h-full object-cover"
            />
          ) : (
            <Users className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400" />
          )}
        </div>
      </div>
    </div>
  );
};
