
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { GroupHeader } from "@/components/group/GroupHeader";
import { GroupInfo } from "@/components/group/GroupInfo";
import { useToast } from "@/hooks/use-toast";

interface GroupData {
  id: string;
  title: string;
  description: string | null;
  is_private: boolean;
  image_url: string | null;
  slug: string;
}

const Group = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [group, setGroup] = useState<GroupData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMember, setIsMember] = useState<boolean | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [hasRequestedAccess, setHasRequestedAccess] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const getAbsoluteUrl = (path: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}${path}`;
  };

  const getFullUrl = (path?: string) => {
    const baseUrl = window.location.origin;
    if (!path) return baseUrl;
    return `${baseUrl}${path}`;
  };

  useEffect(() => {
    const checkAuthAndGroup = async () => {
      try {
        // Check authentication status
        const { data: { user } } = await supabase.auth.getUser();
        setIsAuthenticated(!!user);

        // Fetch group data
        const { data: groupData, error: groupError } = await supabase
          .from('groups')
          .select()
          .eq('slug', slug)
          .single();

        if (groupError) throw groupError;
        setGroup(groupData);

        // Generate full image URL if group has an image
        if (groupData.image_url) {
          const { data: { publicUrl } } = supabase.storage
            .from('group-images')
            .getPublicUrl(groupData.image_url);
          setImageUrl(publicUrl);
        }

        // If user is authenticated, check membership and request status
        if (user) {
          const { data: memberData } = await supabase
            .from('group_members')
            .select()
            .eq('group_id', groupData.id)
            .eq('user_id', user.id)
            .single();

          if (memberData) {
            setIsMember(true);
            navigate(`/groups/${slug}/front`);
          } else {
            setIsMember(false);
            // Check if user has a pending request
            const { data: requestData } = await supabase
              .from('group_members')
              .select()
              .eq('group_id', groupData.id)
              .eq('user_id', user.id)
              .eq('role', 'request')
              .single();
            
            setHasRequestedAccess(!!requestData);
          }
        }
      } catch (error) {
        console.error('Error:', error);
        navigate('/not-found');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthAndGroup();
  }, [slug, navigate]);

  const handleGroupAction = async () => {
    if (!isAuthenticated) {
      navigate('/'); // Changed from /auth to / (index)
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !group) return;

      if (group.is_private) {
        // Request access for private group
        const { error } = await supabase
          .from('group_members')
          .insert({
            group_id: group.id,
            user_id: user.id,
            role: 'request'
          });

        if (error) throw error;
        
        setHasRequestedAccess(true);
        toast({
          title: "Request sent",
          description: "Your request to join this group has been sent to the admins.",
        });
      } else {
        // Join public group
        const { error } = await supabase
          .from('group_members')
          .insert({
            group_id: group.id,
            user_id: user.id,
            role: 'member'
          });

        if (error) throw error;

        toast({
          title: "Success",
          description: "You have joined the group.",
        });
        navigate(`/groups/${slug}/front`);
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  }

  if (!group) return null;

  const defaultImageUrl = getAbsoluteUrl('/lovable-uploads/987d0824-15e3-4e4a-b4e8-535baf108d42.png');
  const currentUrl = getFullUrl(`/groups/${slug}`);
  
  const getButtonText = () => {
    if (!isAuthenticated) return 'Sign in to Join Group';
    if (group.is_private && hasRequestedAccess) return 'Waiting for approval';
    if (group.is_private) return 'Request to access';
    return 'Join Group';
  };

  return (
    <>
      <Helmet>
        <title>{group.title} | Grapes</title>
        <meta name="description" content={group.description || `Join ${group.title} on Grapes`} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={currentUrl} />
        <meta property="og:title" content={group.title} />
        <meta property="og:description" content={group.description || `Join ${group.title} on Grapes`} />
        <meta property="og:image" content={imageUrl || defaultImageUrl} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content={window.location.hostname} />
        <meta property="twitter:url" content={currentUrl} />
        <meta name="twitter:title" content={group.title} />
        <meta name="twitter:description" content={group.description || `Join ${group.title} on Grapes`} />
        <meta name="twitter:image" content={imageUrl || defaultImageUrl} />
      </Helmet>
      <div className="min-h-screen bg-gray-50">
        <GroupHeader 
          title={group.title}
          imageUrl={group.image_url}
        />
        <main className="max-w-3xl mx-auto px-3 sm:px-4">
          <div className="bg-white rounded-lg shadow">
            <GroupInfo 
              title={group.title}
              description={group.description}
              isPrivate={group.is_private}
            />
            <div className="p-4 border-t">
              <Button
                className="w-full"
                onClick={handleGroupAction}
                disabled={hasRequestedAccess}
              >
                {getButtonText()}
              </Button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default Group;
