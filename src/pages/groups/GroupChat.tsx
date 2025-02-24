import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Home, MessageSquare, Calendar, Users, Settings, Send, Image, MoreVertical } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface Message {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  image_url: string | null;
  profiles: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
}

interface GroupData {
  id: string;
  title: string;
}

const GroupChat = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [group, setGroup] = useState<GroupData | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/auth');
          return;
        }

        setCurrentUser(user.id);

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

        setGroup(groupData);

        const { data: memberData, error: memberError } = await supabase
          .from('group_members')
          .select('role')
          .eq('group_id', groupData.id)
          .eq('user_id', user.id)
          .maybeSingle();

        if (memberError) throw memberError;
        if (!memberData || (memberData.role !== 'member' && memberData.role !== 'admin')) {
          navigate(`/groups/${slug}`);
          return;
        }

        // Fetch initial messages
        const { data: initialMessages, error: initialMessagesError } = await supabase
          .from('messages')
          .select(`
            *,
            profiles (
              first_name,
              last_name,
              avatar_url
            )
          `)
          .eq('group_id', groupData.id)
          .order('created_at', { ascending: true })
          .limit(50);

        if (initialMessagesError) throw initialMessagesError;
        setMessages(initialMessages || []);

        // Subscribe to new messages
        supabase
          .channel('public:messages')
          .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'messages', filter: `group_id=eq.${groupData.id}` },
            async (payload) => {
              const newMessage = payload.new as Message;
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('first_name, last_name, avatar_url')
                .eq('id', newMessage.user_id)
                .single();

              if (profileError) {
                console.error('Error fetching profile:', profileError);
                return;
              }

              setMessages((prevMessages) => [...prevMessages, { ...newMessage, profiles: profileData }]);
              scrollToBottom();
            }
          )
          .subscribe()

      } catch (error: any) {
        console.error('Error checking access:', error);
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

    checkAccess();
  }, [slug, navigate, toast]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setShowScrollButton(!entry.isIntersecting);
        });
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0,
      }
    );

    if (messagesEndRef.current) {
      observer.observe(messagesEndRef.current);
    }

    return () => {
      if (messagesEndRef.current) {
        observer.unobserve(messagesEndRef.current);
      }
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDeleteMessage = async () => {
    if (!messageToDelete) return;

    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageToDelete);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Message deleted successfully",
      });
      
      // Update local state
      setMessages(prev => prev.filter(message => message.id !== messageToDelete));
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setMessageToDelete(null);
    }
  };

  const handleSend = async () => {
    if (isUploading) return;

    if (!newMessage.trim() && !imageFile) {
      return;
    }

    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !group) return;

      let imageUrl = null;
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('message-images')
          .upload(filePath, imageFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;
        imageUrl = filePath;
      }

      const { error } = await supabase
        .from('messages')
        .insert({
          content: newMessage.trim(),
          user_id: user.id,
          group_id: group.id,
          image_url: imageUrl,
        });

      if (error) throw error;

      setNewMessage("");
      setImageFile(null);
      scrollToBottom();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setImageFile(file || null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b">
        <div className="max-w-3xl mx-auto">
          <div className="p-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold">{group?.title}</h1>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => navigate(`/groups/${slug}/settings`)}
            >
              <Settings className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <nav className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-2">
          <div className="flex">
            <Button 
              variant="ghost"
              className="py-4"
              onClick={() => navigate(`/groups/${slug}/front`)}
            >
              <Home className="h-5 w-5" />
            </Button>
            <Button 
              variant="ghost" 
              className="py-4 px-3"
              onClick={() => navigate(`/groups/${slug}/chat`)}
            >
              <MessageSquare className="h-5 w-5 mr-2" />
              Chat
            </Button>
            <Button 
              variant="ghost" 
              className="py-4 px-3"
              onClick={() => navigate(`/groups/${slug}/calendar`)}
            >
              <Calendar className="h-5 w-5 mr-2" />
              Calendar
            </Button>
            <Button 
              variant="ghost" 
              className="py-4 px-3"
              onClick={() => navigate(`/groups/${slug}/members`)}
            >
              <Users className="h-5 w-5 mr-2" />
              Members
            </Button>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-3xl mx-auto w-full px-4">
        <div className="py-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className="flex gap-3 group">
              <Avatar className="h-8 w-8">
                <AvatarImage src={message.profiles.avatar_url || undefined} />
                <AvatarFallback>
                  {message.profiles.first_name?.[0]?.toUpperCase() || "?"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-start justify-between">
                  <p className="font-medium text-sm">
                    {message.profiles.first_name} {message.profiles.last_name}
                  </p>
                  {message.user_id === currentUser && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          className="text-red-600"
                          onClick={() => setMessageToDelete(message.id)}
                        >
                          Delete message
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
                <p className="text-sm text-gray-600">{message.content}</p>
                {message.image_url && (
                  <img 
                    src={supabase.storage.from('message-images').getPublicUrl(message.image_url).data.publicUrl} 
                    alt="Message attachment" 
                    className="max-w-sm rounded-lg border"
                  />
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {showScrollButton && (
        <Button
          className="fixed bottom-24 right-4 rounded-full shadow-lg bg-primary"
          size="icon"
          onClick={scrollToBottom}
        >
          <MessageSquare className="h-4 w-4" />
        </Button>
      )}

      <footer className="sticky bottom-16 bg-white border-t p-4">
        <div className="max-w-3xl mx-auto flex gap-2 items-center">
          <Input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type a message..."
            className="flex-1"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="hidden"
            id="image-upload"
          />
          <label htmlFor="image-upload">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="cursor-pointer"
              disabled={isUploading}
            >
              <Image className="h-5 w-5" />
            </Button>
          </label>
          <Button
            type="button"
            size="icon"
            onClick={handleSend}
            disabled={isUploading || (!newMessage.trim() && !imageFile)}
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </footer>

      <nav className="fixed bottom-0 left-0 right-0 border-t bg-white">
        <div className="flex justify-around items-center h-16">
          <Button variant="ghost" className="flex flex-col items-center gap-1 h-full" onClick={() => navigate('/front')}>
            <Home className="h-5 w-5 text-[#000080]" />
            <span className="text-xs">Home</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center gap-1 h-full" onClick={() => navigate('/groups')}>
            <Users className="h-5 w-5 text-[#000080]" />
            <span className="text-xs">Groups</span>
          </Button>
          <Button variant="ghost" className="flex flex-col items-center gap-1 h-full" onClick={() => navigate('/calendar')}>
            <Calendar className="h-5 w-5 text-[#000080]" />
            <span className="text-xs">Calendar</span>
          </Button>
        </div>
      </nav>

      <AlertDialog open={!!messageToDelete} onOpenChange={() => setMessageToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMessage}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default GroupChat;
