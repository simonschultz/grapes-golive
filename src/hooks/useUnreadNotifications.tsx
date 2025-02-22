
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useUnreadNotifications = () => {
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    const checkUnreadNotifications = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

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

    checkUnreadNotifications();

    // Subscribe to all changes in notifications table (INSERT, UPDATE, DELETE)
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${supabase.auth.getUser().then(({ data }) => data.user?.id)}`
        },
        () => {
          // Recheck unread count whenever there's any change to notifications
          checkUnreadNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return hasUnread;
};
