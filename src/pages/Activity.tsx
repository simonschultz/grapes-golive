
import { AppLayout } from "@/components/layout/AppLayout";

const Activity = () => {
  return (
    <AppLayout>
      <div className="flex-1 p-4">
        <div className="hidden md:flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold">Activity</h1>
        </div>
        <div className="md:hidden flex justify-between items-center p-4 bg-white border-b mb-4">
          <h1 className="text-xl font-semibold">Activity</h1>
        </div>
        <p>Your activity feed will appear here.</p>
      </div>
    </AppLayout>
  );
};

export default Activity;
