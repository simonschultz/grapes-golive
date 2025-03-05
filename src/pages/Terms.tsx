
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
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-gray-600 mb-6">March 5th, 2025</p>
        
        <div className="space-y-6 text-gray-700">
          <p>
            These are our terms of service for Grapes. If you are reading these terms, you would probably also be interested in our <Link to="/privacy" className="text-[#000080] underline">privacy policy</Link>.
          </p>

          <p>
            We are trying to make things simple and understandable. But feel free to contact us, if you have any questions or comments.
          </p>

          <h2 className="text-xl font-semibold pt-4">Introduction</h2>
          <p>
            When registering your account on Grapes, you agree to our terms of service and privacy policy.<br />
            The Grapes website grapes.group ("the service") is fully operated by Commis. We operate out of Copenhagen, Denmark.
          </p>
          <p>
            Grapes allows you to browse public available groups, to create your own public or private groups and to interact with other group members.
          </p>

          <h2 className="text-xl font-semibold pt-4">Our Service</h2>
          <p>
            By agreeing to our Terms of Service you can use our service at your own risk.
          </p>
          <p>
            Grapes may be changed, updated, interrupted or discontinued at any time without notice or liability (though we hope it won't happen).
          </p>

          <h2 className="text-xl font-semibold pt-4">Creating a User Account</h2>
          <p>
            It is required to create a user account to interact in groups.
          </p>
          <p>
            When you are creating a user account, all information should be be precise and correct. Eg. random aliases are not allowed.
          </p>

          <h2 className="text-xl font-semibold pt-4">User Generated Content</h2>
          <p>
            Grapes allows you to post the content to groups managed on Grapes.<br />
            Content means all information, data, comments, images, graphics, links etc. related to functionality within groups.
          </p>
          <p>
            All content posted by the user - privately or publicly is the responsibility of the user.<br />
            You also confirm, that you have the right to invite other users to the Grapes platform, when eg. distributing links to groups.
          </p>
          <p>
            You acknowledge that you will post content at your own risk.
          </p>
          <p>
            You confirm that you will not infringe or violate any 3rd parties and their copyright when you post to the Grapes platform. This includes any trademark, patents, privacy rights and rights of publicity.<br />
            When posting content to Grapes - whether privately or publicly - you grant Grapes the right to distribute the content on the platform. You also grant Grapes the right to display, modify, reproduce and adapt the submission in order to fit the content to the service in the absolute best manner.
          </p>
          <p>
            You are not allowed to post any nudity, unlawful, hateful and offensive material, spam or irrelevant information.
          </p>
          <p>
            Grapes has the right to take editorial actions and prioritize content in relation to our editorial requirements.
          </p>

          <h2 className="text-xl font-semibold pt-4">Liability</h2>
          <p>
            Grapes cannot be held liable for any indirect, incidental, special, exemplary, reliance, consequential or punitive damages, including without limitation, loss of profits, business interruption, reputational harm, data, use, goodwill, or other intangible losses.
          </p>

          <h2 className="text-xl font-semibold pt-4">Termination</h2>
          <p>
            You can terminate the terms of service by deleting your account on the website, or by writing customer support directly on hi@grapes.group.
          </p>

          <h2 className="text-xl font-semibold pt-4">Disclaimer</h2>
          <p>
            The service is provided "as is".<br />
            You will be using Grapes at your own discretion and sole risk.
          </p>

          <h2 className="text-xl font-semibold pt-4">Changes to Terms of Service</h2>
          <p>
            Grapes reserves the right to modify or change these Terms of Service at any given time.
          </p>
          <p>
            Any changes will be communicated on the website and by email to all registered users.
          </p>

          <h2 className="text-xl font-semibold pt-4">Governing Law</h2>
          <p>
            Our Terms of Service shall be governed by and construed in accordance with the laws of Denmark.
          </p>

          <h2 className="text-xl font-semibold pt-4">Contact</h2>
          <p>
            Grapes is published, operated and owned by Simon Schultz, Commis
          </p>
          <p className="mt-2">
            Commis<br />
            Nørrebro<br />
            2200 Copenhagen N, Denmark<br />
            hi@grapes.group
          </p>
        </div>
      </div>
    </div>
  );
};

export default Terms;
