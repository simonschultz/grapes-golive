
import { LucideIcon } from "lucide-react";
import React from "react";

export interface FeatureItem {
  icon: LucideIcon;
  title: string;
  description?: string;
  onClick?: () => void;
}

interface FeatureSectionProps {
  title?: string;
  items: FeatureItem[];
  className?: string;
  variant?: "default" | "primary" | "clean";
  columns?: 1 | 2 | 3;
  iconSize?: number;
  compact?: boolean;
}

export const FeatureSection = ({
  title,
  items,
  className = "",
  variant = "default",
  columns = 2,
  iconSize = 6,
  compact = false
}: FeatureSectionProps) => {
  const getBgColor = (variant: string) => {
    if (variant === "primary") return "bg-white/10 hover:bg-white/15";
    if (variant === "clean") return ""; // No background for clean variant
    return "bg-slate-50 hover:bg-slate-100";
  };

  const getIconBgColor = (variant: string) => {
    if (variant === "primary") return "bg-white/20";
    if (variant === "clean") return ""; // No background for clean variant
    return "bg-blue-100";
  };

  const getTextColor = (variant: string) => {
    if (variant === "primary") return "text-white";
    return "text-gray-900";
  };

  const getDescriptionColor = (variant: string) => {
    if (variant === "primary") return "text-white/80";
    return "text-gray-600";
  };

  const getColumnClass = (columns: number) => {
    switch (columns) {
      case 1:
        return "grid-cols-1";
      case 2:
        return "grid-cols-1 md:grid-cols-2";
      case 3:
        return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
      default:
        return "grid-cols-1 md:grid-cols-2";
    }
  };

  const padding = compact ? "p-4" : variant === "clean" ? "py-2" : "p-6";

  return (
    <div className={className}>
      {title && (
        <h2 className={`text-2xl font-bold ${getTextColor(variant)} text-center mb-8`}>
          {title}
        </h2>
      )}
      
      <div className={`grid ${getColumnClass(columns)} gap-4`}>
        {items.map((item, index) => (
          <div 
            key={index}
            className={`${getBgColor(variant)} backdrop-blur-sm ${padding} rounded-xl transition-colors duration-300 ${item.onClick ? 'cursor-pointer' : ''}`}
            onClick={item.onClick}
          >
            <div className="flex items-center gap-3">
              <div className={`${variant !== "clean" ? "p-2" : ""} ${getIconBgColor(variant)} rounded-lg`}>
                <item.icon className={`h-${iconSize} w-${iconSize} ${getTextColor(variant)}`} />
              </div>
              <h3 className={`text-lg font-semibold ${getTextColor(variant)}`}>{item.title}</h3>
            </div>
            {item.description && variant !== "clean" && (
              <p className={`text-sm ${getDescriptionColor(variant)} mt-2`}>
                {item.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
