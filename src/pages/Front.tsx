import { Button } from "@/components/ui/button";
import { Settings, Shield, MessageSquare, ArrowRight, UserPlus, Calendar, Users, BellRing } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { FeatureSection, FeatureItem } from "@/components/ui/feature-section";
import { AppLayout } from "@/components/layout/AppLayout";

interface PendingRequest {
  group: {
    title: string;
    slug: string;
  };
  count: number;
}

interface Notification {
  id: string;
  type: 'chat' | 'event' | 'member';
  message: string;
  created_at: string;
  read: boolean;
  group_id: string;
  related_item_id: string;
  groups: {
    slug: string;
  };
}

interface TopGroup {
  id: string;
  title: string;
  slug: string;
  image_url: string | null;
  member_count: number;
}

interface SiteSettings {
  id: string;
  front_page_intro: string;
  created_at?: string;
  updated_at?: string;
}

const Front = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [featuredGroups, setFeaturedGroups] = useState<TopGroup[]>([]);
  const [hasGroups, setHasGroups] = useState(false);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>({
    id: '',
    front_page_intro: "Welcome. We are Grapes. Another alternative to other great group tools."
  });

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/auth');
          return;
        }

        const { data: profile } = await supabase
          .from('profiles')
          .select('first_name, last_name')
          .eq('id', user.id)
          .single();

        if (!profile?.first_name || !profile?.last_name) {
          navigate('/welcome');
          return;
        }

        const { data: settingsData, error: settingsError } = await supabase
          .from('site_settings')
          .select('*')
          .single();
        
        if (settingsData && !settingsError) {
          setSiteSettings(settingsData as SiteSettings);
        }

        const { data: notifData, error: notifError } = await supabase
          .from('notifications')
          .select(`
            *,
            groups (
              slug
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);

        if (notifError) throw notifError;
        setNotifications(notifData as Notification[]);

        const { count } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        setNotificationCount(count || 0);

        const { count: groupCount } = await supabase
          .from('group_members')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .in('role', ['admin', 'member']);

        setHasGroups(groupCount !== null && groupCount > 0);

        const { data: adminGroups } = await supabase
          .from('group_members')
          .select(`
            groups (
              id,
              title,
              slug
            )
          `)
          .eq('user_id', user.id)
          .eq('role', 'admin');

        if (adminGroups) {
          const requests = await Promise.all(
            adminGroups.map(async ({ groups }) => {
              if (!groups) return null;
              
              const { count } = await supabase
                .from('group_members')
                .select('*', { count: 'exact', head: true })
                .eq('group_id', groups.id)
                .eq('role', 'request');

              if (count && count > 0) {
                return {
                  group: {
                    title: groups.title,
                    slug: groups.slug,
                  },
                  count,
                };
              }
              return null;
            })
          );

          setPendingRequests(requests.filter((req): req is PendingRequest => req !== null));
        }

        if (!groupCount || groupCount === 0) {
          const { data: adminSettings } = await supabase
            .from('admin_settings')
            .select('value')
            .eq('key', 'featured_groups')
            .maybeSingle();
          
          let featuredGroupIds: string[] = [];
          if (adminSettings?.value) {
            const valueObj = typeof adminSettings.value === 'string' 
              ? JSON.parse(adminSettings.value) 
              : adminSettings.value as Record<string, any>;
              
            featuredGroupIds = Array.isArray(valueObj.group_ids) ? valueObj.group_ids : [];
          }
          
          if (featuredGroupIds.length > 0) {
            const { data: featuredGroupsData } = await supabase
              .from('public_groups_with_counts')
              .select('id, title, slug, image_url, member_count')
              .in('id', featuredGroupIds);
            
            if (featuredGroupsData && featuredGroupsData.length > 0) {
              const sortedGroups = featuredGroupIds.map(id => 
                featuredGroupsData.find(group => group.id === id)
              ).filter(Boolean) as TopGroup[];
              
              setFeaturedGroups(sortedGroups);
            } else {
              const { data: topGroupsData } = await supabase.rpc('get_top_public_groups', {
                limit_count: 6
              });
              if (topGroupsData) {
                setFeaturedGroups(topGroupsData);
              }
            }
          } else {
            const { data: topGroupsData } = await supabase.rpc('get_top_public_groups', {
              limit_count: 6
            });
            if (topGroupsData) {
              setFeaturedGroups(topGroupsData);
            }
          }
        }

      } catch (error) {
        console.error('Error checking profile:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkProfile();
  }, [navigate, toast]);

  const getNotificationIcon = (type: 'chat' | 'event' | 'member') => {
    switch (type) {
      case 'chat':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'event':
        return <Calendar className="h-5 w-5 text-blue-600" />;
      case 'member':
        return <Users className="h-5 w-5 text-blue-700" />;
      default:
        return <BellRing className="h-5 w-5 text-gray-500" />;
    }
  };

  const featureItems: FeatureItem[] = [
    {
      icon: UserPlus,
      title: "Find groups to join",
      onClick: () => navigate('/groups/join')
    },
    {
      icon: UserPlus,
      title: "Create new group",
      onClick: () => navigate('/groups/create')
    }
  ];

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="flex flex-col min-h-screen bg-white">
        <div className="flex-1 pb-16 md:pb-0">
          <header className="flex justify-between items-center p-4 border-b md:border-0 md:px-6 md:py-5">
            <div className="flex items-center md:hidden">
              <img 
                src="/lovable-uploads/c8d510f1-af2f-4971-a8ae-ce69e945c096.png" 
                alt="Grapes Logo" 
                className="h-5 w-5 mr-2"
              />
              <h1 className="text-xl font-semibold">Grapes</h1>
            </div>
            <div className="md:invisible md:h-0">
              <Button variant="ghost" size="icon" className="text-[#000080] md:hidden" onClick={() => navigate('/settings')}>
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </header>

          <main className="flex-1 p-4 md:p-6">
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="text-center space-y-4 mb-8">
                <p className="text-gray-600">
                  {siteSettings.front_page_intro}
                </p>
                
                <div className="pt-4 pb-5">
                  <FeatureSection 
                    items={featureItems}
                    columns={2}
                    className="max-w-xl mx-auto"
                  />
                </div>
              </div>

              {!hasGroups && featuredGroups.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-center text-gray-900">Some inspiration</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {featuredGroups.map((group) => (
                      <div 
                        key={group.id} 
                        className="flex flex-col items-center cursor-pointer"
                        onClick={() => navigate(`/groups/${group.slug}`)}
                      >
                        <div className="w-full aspect-square rounded-lg border border-gray-200 overflow-hidden bg-gray-100 mb-2">
                          {group.image_url ? (
                            <img
                              src={supabase.storage.from('group-images').getPublicUrl(group.image_url).data.publicUrl}
                              alt={group.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <UserPlus className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-gray-600 text-center">{group.title}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pendingRequests.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Shield className="h-5 w-5 text-blue-600" />
                    <h2 className="font-medium text-blue-900">Pending Approvals</h2>
                  </div>
                  <div className="space-y-2">
                    {pendingRequests.map((request) => (
                      <button
                        key={request.group.slug}
                        onClick={() => navigate(`/groups/${request.group.slug}/members`)}
                        className="w-full text-left flex items-center justify-between p-3 bg-white rounded border border-blue-100 hover:bg-blue-50 transition-colors"
                      >
                        <span className="font-medium">{request.group.title}</span>
                        <div className="flex items-center gap-2 text-blue-600">
                          <UserPlus className="h-4 w-4" />
                          <span className="text-sm">{request.count} pending</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {notifications.length > 0 && (
                <div className="bg-white border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-gray-600" />
                      <h2 className="font-medium text-gray-900">Recent Activity</h2>
                    </div>
                    {notificationCount > 3 && (
                      <Button 
                        variant="ghost" 
                        className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        onClick={() => navigate('/activity')}
                      >
                        See all
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <div className="space-y-2">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        onClick={() => navigate(`/groups/${notification.groups.slug}`)}
                        className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                      >
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div>
                          <p className="text-sm text-gray-900">{notification.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {format(new Date(notification.created_at), 'MMM d, h:mm a')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="text-sm text-gray-500 text-center mt-2">
                <a href="mailto:hi@grapes.group" className="hover:text-[#000080] transition-colors">
                  Need help? We are just an e-mail away.
                </a>
              </div>
            </div>
          </main>
        </div>
      </div>
    </AppLayout>
  );
};

export default Front;
