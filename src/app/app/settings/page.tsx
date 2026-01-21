'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Settings, Shield, Key, Smartphone, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  getCurrentUser,
  getSessions,
  revokeSession,
  type User,
  type SessionInfo,
} from '@/lib/api/auth';
import { getErrorMessage } from '@/lib/api-client';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [userData, sessionsData] = await Promise.all([
        getCurrentUser(),
        getSessions(),
      ]);
      setUser(userData);
      setSessions(sessionsData.sessions);
    } catch (error) {
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    try {
      await revokeSession(sessionId);
      toast.success('Session revoked');
      await loadData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">Account Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your account security and preferences
        </p>
      </div>

      {/* Profile section */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Settings className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold">Profile</h2>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="font-medium">{user?.email}</p>
            {user && !user.email_verified && (
              <p className="text-xs text-yellow-600 mt-1">
                Email not verified. Check your inbox.
              </p>
            )}
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Full Name</p>
            <p className="font-medium">{user?.full_name || 'Not set'}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Member Since</p>
            <p className="font-medium">
              {user?.created_at
                ? new Date(user.created_at).toLocaleDateString()
                : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Security section */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-green-100">
            <Shield className="h-5 w-5 text-green-600" />
          </div>
          <h2 className="text-lg font-semibold">Security</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b">
            <div className="flex items-center gap-3">
              <Smartphone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-sm text-muted-foreground">
                  Add extra security to your account
                </p>
              </div>
            </div>
            <div>
              {user?.mfa_enabled ? (
                <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-800">
                  Enabled
                </span>
              ) : (
                <Button variant="outline" size="sm" disabled>
                  Enable MFA (Coming Soon)
                </Button>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <Key className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="font-medium">Password</p>
                <p className="text-sm text-muted-foreground">
                  Change your account password
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" disabled>
              Change (Coming Soon)
            </Button>
          </div>
        </div>
      </div>

      {/* Active sessions */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <RefreshCw className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-lg font-semibold">Active Sessions</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={loadData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-3">
          {sessions.length === 0 ? (
            <p className="text-muted-foreground text-sm">No active sessions</p>
          ) : (
            sessions.map((session) => (
              <div
                key={session.id}
                className="flex items-center justify-between py-3 border-b last:border-0"
              >
                <div>
                  <p className="font-medium text-sm">
                    {session.device_info.user_agent?.substring(0, 50) ||
                      'Unknown device'}
                    {session.is_current && (
                      <span className="ml-2 text-xs text-green-600">
                        (Current)
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    IP: {session.device_info.ip_address || 'Unknown'} •{' '}
                    {new Date(session.last_used_at).toLocaleString()}
                  </p>
                </div>
                {!session.is_current && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleRevokeSession(session.id)}
                  >
                    Revoke
                  </Button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
