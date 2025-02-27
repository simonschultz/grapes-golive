
import { AppLayout } from "@/components/layout/AppLayout";

const Calendar = () => {
  return (
    <AppLayout>
      <div className="flex-1 p-4">
        <div className="hidden md:flex justify-between items-center mb-4">
          <h1 className="text-xl font-semibold">Calendar</h1>
        </div>
        <div className="md:hidden flex justify-between items-center p-4 bg-white border-b mb-4">
          <h1 className="text-xl font-semibold">Calendar</h1>
        </div>
        <p>Your calendar events will appear here.</p>
      </div>
    </AppLayout>
  );
};

export default Calendar;
