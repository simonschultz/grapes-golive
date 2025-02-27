
import { AppLayout } from "@/components/layout/AppLayout";

const Front = () => {
  return (
    <AppLayout>
      <div className="flex-1 p-4">
        <h1 className="text-2xl font-bold mb-4">Welcome to Grapes</h1>
        <p>Your activity and upcoming events will appear here.</p>
      </div>
    </AppLayout>
  );
};

export default Front;
