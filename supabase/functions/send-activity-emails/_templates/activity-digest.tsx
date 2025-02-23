
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'
import * as React from 'npm:react@18.3.1'

interface NotificationItem {
  message: string
  type: 'chat' | 'event' | 'member'
  group_title: string
  created_at: string
}

interface ActivityDigestEmailProps {
  firstName: string
  notifications: NotificationItem[]
}

export const ActivityDigestEmail = ({
  firstName,
  notifications,
}: ActivityDigestEmailProps) => (
  <Html>
    <Head />
    <Preview>New activities in your groups</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Hi {firstName}!</Heading>
        <Text style={text}>Here is an overview of what has happened in your groups:</Text>
        
        {notifications.map((notification, index) => (
          <Section key={index} style={notificationSection}>
            <Text style={groupTitle}>{notification.group_title}</Text>
            <Text style={notificationText}>{notification.message}</Text>
          </Section>
        ))}

        <Text style={footer}>
          You received this email because you opted in to activity updates.
          You can change this setting in your profile preferences.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ActivityDigestEmail

const main = {
  backgroundColor: '#ffffff',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
}

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  width: '580px',
}

const h1 = {
  color: '#000080',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '40px',
  margin: '0 0 20px',
}

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '16px 0',
}

const notificationSection = {
  borderLeft: '4px solid #000080',
  margin: '20px 0',
  padding: '12px 20px',
  backgroundColor: '#f8f9fa',
}

const groupTitle = {
  color: '#000080',
  fontSize: '18px',
  fontWeight: '600',
  margin: '0 0 8px',
}

const notificationText = {
  color: '#333',
  fontSize: '14px',
  margin: '0',
}

const footer = {
  color: '#898989',
  fontSize: '12px',
  lineHeight: '22px',
  margin: '32px 0 0',
  textAlign: 'center' as const,
}

