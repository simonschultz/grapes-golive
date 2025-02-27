
import { ReactNode } from "react";
import { NavigationFooter } from "@/components/navigation/NavigationFooter";
import { DesktopSidebar } from "@/components/navigation/DesktopSidebar";

interface AppLayoutProps {
  children: ReactNode;
  hideFooter?: boolean;
}

export const AppLayout = ({ children, hideFooter = false }: AppLayoutProps) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <DesktopSidebar />
      <div className="flex-1 md:ml-64">
        <div className="flex flex-col min-h-screen">
          <main className="flex-1 pb-16 md:pb-0">
            {children}
          </main>
          {!hideFooter && <NavigationFooter />}
        </div>
      </div>
    </div>
  );
};
