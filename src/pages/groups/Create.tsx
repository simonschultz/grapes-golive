import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const CreateGroup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [isPrivate, setIsPrivate] = useState(true); // Default to private
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    setSlug(generateSlug(newTitle));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSlug(generateSlug(e.target.value));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) throw new Error("No user found");

      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('group-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('group-images')
        .getPublicUrl(filePath);

      setImageUrl(filePath);
      toast({
        title: "Success",
        description: "Group image uploaded successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        navigate('/auth');
        return;
      }

      const { data: newGroup, error: groupError } = await supabase
        .from('groups')
        .insert({
          title,
          slug,
          description,
          is_private: isPrivate,
          created_by: user.id,
          image_url: imageUrl,
        })
        .select()
        .single();

      if (groupError) throw groupError;

      toast({
        title: "Success",
        description: "Group created successfully",
      });
      navigate(`/groups/${slug}/front?new=true`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Create Group</h1>
        </div>
      </header>

      <main className="flex-1 p-4">
        <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={imageUrl ? supabase.storage.from('group-images').getPublicUrl(imageUrl).data.publicUrl : ""} />
              <AvatarFallback className="bg-gray-100">
                {title ? title[0]?.toUpperCase() : "G"}
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
                  disabled={isLoading}
                />
                <Upload className="w-4 h-4" />
                Upload group picture
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Group Title</Label>
            <Input
              id="title"
              value={title}
              onChange={handleTitleChange}
              required
              placeholder="Enter group title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">Group URL</Label>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">groups/</span>
              <Input
                id="slug"
                value={slug}
                onChange={handleSlugChange}
                required
                placeholder="group-url"
                className="flex-1"
              />
            </div>
            <p className="text-sm text-gray-500">
              This will be the URL of your group page
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your group"
              rows={4}
              className="text-base md:text-sm"
            />
          </div>

          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">
                  {isPrivate ? "Private Group" : "Public Group"}
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {isPrivate 
                    ? "People will need to know the URL and request access"
                    : "Everyone can join your group"
                  }
                </p>
              </div>
              <Switch
                checked={isPrivate}
                onCheckedChange={setIsPrivate}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#000080] hover:bg-[#000080]/90"
            disabled={isLoading || !title || !slug}
          >
            {isLoading ? "Creating..." : "Create Group"}
          </Button>
        </form>
      </main>
    </div>
  );
};

export default CreateGroup;
