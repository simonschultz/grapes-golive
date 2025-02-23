
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useUnreadNotifications = () => {
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel>;

    const setupNotifications = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const checkUnreadNotifications = async () => {
          try {
            const { count } = await supabase
              .from('notifications')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', user.id)
              .eq('read', false);

            setHasUnread(count ? count > 0 : false);
          } catch (error) {
            console.error('Error checking unread notifications:', error);
          }
        };

        await checkUnreadNotifications();

        // Subscribe to all changes in notifications table for the current user
        channel = supabase
          .channel('schema-db-changes')
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'notifications',
              filter: `user_id=eq.${user.id}`
            },
            () => {
              checkUnreadNotifications();
            }
          )
          .subscribe();

      } catch (error) {
        console.error('Error setting up notifications:', error);
      }
    };

    setupNotifications();

    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, []);

  return hasUnread;
};
