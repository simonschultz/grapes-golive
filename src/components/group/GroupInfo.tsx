
import { Users } from "lucide-react";

interface GroupInfoProps {
  title: string;
  description: string | null;
  isPrivate: boolean;
}

export const GroupInfo = ({ title, description, isPrivate }: GroupInfoProps) => {
  return (
    <div className="p-3 sm:p-4">
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">{title}</h1>
        <div className="flex items-center mt-2 text-gray-600">
          {isPrivate && (
            <span className="text-xs sm:text-sm bg-gray-100 px-2 py-1 rounded">Private Group</span>
          )}
        </div>
      </div>

      {description && (
        <div className="mt-3 sm:mt-4 prose max-w-none">
          <p className="text-sm sm:text-base text-gray-600">{description}</p>
        </div>
      )}
    </div>
  );
};
