
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

const Terms = () => {
  return (
    <div className="min-h-screen bg-[#F2FCE2] p-6">
      <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8">
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to frontpage
      </Link>
      
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        
        <div className="space-y-6 text-gray-700">
          <p>
            By using Grapes, you agree to these terms of service. Please read them carefully.
          </p>

          <p>
            This service can be terminated without further notice.
          </p>

          <p className="mb-8">
            This service is offered - as is - by<br />
            Simon Schultz<br />
            Copenhagen, Denmark<br />
            Email: hi@grapes.group
          </p>

          <h2 className="text-xl font-semibold">Acceptable Use</h2>
          <p>
            When using Grapes, you agree to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Follow all applicable laws and regulations</li>
            <li>Respect other users' privacy and rights</li>
            <li>Provide accurate information about yourself and your groups</li>
            <li>Use the platform for its intended purpose</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8">Group Management</h2>
          <p>
            Group administrators are responsible for:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Managing group membership appropriately</li>
            <li>Ensuring group content follows our guidelines</li>
            <li>Moderating group discussions and events</li>
            <li>Protecting members' privacy</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8">Content Guidelines</h2>
          <p>
            All content must be:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Legal and appropriate</li>
            <li>Respectful of others</li>
            <li>Free from hate speech or harassment</li>
            <li>Not misleading or fraudulent</li>
          </ul>

          <p className="mt-8">
            We reserve the right to remove content or terminate accounts that violate these terms.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Terms;
