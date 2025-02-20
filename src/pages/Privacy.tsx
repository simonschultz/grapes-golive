
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-[#FFDEE2] p-6">
      <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8">
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to frontpage
      </Link>
      
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        
        <div className="space-y-6 text-gray-700">
          <p>
            Your privacy is important to us. This Privacy Policy explains how we collect, use, and protect your personal information when you use Grapes.
          </p>

          <h2 className="text-xl font-semibold">Information We Collect</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Account information (name, email)</li>
            <li>Profile information you choose to share</li>
            <li>Group membership and activity data</li>
            <li>Communication within groups</li>
            <li>Event participation data</li>
          </ul>

          <h2 className="text-xl font-semibold">How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>To provide and improve our services</li>
            <li>To facilitate group communications</li>
            <li>To send notifications about group activities</li>
            <li>To show your name and profile image in groups - and it's subpages - you are a member of</li>
            <li>To show if you are attending events</li>
          </ul>

          <h2 className="text-xl font-semibold">Data Storage and Processing</h2>
          <p>
            Our service is hosted on Vercel.com, using Vercel's standard services. All data is stored on Supabase.com, our database provider. Both services are compliant with standard security practices and data protection regulations.
          </p>

          <h2 className="text-xl font-semibold">Your Rights and Data Control</h2>
          <p>
            You have the right to delete your profile and all associated data at any time. This can be done in two ways:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Through your profile settings</li>
            <li>By sending a request to hi@grapes.group</li>
          </ul>

          <h2 className="text-xl font-semibold">Data Controller</h2>
          <p>
            The person responsible for managing your data is:
          </p>
          <p className="mt-2">
            Simon Schultz<br />
            Copenhagen, Denmark<br />
            Email: hi@grapes.group
          </p>

          <h2 className="text-xl font-semibold">Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy or our data practices, please contact us at hi@grapes.group
          </p>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
