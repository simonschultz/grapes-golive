
import { supabase } from "@/integrations/supabase/client";

/**
 * Get a group ID from a slug
 * @param slug The group slug
 * @returns The group ID if found, null otherwise
 */
export const getGroupIdFromSlug = async (slug: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('groups')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();
      
    if (error) {
      console.error("Error getting group ID from slug:", error);
      return null;
    }
    
    return data?.id || null;
  } catch (error) {
    console.error("Error getting group ID from slug:", error);
    return null;
  }
};

/**
 * Check if a user is a member of a group
 * @param groupId The group ID
 * @param userId The user ID
 * @returns True if the user is a member of the group, false otherwise
 */
export const isUserGroupMember = async (groupId: string, userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('group_members')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', userId)
      .maybeSingle();
      
    if (error) {
      console.error("Error checking group membership:", error);
      return false;
    }
    
    return !!data && ['admin', 'member'].includes(data.role);
  } catch (error) {
    console.error("Error checking group membership:", error);
    return false;
  }
};
