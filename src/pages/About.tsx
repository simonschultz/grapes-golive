
import { ChevronLeft } from "lucide-react";
import { Link } from "react-router-dom";

const About = () => {
  return (
    <div className="min-h-screen bg-[#FEF7CD] p-6">
      <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8">
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to frontpage
      </Link>
      
      <div className="max-w-2xl mx-auto">
        <img 
          src="/lovable-uploads/92881dd8-23b0-4094-b8b7-dc39c578a6c7.png" 
          alt="Grapes logo" 
          className="h-24 w-24 mb-6"
        />
        
        <h1 className="text-3xl font-bold mb-6">About Grapes</h1>
        
        <div className="space-y-6 text-gray-700">
          <p>
            Grapes is a platform designed to bring people together through shared interests, activities, and communities. Whether you're organizing a book club, planning community events, or connecting with like-minded individuals, Grapes provides the tools you need to create and manage meaningful connections.
          </p>

          <h2 className="text-xl font-semibold mt-8">Our Mission</h2>
          <p>
            We believe that meaningful connections happen when people come together around shared interests and purposes. Our mission is to make it easy for anyone to create, join, and manage groups that matter to them.
          </p>

          <h2 className="text-xl font-semibold mt-8">Key Features</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Create and manage groups for any purpose</li>
            <li>Organize events and activities</li>
            <li>Group chat and communications</li>
            <li>Member management and permissions</li>
            <li>Calendar integration for event planning</li>
          </ul>

          <p className="mt-8">
            Founded with the vision of making group organization simple and accessible, we continue to develop features that help communities thrive.
          </p>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-xl font-semibold mb-4">About the Creator</h2>
            <p>
              Grapes is the brainchild of <a href="https://simonschultz.dk" className="text-blue-600 hover:text-blue-800 underline">Simon Schultz</a>. I have built the platform to shape a proper alternative to what else is out there. If you have any questions or comments, please write me on <span className="text-blue-600">hi@grapes.group</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
