
import { ChevronLeft, Users, Globe, Calendar, UserCheck, MessageSquare, Grid } from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { FeatureSection, FeatureItem } from "@/components/ui/feature-section";

const About = () => {
  const keyFeatures: FeatureItem[] = [
    {
      icon: Users,
      title: "Create private and public groups",
      description: "Start groups for any purpose and control who can join"
    },
    {
      icon: Globe,
      title: "Explore public groups",
      description: "Discover and join groups that match your interests"
    },
    {
      icon: Calendar,
      title: "Organize group events",
      description: "Schedule and manage events for your group members"
    },
    {
      icon: UserCheck,
      title: "Manage event attendance",
      description: "Track RSVPs and manage who's attending your events"
    },
    {
      icon: MessageSquare,
      title: "Chat with other group members",
      description: "Communicate easily with everyone in your groups"
    },
    {
      icon: Grid,
      title: "Overview across all groups",
      description: "See all your group activities in one convenient place"
    }
  ];

  return (
    <div className="min-h-screen bg-[#FEF7CD] p-6">
      <Helmet>
        <title>About Grapes</title>
        <meta name="description" content="Learn more about Grapes, a platform designed to bring people together through shared interests and communities." />
        <meta property="og:title" content="About Grapes" />
        <meta property="og:description" content="Learn more about Grapes, a platform designed to bring people together through shared interests and communities." />
        <meta property="og:image" content="/lovable-uploads/987d0824-15e3-4e4a-b4e8-535baf108d42.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="About Grapes" />
        <meta name="twitter:description" content="Learn more about Grapes, a platform designed to bring people together through shared interests and communities." />
        <meta name="twitter:image" content="/lovable-uploads/987d0824-15e3-4e4a-b4e8-535baf108d42.png" />
      </Helmet>
      
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
          <FeatureSection 
            items={keyFeatures} 
            className="mt-4" 
            columns={1}
          />

          <p className="mt-8">
            Founded with the vision of making group organization simple and accessible, we continue to develop features that help communities thrive.
          </p>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-xl font-semibold mb-4">About Simon Schultz</h2>
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
