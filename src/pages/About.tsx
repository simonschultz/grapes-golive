
import { ChevronLeft, Users, Globe, Calendar, UserCheck, MessageSquare, Grid } from "lucide-react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { FeatureSection, FeatureItem } from "@/components/ui/feature-section";

const About = () => {
  const keyFeatures: FeatureItem[] = [{
    icon: Users,
    title: "Create private and public groups"
  }, {
    icon: Globe,
    title: "Explore public groups"
  }, {
    icon: Calendar,
    title: "Organize group events"
  }, {
    icon: UserCheck,
    title: "Manage event attendance"
  }, {
    icon: MessageSquare,
    title: "Chat with other group members"
  }, {
    icon: Grid,
    title: "Overview across all groups"
  }];
  
  return <div className="min-h-screen bg-[#FEF7CD] p-6">
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
        <img src="/lovable-uploads/92881dd8-23b0-4094-b8b7-dc39c578a6c7.png" alt="Grapes logo" className="h-24 w-24 mb-6" />
        
        <h1 className="text-3xl font-bold mb-6">About Grapes</h1>
        
        <div className="space-y-6 text-gray-700">
          <p>Grapes is a platform designed to bring people together through shared interests, activities, and communities. Whether you're organizing a book club, planning community events, or connecting with like-minded individuals, Grapes provides the tools you need to create and manage meaningful connections.</p>

          <h2 className="text-xl font-semibold mt-8">Our Mission</h2>
          <p>
            We believe that meaningful connections happen when people come together around shared interests and purposes. Our mission is to make it easy for anyone to create, join, and manage groups that matter to them. We want to create a European alternative. That respects our users, their data, social graph and interactions.
          </p>

          <h2 className="text-xl font-semibold mt-8">Key Features</h2>
          <FeatureSection items={keyFeatures} className="mt-4" columns={1} variant="clean" />

          <p className="mt-8">
            Founded with the vision of making group organization simple and accessible, we continue to develop features that help communities thrive.
          </p>

          <h2 className="text-xl font-semibold mt-8">How we manage privacy and data</h2>
          <p>
            Grapes is founded as an alternative to larger platforms harvesting data and insights on individual users. 
            We are limiting the collection of data. Only collecting data and information which is required to make the service work. 
            We do not share any of your data with others than explicitly mentioned Data Processors - like Supabase, which is the backbone and database hosting the data. All data is stored on servers in Frankfurt.
          </p>
          <p className="mt-2">
            More details can be found in our <Link to="/privacy/" className="text-[#000080] hover:text-[#000080]/80 underline">privacy policy</Link>.
          </p>
          
          <h2 className="text-xl font-semibold mt-8">A sidenote on privacy and data (May 2025)</h2>
          <p className="mt-2">
            I built Grapes in February 2025 as an alternative to eg. Meta platforms. Grapes is a secure platform with a bunch of security measures applied through eg. Supabase, where all data is hosted.
            While all data is hosted on Supabase's servers in Frankfurt (EU), Supabase is still an American company with branches in Singapore.
          </p>
          <p className="mt-2">
            I originally accepted storing data in EU with a U.S. company. But seeing how things are evolving - and how American companies are puppeteered by political stakeholders - I am looking into alternatives on how and where to store data.
          </p>
          <p className="mt-2">
            In the meantime - be aware of those structures and risks when using Grapes.
          </p>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <h2 className="text-xl font-semibold mb-4">About Simon Schultz</h2>
            <p>
              Grapes is the brainchild of <a href="https://simonschultz.dk" className="text-[#000080] hover:text-[#000080]/80 underline">Simon Schultz</a>. To create an alternative to other (great) group services available in the market. 
              We have just launched (February 21st 2025). So still building and exploring how we can make things even better. 
              If you have any questions, suggestions or comments, please write me on <span className="text-[#000080]">hi@grapes.group</span>.
            </p>
            <p className="mt-4">
              <b>Simon Schultz</b><br />
              Founder, Grapes
            </p>
          </div>
        </div>
      </div>
    </div>;
};

export default About;
