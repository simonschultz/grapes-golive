
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface SiteSettings {
  id: string;
  front_page_intro: string;
  created_at?: string;
  updated_at?: string;
}

interface Group {
  id: string;
  title: string;
  slug: string;
  image_url: string | null;
  is_private: boolean;
  member_count: number;
  featured?: boolean;
}

// Define an interface for the admin user
interface AdminUser {
  email: string;
  id: string;
  created_at: string;
}

const Admin = () => {
  const { toast } = useToast();
  const [isSendingEmails, setIsSendingEmails] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSavingGroups, setIsSavingGroups] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(null);
  const [settings, setSettings] = useState<SiteSettings>({
    id: '',
    front_page_intro: "Welcome. We are Grapes. Another alternative to other great group tools."
  });
  const [publicGroups, setPublicGroups] = useState<Group[]>([]);
  const [featuredGroups, setFeaturedGroups] = useState<Group[]>([]);
  const [featuredGroupIds, setFeaturedGroupIds] = useState<string[]>([]);

  // Check if current user is an admin
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user && user.email) {
          setCurrentUserEmail(user.email);
          
          // Check if user is in admin_users table
          const { data: adminUser, error } = await supabase
            .from('admin_users')
            .select('*')
            .eq('email', user.email)
            .maybeSingle();
            
          if (error) {
            console.error('Error checking admin status:', error);
            return;
          }
          
          setIsAdmin(!!adminUser);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      }
    };
    
    checkAdminStatus();
  }, []);

  useEffect(() => {
    if (!isAdmin) return;
    
    const fetchSettings = async () => {
      try {
        // Use maybeSingle instead of single to avoid errors if no record is found
        const { data, error } = await supabase
          .from('site_settings')
          .select('*')
          .maybeSingle();

        if (error) {
          console.error('Error fetching settings:', error);
          return;
        }

        if (data) {
          setSettings(data as SiteSettings);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
      }
    };

    const fetchFeaturedGroups = async () => {
      try {
        // Fetch the admin_settings to get featured group IDs
        const { data: adminSettings, error: settingsError } = await supabase
          .from('admin_settings')
          .select('*')
          .eq('key', 'featured_groups')
          .maybeSingle();

        if (settingsError) {
          console.error('Error fetching featured groups setting:', settingsError);
          return;
        }

        // Fix for the TypeScript error - properly access the group_ids property from the JSON value
        let featuredIds: string[] = [];
        if (adminSettings?.value) {
          // Check if value is an object with group_ids property
          const valueObj = typeof adminSettings.value === 'string' 
            ? JSON.parse(adminSettings.value) 
            : adminSettings.value as Record<string, any>;
            
          featuredIds = Array.isArray(valueObj.group_ids) ? valueObj.group_ids : [];
        }
        
        setFeaturedGroupIds(featuredIds);

        // Fetch all public groups
        const { data: groups, error: groupsError } = await supabase
          .from('public_groups_with_counts')
          .select('*')
          .eq('is_private', false);

        if (groupsError) {
          console.error('Error fetching public groups:', groupsError);
          return;
        }

        if (groups) {
          // Mark featured groups
          const mappedGroups = groups.map(group => ({
            ...group,
            featured: featuredIds.includes(group.id)
          }));
          
          setPublicGroups(mappedGroups);
          
          // Filter featured groups
          const featured = mappedGroups.filter(group => featuredIds.includes(group.id));
          setFeaturedGroups(featured);
        }
      } catch (error) {
        console.error('Error fetching groups:', error);
      }
    };

    if (isAdmin) {
      fetchSettings();
      fetchFeaturedGroups();
    }
  }, [isAdmin]);

  const handleTestEmailDigest = async () => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "You must be an admin to perform this action",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSendingEmails(true);
      const { error } = await supabase.functions.invoke('send-activity-emails');
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Email digest job has been triggered",
      });
    } catch (error) {
      console.error('Error triggering email digest:', error);
      toast({
        title: "Error",
        description: "Failed to trigger email digest",
        variant: "destructive",
      });
    } finally {
      setIsSendingEmails(false);
    }
  };

  const saveSettings = async () => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "You must be an admin to perform this action",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSaving(true);

      // Check if we need to insert a new record or update an existing one
      if (!settings.id) {
        // No ID, so we need to insert a new record
        const { data, error } = await supabase
          .from('site_settings')
          .insert({
            front_page_intro: settings.front_page_intro,
          })
          .select()
          .single();

        if (error) throw error;

        if (data) {
          setSettings(data as SiteSettings);
        }
      } else {
        // We have an ID, so update the existing record
        const { data, error } = await supabase
          .from('site_settings')
          .update({
            front_page_intro: settings.front_page_intro,
            updated_at: new Date().toISOString()
          })
          .eq('id', settings.id)
          .select()
          .single();

        if (error) throw error;

        if (data) {
          setSettings(data as SiteSettings);
        }
      }

      toast({
        title: "Settings saved",
        description: "Your site settings have been updated",
      });
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const toggleGroupFeatured = (groupId: string) => {
    // Check if we already have 6 featured groups and this would add a 7th
    if (!featuredGroupIds.includes(groupId) && featuredGroupIds.length >= 6) {
      toast({
        title: "Limit Reached",
        description: "You can only feature up to 6 groups",
        variant: "destructive",
      });
      return;
    }

    // Toggle the group in the featuredGroupIds array
    setFeaturedGroupIds(prev => {
      if (prev.includes(groupId)) {
        return prev.filter(id => id !== groupId);
      } else {
        return [...prev, groupId];
      }
    });

    // Update the publicGroups state to reflect the change
    setPublicGroups(prev => 
      prev.map(group => {
        if (group.id === groupId) {
          return { ...group, featured: !group.featured };
        }
        return group;
      })
    );
  };

  const saveFeaturedGroups = async () => {
    if (!isAdmin) {
      toast({
        title: "Access Denied",
        description: "You must be an admin to perform this action",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsSavingGroups(true);
      console.log("Saving featured groups:", featuredGroupIds);
      console.log("Current user email:", currentUserEmail);

      // Check if any admin settings entry with key 'featured_groups' exists
      const { data: existingSettings, error: checkError } = await supabase
        .from('admin_settings')
        .select('*')
        .eq('key', 'featured_groups')
        .maybeSingle();
      
      if (checkError) {
        console.error('Error checking admin settings:', checkError);
        throw checkError;
      }
      
      let upsertError;
      // Insert or update based on whether the setting already exists
      if (existingSettings) {
        // Update existing setting
        console.log("Updating existing featured groups setting");
        const { error } = await supabase
          .from('admin_settings')
          .update({
            value: { group_ids: featuredGroupIds },
            updated_at: new Date().toISOString()
          })
          .eq('key', 'featured_groups');
          
        upsertError = error;
      } else {
        // Insert new setting
        console.log("Creating new featured groups setting");
        const { error } = await supabase
          .from('admin_settings')
          .insert({
            key: 'featured_groups',
            value: { group_ids: featuredGroupIds }
          });
          
        upsertError = error;
      }

      if (upsertError) {
        console.error('Error saving featured groups:', upsertError);
        throw upsertError;
      }

      // Update featuredGroups array for display
      const featured = publicGroups.filter(group => featuredGroupIds.includes(group.id));
      setFeaturedGroups(featured);

      toast({
        title: "Success",
        description: "Featured groups have been updated",
      });
    } catch (error: any) {
      console.error('Error saving featured groups:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save featured groups",
        variant: "destructive",
      });
    } finally {
      setIsSavingGroups(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <header className="flex justify-between items-center p-4 border-b bg-white">
          <div className="flex items-center gap-2">
            <img 
              src="/lovable-uploads/c8d510f1-af2f-4971-a8ae-ce69e945c096.png" 
              alt="Grapes Logo" 
              className="w-8 h-8"
            />
            <h1 className="text-xl font-semibold">Admin Dashboard</h1>
          </div>
        </header>
        <main className="max-w-3xl mx-auto px-4 py-6 flex-1">
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>
                You must be an admin to view this page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Please contact an administrator if you believe you should have access.</p>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <header className="flex justify-between items-center p-4 border-b bg-white">
        <div className="flex items-center gap-2">
          <img 
            src="/lovable-uploads/c8d510f1-af2f-4971-a8ae-ce69e945c096.png" 
            alt="Grapes Logo" 
            className="w-8 h-8"
          />
          <h1 className="text-xl font-semibold">Admin Dashboard</h1>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 flex-1">
        <Tabs defaultValue="content">
          <TabsList className="mb-6">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="featured">Featured Groups</TabsTrigger>
            <TabsTrigger value="email">Email Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>Front Page Content</CardTitle>
                <CardDescription>
                  Customize the content shown on the front page of your site
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="front_page_intro">Introduction Message</Label>
                  <Textarea 
                    id="front_page_intro"
                    value={settings.front_page_intro}
                    onChange={(e) => setSettings({...settings, front_page_intro: e.target.value})}
                    placeholder="Enter a welcome message for your users"
                    className="min-h-24"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={saveSettings} 
                  disabled={isSaving}
                  style={{ backgroundColor: "#000080" }}
                >
                  {isSaving ? "Saving..." : "Save Changes"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="featured">
            <Card>
              <CardHeader>
                <CardTitle>Featured Groups</CardTitle>
                <CardDescription>
                  Select up to 6 public groups to feature on your site
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Currently Featured ({featuredGroups.length}/6)</h3>
                    {featuredGroups.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {featuredGroups.map(group => (
                          <div key={group.id} className="flex items-center gap-3 p-3 border rounded-md">
                            <div className="flex-shrink-0 h-10 w-10 rounded-md overflow-hidden">
                              {group.image_url ? (
                                <img 
                                  src={group.image_url} 
                                  alt={group.title} 
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                                  <span className="text-xs text-gray-500">No img</span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{group.title}</p>
                              <p className="text-xs text-gray-500">{group.member_count} members</p>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => toggleGroupFeatured(group.id)}
                            >
                              Remove
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 mb-6">No featured groups selected</p>
                    )}
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">All Public Groups</h3>
                    <div className="border rounded-md overflow-hidden">
                      <div className="max-h-[400px] overflow-y-auto">
                        <table className="w-full text-left">
                          <thead className="bg-gray-50 border-b">
                            <tr>
                              <th className="px-4 py-2 text-xs font-medium text-gray-500">Featured</th>
                              <th className="px-4 py-2 text-xs font-medium text-gray-500">Group</th>
                              <th className="px-4 py-2 text-xs font-medium text-gray-500">Members</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {publicGroups.map(group => (
                              <tr key={group.id} className="hover:bg-gray-50">
                                <td className="px-4 py-2">
                                  <Checkbox 
                                    checked={!!group.featured}
                                    onCheckedChange={() => toggleGroupFeatured(group.id)}
                                    disabled={!group.featured && featuredGroupIds.length >= 6}
                                  />
                                </td>
                                <td className="px-4 py-2">
                                  <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded overflow-hidden flex-shrink-0">
                                      {group.image_url ? (
                                        <img 
                                          src={group.image_url} 
                                          alt={group.title} 
                                          className="h-full w-full object-cover"
                                        />
                                      ) : (
                                        <div className="h-full w-full bg-gray-200"></div>
                                      )}
                                    </div>
                                    <span className="text-sm font-medium">{group.title}</span>
                                  </div>
                                </td>
                                <td className="px-4 py-2 text-sm text-gray-500">
                                  {group.member_count}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={saveFeaturedGroups} 
                  disabled={isSavingGroups}
                  style={{ backgroundColor: "#000080" }}
                >
                  {isSavingGroups ? "Saving..." : "Save Featured Groups"}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle>Email Digest Testing</CardTitle>
                <CardDescription>
                  Test email digests by sending them immediately
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-4">
                  Clicking this button will trigger the email digest system to send emails now, regardless of the normal schedule.
                </p>
                <Button 
                  variant="outline"
                  onClick={handleTestEmailDigest}
                  disabled={isSendingEmails}
                >
                  {isSendingEmails ? "Sending..." : "Test Email Digest"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Admin;
