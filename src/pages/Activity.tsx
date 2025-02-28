
import { AppLayout } from "@/components/layout/AppLayout";

const Activity = () => {
  return (
    <AppLayout>
      <div className="min-h-screen bg-white flex flex-col">
        <header className="flex justify-between items-center p-4 border-b md:px-6 md:py-5">
          <h1 className="text-xl font-semibold md:text-2xl">Activity</h1>
        </header>
        
        <main className="flex-1 p-4 md:p-6">
          <div className="max-w-3xl mx-auto">
            <p className="text-center text-gray-500">
              Your activity feed will show here. Coming soon!
            </p>
          </div>
        </main>
      </div>
    </AppLayout>
  );
};

export default Activity;
