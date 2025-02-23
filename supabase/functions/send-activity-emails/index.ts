
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0"
import { Resend } from "npm:resend@2.0.0"
import React from 'npm:react@18.3.1'
import { renderAsync } from 'npm:@react-email/components@0.0.22'
import { ActivityDigestEmail } from './_templates/activity-digest.tsx'

const resend = new Resend(Deno.env.get("RESEND_API_KEY"))
const supabaseUrl = Deno.env.get('SUPABASE_URL')
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const supabase = createClient(supabaseUrl!, supabaseServiceKey!)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface NotificationWithGroup {
  message: string
  type: 'chat' | 'event' | 'member'
  created_at: string
  groups: {
    title: string
  }
}

serve(async () => {
  try {
    // Get email notification frequency from admin settings
    const { data: frequencySettings } = await supabase
      .from('admin_settings')
      .select('value')
      .eq('key', 'email_notification_frequency')
      .single()

    const hours = frequencySettings?.value?.hours || 24
    const cutoffTime = new Date()
    cutoffTime.setHours(cutoffTime.getHours() - hours)

    // Get users who have opted in for emails
    const { data: users } = await supabase
      .from('profiles')
      .select('id, first_name, email')
      .eq('accept_email', true)

    if (!users?.length) {
      console.log('No users opted in for emails')
      return new Response(JSON.stringify({ message: 'No users to process' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      })
    }

    let emailsSent = 0
    for (const user of users) {
      // Get user's last visit
      const { data: lastVisit } = await supabase
        .from('user_last_visits')
        .select('last_visit')
        .eq('user_id', user.id)
        .single()

      const lastVisitTime = lastVisit?.last_visit ? new Date(lastVisit.last_visit) : cutoffTime

      // Get notifications since last visit
      const { data: notifications } = await supabase
        .from('notifications')
        .select(`
          message,
          type,
          created_at,
          groups (
            title
          )
        `)
        .eq('user_id', user.id)
        .gt('created_at', lastVisitTime.toISOString())
        .order('created_at', { ascending: false })

      if (notifications?.length) {
        // Prepare notifications for email template
        const notificationsData = notifications.map((n: NotificationWithGroup) => ({
          message: n.message,
          type: n.type,
          group_title: n.groups.title,
          created_at: n.created_at,
        }))

        // Render email template
        const html = await renderAsync(
          React.createElement(ActivityDigestEmail, {
            firstName: user.first_name || 'there',
            notifications: notificationsData,
          })
        )

        // Send email
        await resend.emails.send({
          from: 'Grapes <onboarding@resend.dev>',
          to: [user.email],
          subject: 'Things happening in your groups',
          html,
        })

        emailsSent++
        console.log(`Sent digest email to ${user.email}`)
      }
    }

    return new Response(
      JSON.stringify({ message: `Successfully sent ${emailsSent} digest emails` }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Error in send-activity-emails function:', error)
    return new Response(
      JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})

