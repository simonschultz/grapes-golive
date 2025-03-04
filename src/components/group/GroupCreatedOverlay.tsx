
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface GroupCreatedOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  onShare: () => void;
  isPrivate: boolean;
}

export const GroupCreatedOverlay = ({
  isOpen,
  onClose,
  onShare,
  isPrivate,
}: GroupCreatedOverlayProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        
        <div className="text-center py-4 space-y-5">
          <h2 className="text-xl font-semibold">Congratulations!</h2>
          <p>
            You have created a <span className="font-bold">{isPrivate ? 'private' : 'public'}</span> group.
          </p>
          
          <Button 
            onClick={onShare}
            className="w-full mt-4 bg-[#000080] hover:bg-[#000080]/90"
          >
            Share group
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
