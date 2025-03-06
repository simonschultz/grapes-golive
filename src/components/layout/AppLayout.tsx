
import { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { NavigationFooter } from "@/components/navigation/NavigationFooter";
import { DesktopSidebar } from "@/components/navigation/DesktopSidebar";

interface AppLayoutProps {
  children: ReactNode;
  showFooter?: boolean;
}

export const AppLayout = ({ children, showFooter = true }: AppLayoutProps) => {
  const location = useLocation();
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      <DesktopSidebar />
      
      <div className="flex-1 flex flex-col">
        <main className="flex-1">
          {children}
        </main>
        
        {showFooter && <NavigationFooter />}
      </div>
    </div>
  );
};
