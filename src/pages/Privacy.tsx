
import { ChevronLeft, Lock, Shield, Users, Info, Mail, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-[#F2FCE2] p-6">
      <Link to="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8">
        <ChevronLeft className="h-4 w-4 mr-1" />
        Back to frontpage
      </Link>
      
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center mb-2">
          <Shield className="h-6 w-6 text-[#000080] mr-2" />
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
        </div>
        <p className="text-gray-600 mb-6">March 5th, 2025</p>
        
        <div className="space-y-6 text-gray-700">
          <section>
            <h2 className="text-xl font-semibold flex items-center pt-4">
              <Info className="h-5 w-5 text-[#000080] mr-2" />
              Introduction
            </h2>
            <p className="mt-2">
              I am Simon Schultz (Commis). And I am operating Grapes.group ("the service") out of beautiful Copenhagen.
            </p>
            <p className="mt-2">
              The following privacy policy should give you a fair understanding of how we collect, store, process, use and disclose any data in relation to using our service.
            </p>
            <p className="mt-2">
              I respect you as a customer.
            </p>
            <p className="mt-2">
              I treat your privacy and data as we want our own privacy and data to be treated.
            </p>
            <p className="mt-2">
              I will not share any of your personal information with any third parties.
            </p>
            <p className="mt-2">
              I am doing my best to be the good guy :-)
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold flex items-center pt-4">
              <CheckCircle className="h-5 w-5 text-[#000080] mr-2" />
              Your Accept
            </h2>
            <p className="mt-2">
              Using and interacting with the service is seen as an accept of this Privacy Policy.
            </p>
            <p className="mt-2">
              Consent will be given actively when creating a user profile the first time.
            </p>
            <p className="mt-2">
              When you are visiting our website we will collect information for five main purposes:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Statistics - How is our service being used? - so we can improve it</li>
              <li>Creating Profiles - creating a user profile to interact and identify for other group members</li>
              <li>Creating groups - creating and managing a private or public group</li>
              <li>Managing events - Creating and managing events within groups. Including RSVPs</li>
              <li>Interactions - interactions in any format like images and text</li>
            </ul>
            <p className="mt-2">
              Details on how data is being collected, processed and used can be found in details in the following sections.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold flex items-center pt-4">
              <Users className="h-5 w-5 text-[#000080] mr-2" />
              Data Collection
            </h2>
            <p className="mt-2">
              We are segmenting our users in two different groups:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Admininistrators - Users who have created and have management rights in groups</li>
              <li>Members - Any user who are a member of one or more groups</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold flex items-center pt-4">
              <Users className="h-5 w-5 text-[#000080] mr-2" />
              Anonymous Website Users
            </h2>
            <p className="mt-2">
              Only little anonymous data will be collected while browsing our website.
              Used for us to better understand how Stuff is working out for you guys.
            </p>
            <p className="mt-2">
              The data collected is mainly technical information - eg. browser type, screen size, device etc.
            </p>
            <p className="mt-2">
              Other data we are collecting, processing or using:
            </p>
            <ul className="list-disc pl-6 mt-2">
              <li>Your IP address - To determine which country you are in</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold flex items-center pt-4">
              <Users className="h-5 w-5 text-[#000080] mr-2" />
              Members
            </h2>
            <p className="mt-2">
              "Members" are defined as users who have created a profile on Grapes.group for the purpose of joining one or more groups. Those being private or public.
            </p>
            <p className="mt-2">
              In private groups members need to be approved by the group administrator.
            </p>
            <p className="mt-2">
              For members we are collecting the same information as for Anonymous Website Users.
            </p>
            <p className="mt-2">
              Additionally the following personal information will be collected:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Email - The email address which is being used to log in. Email will also be used to send you activity emails, if a consent has been provided on your profile</li>
              <li>Name - Your full name. Used to identify you for other group members</li>
              <li>RSVPs - Your attendance status (yes, no, maybe) on a group event</li>
              <li>Messages - Your personal message in eg. group chat</li>
            </ul>
            <p className="mt-2">
              Email, Name, RSVP and message are all interlinked.
            </p>
            <p className="mt-2">
              All information - except your email address - is being used to present within a group, which will allow all other group members to see your details.
            </p>
            <p className="mt-2">
              The information will be saved on our platform as long as you are using our service. All information will be deleted after 1 year inactivity. An e-mail warning will be sent.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold flex items-center pt-4">
              <Lock className="h-5 w-5 text-[#000080] mr-2" />
              Chat Interactions
            </h2>
            <p className="mt-2">
              Currently users can post images and text in each individual group chat.
              Users can delete content posted by themselves.
              All chat interactions are exposed to all group members.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold flex items-center pt-4">
              <CalendarIcon className="h-5 w-5 text-[#000080] mr-2" />
              Event Information
            </h2>
            <p className="mt-2">
              Event information can be provided by group members in private and public groups.
            </p>
            <p className="mt-2">
              We expect that you have all copyrights for copy text and images for the event that you will be creating.
            </p>
            <p className="mt-2">
              Information provided for each individual event will be used for presentation on Grapes (based on your preferences when creating the invitation).
            </p>
            <p className="mt-2">
              Current information stored on each event is:
            </p>
            <p className="mt-2">
              Title, Location, Time Start, Time End, Images selected/added, Description, Private/public Event.
            </p>
            <p className="mt-2">
              In relation to events we collect RSVPs. All RSVPs are available for every group member to see.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold flex items-center pt-4">
              <Shield className="h-5 w-5 text-[#000080] mr-2" />
              How We Protect Your Data
            </h2>
            <p className="mt-2">
              Privacy is core. Strict internal access control to data.
              Continuous backup of all data.
              Securing logins and all personal data between your browser and our servers.
              Internal processes for providing in-depth information to users within 72 hours In case of a data breach.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold flex items-center pt-4">
              <Users className="h-5 w-5 text-[#000080] mr-2" />
              Third Party Processors
            </h2>
            <p className="mt-2">
              Grapes is currently only using the following third party processors for storage and processing to provide infrastructure services:
            </p>
            
            <div className="mt-4 space-y-4">
              <div>
                <p className="font-medium">Lovable Labs Incorporated</p>
                <p className="text-sm">
                  Lovable is used as our development platform. Lovable is an AI tool that allows to build digital platforms through prompting.
                  No personal data is stored on the Lovable platform.
                </p>
              </div>
              
              <div>
                <p className="font-medium">Supabase, Inc.</p>
                <p className="text-sm">
                  Supabase is a data processor.
                  Supabase is used to store all information collected on the Grapes platform.
                  The data is stored on servers located in Frankfurt, Germany.
                </p>
              </div>
              
              <div>
                <p className="font-medium">Resend.com (Plus Five Five, Inc)</p>
                <p className="text-sm">
                  Supabase is a data processor.
                  Resend.com is used as SMTP relay to distribute e.-mails
                </p>
              </div>
              
              <div>
                <p className="font-medium">Vercel Inc.</p>
                <p className="text-sm">
                  Vercel is a front-end cloud provider, that hosts and serve our front-end webservice.
                  No personal data is stored with Vercel.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold flex items-center pt-4">
              <Lock className="h-5 w-5 text-[#000080] mr-2" />
              Sharing Your Data
            </h2>
            <p className="mt-2">
              Grapes is fully committed to not share or sell any personal data compiled through the usage of the service to 3rd parties.
              Personal data is only being shared with 3rd party processors. Please see above.
            </p>
            <p className="mt-2">
              Sharing your data might though happen in the case of Grapes being acquired or merged with another company. Sharing the data can only happen when all assets related to Grapes are being transferred.
            </p>
            <p className="mt-2">
              Generic and aggregated anonymised data can be used by Grapes for information and editorial purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold flex items-center pt-4">
              <Users className="h-5 w-5 text-[#000080] mr-2" />
              Your Right to be Forgotten
            </h2>
            <p className="mt-2">
              At any given moment you can request all your personal data by emailing hi@grapes.group.
            </p>
            <p className="mt-2">
              If you want to have all your data deleted, please write to hi@grapes.group referencing the email address, which will have the data linked.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold flex items-center pt-4">
              <Users className="h-5 w-5 text-[#000080] mr-2" />
              Deleting Collected Personal Data
            </h2>
            <p className="mt-2">
              As long as you have actively used the Grapes platform within 12 months, we will keep you data on the platform, unless you require other actions.
            </p>
            <p className="mt-2">
              If you have not been active on the platform within 12 months all data will be deleted - in a few cases anonymized, in case a complete deletion will break (!) our platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold flex items-center pt-4">
              <Info className="h-5 w-5 text-[#000080] mr-2" />
              Changes to This Policy
            </h2>
            <p className="mt-2">
              We might edit this policy for improvements and correctness. Our users will be informed through usage of the service.
            </p>
            <p className="mt-2">
              Any major changes will be communicated to registered users via email.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold flex items-center pt-4">
              <Users className="h-5 w-5 text-[#000080] mr-2" />
              Your Rights
            </h2>
            <p className="mt-2">
              You are in your right to withdraw all consent at any time.
            </p>
            <p className="mt-2">
              As described above, users always have access to all data for full transparency.
            </p>
            <p className="mt-2">
              Any complaint can be sent to hi@grapes.group and/or the Danish data protection authority Datatilsynet.
            </p>
          </section>

          <section className="pt-6">
            <div className="border-t pt-6">
              <p className="font-medium">
                Grapes is published, operated and owned by Simon Schultz, Commis.
              </p>
              <p className="mt-2">
                Commis<br />
                Nørrebro<br />
                2200 Copenhagen N, Denmark<br />
                <a href="mailto:hi@grapes.group" className="text-[#000080] hover:underline">hi@grapes.group</a>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

const CalendarIcon = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M8 2v4" />
    <path d="M16 2v4" />
    <rect width="18" height="18" x="3" y="4" rx="2" />
    <path d="M3 10h18" />
  </svg>
);

export default Privacy;
