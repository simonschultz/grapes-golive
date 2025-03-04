import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Upload } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface GroupData {
  id: string;
  title: string;
  description: string | null;
  is_private: boolean;
  created_by: string;
  slug: string;
  image_url: string | null;
}

const GroupEdit = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [group, setGroup] = useState<GroupData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    is_private: false,
    image_url: null as string | null
  });

  useEffect(() => {
    const fetchGroupData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/auth');
          return;
        }

        const { data: groupData, error: groupError } = await supabase
          .from('groups')
          .select()
          .eq('slug', slug || '')
          .maybeSingle();

        if (groupError) throw groupError;
        if (!groupData) {
          navigate('/not-found');
          return;
        }

        const { data: memberData, error: memberError } = await supabase
          .from('group_members')
          .select('role')
          .eq('group_id', groupData.id)
          .eq('user_id', user.id)
          .maybeSingle();

        if (memberError) throw memberError;
        if (memberData?.role !== 'admin' && groupData.created_by !== user.id) {
          navigate(`/groups/${slug}/front`);
          return;
        }

        setGroup(groupData);
        setFormData({
          title: groupData.title,
          description: groupData.description || "",
          is_private: groupData.is_private || false,
          image_url: groupData.image_url
        });

      } catch (error: any) {
        console.error('Error fetching group data:', error);
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
        navigate('/not-found');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroupData();
  }, [slug, navigate, toast]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !group) return;

    try {
      setIsSaving(true);

      const fileExt = file.name.split('.').pop();
      const filePath = `${group.id}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('group-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      setFormData(prev => ({ ...prev, image_url: filePath }));

      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!group) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('groups')
        .update({
          title: formData.title,
          description: formData.description,
          is_private: formData.is_private,
          image_url: formData.image_url
        })
        .eq('id', group.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Group settings updated successfully",
      });
      
      navigate(`/groups/${slug}/front`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!group) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-3xl mx-auto">
          <div className="px-3 sm:px-4 py-4 flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(`/groups/${slug}/front`)}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold">Edit Group</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto w-full px-3 sm:px-4 py-6">
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-4 sm:p-6 space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-24 h-24">
              <AvatarImage 
                src={formData.image_url ? supabase.storage.from('group-images').getPublicUrl(formData.image_url).data.publicUrl : undefined} 
              />
              <AvatarFallback>
                {formData.title ? formData.title[0]?.toUpperCase() : "G"}
              </AvatarFallback>
            </Avatar>
            <div className="flex items-center">
              <Label
                htmlFor="picture"
                className="cursor-pointer flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
              >
                <Input
                  id="picture"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={isSaving}
                />
                <Upload className="w-4 h-4" />
                Change group picture
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Group Name</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
            />
          </div>

          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">
                  {formData.is_private ? "Private Group" : "Public Group"}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {formData.is_private 
                    ? "People will need to know the URL and request access"
                    : "Everyone can join your group"
                  }
                </p>
              </div>
              <Switch
                checked={formData.is_private}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, is_private: checked }))
                }
              />
            </div>
          </div>

          <div className="pt-4">
            <Button type="submit" className="w-full" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
};

export default GroupEdit;
