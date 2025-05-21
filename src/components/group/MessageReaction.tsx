
import React from "react";
import { Smile, Meh, Frown } from "lucide-react";
import { cn } from "@/lib/utils";

type ReactionType = "smile" | "meh" | "frown";

interface MessageReactionProps {
  type: ReactionType;
  count: number;
  active: boolean;
  onClick: () => void;
}

const reactionIcons = {
  smile: Smile,
  meh: Meh,
  frown: Frown,
};

const MessageReaction: React.FC<MessageReactionProps> = ({
  type,
  count,
  active,
  onClick,
}) => {
  const Icon = reactionIcons[type];

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
  };

  return (
    <button
      className={cn(
        "inline-flex items-center gap-1 rounded-full py-1 px-2 text-xs transition-colors",
        active
          ? "bg-[#D3E4FD] text-[#000080]"
          : "bg-[#F1F1F1] text-gray-500 hover:bg-[#E3E3E3]"
      )}
      onClick={handleClick}
      aria-pressed={active}
      title={active ? `Remove ${type} reaction` : `React with ${type}`}
    >
      <Icon className="h-3 w-3" />
      {count > 0 && <span>{count}</span>}
    </button>
  );
};

export default MessageReaction;
