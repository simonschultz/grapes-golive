import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MessageSquare, Send, ImagePlus, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AppLayout } from "@/components/layout/AppLayout";
import { GroupNavigation } from "@/components/group/GroupNavigation";

interface Message {
  id: string;
  content: string;
  image_url: string | null;
  user_id: string;
  created_at: string;
  user: {
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  } | null;
}

interface GroupData {
  id: string;
  title: string;
  description: string | null;
  is_private: boolean;
  created_by: string;
}

const GroupChat = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [group, setGroup] = useState<GroupData | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [currentUser, setCurrentUser] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOS(isIOSDevice);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

        setGroup(groupData);
        setUserRole(memberData.role);

        const { data: messagesData, error: messagesError } = await supabase
          .from('messages')
          .select(`
            *,
            user:user_id (
              first_name,
              last_name,
              avatar_url
            )
          `)
          .eq('group_id', groupData.id)
          .order('created_at', { ascending: true });

        if (messagesError) throw messagesError;
        setMessages(messagesData || []);

        const channel = supabase
          .channel('group-messages')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'messages',
              filter: `group_id=eq.${groupData.id}`
            },
            async (payload) => {
              const { data: userData, error: userError } = await supabase
                .from('profiles')
                .select('first_name, last_name, avatar_url')
                .eq('id', payload.new.user_id)
                .single();

              if (userError) {
                console.error('Error fetching user data:', userError);
                return;
              }

              const newMessage: Message = {
                id: payload.new.id,
                content: payload.new.content,
                image_url: payload.new.image_url,
                user_id: payload.new.user_id,
                created_at: payload.new.created_at,
                user: userData
              };

              setMessages(prev => [...prev, newMessage]);
            }
          )
          .on(
            'postgres_changes',
            {
              event: 'DELETE',
              schema: 'public',
              table: 'messages',
              filter: `group_id=eq.${groupData.id}`
            },
            (payload) => {
              console.log('Message deleted:', payload.old.id);
              setMessages(prev => prev.filter(msg => msg.id !== payload.old.id));
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
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

  const handleDeleteMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('user_id', currentUser);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Message deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting message:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setMessageToDelete(null);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !group) return;

    setIsSending(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('chat-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { error } = await supabase
        .from('messages')
        .insert({
          content: '',
          image_url: filePath,
          group_id: group.id,
          user_id: currentUser
        });

      if (error) throw error;

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
      setIsSending(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !group || isSending) return;

    setIsSending(true);
    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          content: newMessage.trim(),
          group_id: group.id,
          user_id: currentUser
        });

      if (error) throw error;
      setNewMessage("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
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
    <AppLayout>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white border-b">
          <div className="max-w-3xl mx-auto">
            <div className="p-4 flex items-center justify-between">
              <h1 className="text-xl font-semibold">{group.title}</h1>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => navigate(`/groups/${slug}/settings`)}
              >
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </header>

        <GroupNavigation slug={slug || ''} userRole={userRole} />

        <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 pb-40 overflow-y-auto">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.user_id === currentUser ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarImage 
                      src={message.user?.avatar_url || undefined}
                      alt={`${message.user?.first_name || 'User'}'s avatar`}
                    />
                    <AvatarFallback>
                      {message.user?.first_name?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {message.user_id === currentUser && (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-32 p-2">
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => setMessageToDelete(message.id)}
                        >
                          Delete
                        </Button>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
                <div className="flex-1">
                  <div
                    className={`rounded-lg p-3 max-w-[80%] break-words ${
                      message.user_id === currentUser
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm mb-1">
                      {message.user?.first_name} {message.user?.last_name}
                    </p>
                    {message.image_url && (
                      <img 
                        src={supabase.storage.from('chat-images').getPublicUrl(message.image_url).data.publicUrl}
                        alt="Chat image"
                        className="max-w-full rounded-lg mb-2"
                      />
                    )}
                    {message.content && (
                      <p className="whitespace-pre-wrap">{message.content}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </main>

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
              <AlertDialogAction
                onClick={() => messageToDelete && handleDeleteMessage(messageToDelete)}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="fixed bottom-0 left-0 right-0 md:left-64 bg-white border-t p-4">
          <div className="max-w-3xl mx-auto">
            <div className="flex gap-2">
              <Textarea
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Type a message..."
                className={`resize-none min-h-[60px] h-[60px] py-2 ${isIOS ? 'text-base' : 'text-sm'}`}
                style={isIOS ? { fontSize: '16px' } : undefined}
                rows={2}
              />
              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || isSending}
                  size="icon"
                  className="bg-[#000080] hover:bg-[#000060]"
                >
                  <Send className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSending}
                >
                  <ImagePlus className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handleImageUpload}
            />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default GroupChat;
