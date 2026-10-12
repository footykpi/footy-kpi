import React from 'react'
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  athleteName?: string
  teamName?: string
  acceptUrl?: string
}

const CoachInviteEmail = ({ athleteName, teamName, acceptUrl }: Props) => {
  const name = athleteName?.trim() || 'An athlete'
  const team = teamName?.trim()
  const url = acceptUrl || 'https://footykpi.com/auth?mode=signup'

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{name} invited you to review their Footy KPI portfolio</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logo}>FOOTY KPI</Text>
          </Section>
          <Heading style={heading}>You're invited, Coach</Heading>
          <Text style={text}>
            {name}
            {team ? ` (${team})` : ''} has invited you to review their athletic
            portfolio on Footy KPI — season stats, game logs, highlights, and
            awards.
          </Text>
          <Text style={text}>
            As an invited coach you can review their data and approve stats and
            awards/certificates with a Verified badge.
          </Text>
          <Section style={buttonSection}>
            <Button style={button} href={url}>
              Sign up &amp; accept the invite
            </Button>
          </Section>
          <Text style={small}>
            Sign up as a <strong>Coach</strong> with this exact email address —
            the invitation will be waiting on your coach dashboard.
          </Text>
          <Hr style={hr} />
          <Text style={footer}>
            Footy KPI — every game, part of a permanent history.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: CoachInviteEmail,
  subject: (data: Record<string, any>) =>
    `${data.athleteName?.trim() || 'An athlete'} invited you to coach on Footy KPI`,
  displayName: 'Coach invitation',
  previewData: {
    athleteName: 'Shay Sandifer',
    teamName: 'Gilbert Tigers',
    acceptUrl: 'https://footykpi.com/auth?mode=signup',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '0 0 24px', maxWidth: '560px', margin: '0 auto' }
const header = { backgroundColor: '#0f172a', padding: '20px 25px' }
const logo = {
  color: '#f8fafc',
  fontSize: '20px',
  fontWeight: 'bold' as const,
  letterSpacing: '2px',
  margin: '0',
}
const heading = {
  color: '#0f172a',
  fontSize: '24px',
  padding: '0 25px',
  margin: '28px 0 12px',
}
const text = { color: '#334155', fontSize: '15px', lineHeight: '22px', padding: '0 25px' }
const small = { color: '#64748b', fontSize: '13px', lineHeight: '20px', padding: '0 25px' }
const buttonSection = { textAlign: 'center' as const, padding: '8px 25px 16px' }
const button = {
  backgroundColor: '#4f46e5',
  color: '#ffffff',
  fontSize: '15px',
  fontWeight: 'bold' as const,
  padding: '12px 28px',
  borderRadius: '8px',
  textDecoration: 'none',
}
const hr = { borderColor: '#e2e8f0', margin: '24px 25px 12px' }
const footer = { color: '#94a3b8', fontSize: '12px', padding: '0 25px' }
