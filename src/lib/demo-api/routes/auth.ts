/** Auth endpoints. Any credentials "work"; tokens are not validated anywhere. */
import { generateMockUser } from '../../mock-data';
import { daysAgo, hoursAgo, iso } from '../prng';
import { del, get, patch, post, type DemoRoute } from '../router';

export const DEMO_TOKEN = 'demo-token-not-a-real-credential';

const user = () => generateMockUser('pro');
const message = (text: string) => ({ message: text, success: true });

const session = (extra: Record<string, unknown> = {}) => ({
  access_token: DEMO_TOKEN,
  token_type: 'bearer',
  expires_in: 900,
  user: user(),
  ...extra,
});

export const authRoutes: DemoRoute[] = [
  post('/auth/login', () => session({ requires_mfa: false })),
  post('/auth/demo-login', () => session({ requires_mfa: false })),
  post('/auth/register', () => session({ message: 'Demo account created. No email is sent in demo mode.' })),
  post('/auth/mfa/verify', () => session({ requires_mfa: false })),
  post('/auth/refresh', () => ({ access_token: DEMO_TOKEN, expires_in: 900 })),
  post('/auth/logout', () => message('Logged out')),
  get('/auth/me', () => user()),
  patch('/auth/me/avatar', ({ body }) => ({ ...user(), avatar_url: body?.avatar_url ?? null })),

  post('/auth/verify-email', () => message('Email verified')),
  post('/auth/resend-verification', () => message('Verification email sent (demo: nothing was sent)')),
  post('/auth/forgot-password', () => message('If that account exists, a reset link has been sent (demo: nothing was sent)')),
  post('/auth/reset-password', () => message('Password updated')),
  post('/auth/change-password', () => message('Password updated')),

  get('/auth/mfa/status', () => ({ mfa_enabled: false, backup_codes_remaining: 0 })),
  post('/auth/mfa/enable', () => ({
    secret: 'DEMOSECRETDEMOSECRET',
    qr_code_uri: 'otpauth://totp/SSB%20Demo:demo@example.com?secret=DEMOSECRETDEMOSECRET&issuer=SSB%20Demo',
    backup_codes: ['demo-0001', 'demo-0002', 'demo-0003', 'demo-0004', 'demo-0005', 'demo-0006'],
    message: 'Demo only — scan is not required.',
  })),
  post('/auth/mfa/confirm', () => message('Two-factor authentication enabled')),
  post('/auth/mfa/disable', () => message('Two-factor authentication disabled')),

  get('/auth/sessions', () => ({
    sessions: [
      {
        id: 'session-001',
        device_info: { ip_address: '127.0.0.1', user_agent: 'Demo Browser', device_name: 'This device' },
        last_used_at: iso(hoursAgo(0.1)),
        created_at: iso(daysAgo(2)),
        is_current: true,
      },
      {
        id: 'session-002',
        device_info: { ip_address: '192.0.2.24', user_agent: 'Demo Mobile Safari', device_name: 'Demo phone' },
        last_used_at: iso(daysAgo(1)),
        created_at: iso(daysAgo(9)),
        is_current: false,
      },
    ],
  })),
  post('/auth/sessions/:id/revoke', () => message('Session revoked')),
  del('/auth/sessions/:id', () => message('Session revoked')),
];
