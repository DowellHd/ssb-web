'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Settings,
  Shield,
  Key,
  Smartphone,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  Check,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  getCurrentUser,
  getSessions,
  revokeSession,
  changePassword,
  enableMFA,
  confirmMFA,
  disableMFA,
  getMFAStatus,
  type User,
  type SessionInfo,
  type MFAEnableResponse,
  type MFAStatusResponse,
} from '@/lib/api/auth';
import { getErrorMessage } from '@/lib/api-client';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [mfaStatus, setMfaStatus] = useState<MFAStatusResponse | null>(null);

  // Change password state
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // MFA state
  const [showMFASetup, setShowMFASetup] = useState(false);
  const [mfaSetupData, setMfaSetupData] = useState<MFAEnableResponse | null>(null);
  const [mfaPassword, setMfaPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [mfaStep, setMfaStep] = useState<'password' | 'verify'>('password');
  const [enablingMFA, setEnablingMFA] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);

  // Disable MFA state
  const [showDisableMFA, setShowDisableMFA] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [disablingMFA, setDisablingMFA] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [userData, sessionsData, mfaStatusData] = await Promise.all([
        getCurrentUser(),
        getSessions(),
        getMFAStatus(),
      ]);
      setUser(userData);
      setSessions(sessionsData.sessions);
      setMfaStatus(mfaStatusData);
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

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setChangingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      toast.success('Password changed. Please log in again.');
      // Clear tokens and redirect to login
      localStorage.removeItem('access_token');
      router.push('/login');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setChangingPassword(false);
    }
  };

  const handleStartMFASetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnablingMFA(true);
    try {
      const data = await enableMFA(mfaPassword);
      setMfaSetupData(data);
      setMfaStep('verify');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setEnablingMFA(false);
    }
  };

  const handleConfirmMFA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mfaCode.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }

    setEnablingMFA(true);
    try {
      await confirmMFA(mfaCode);
      toast.success('MFA enabled successfully');
      setShowMFASetup(false);
      setMfaSetupData(null);
      setMfaPassword('');
      setMfaCode('');
      setMfaStep('password');
      await loadData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setEnablingMFA(false);
    }
  };

  const handleDisableMFA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (disableCode.length !== 6) {
      toast.error('Please enter a 6-digit code');
      return;
    }

    setDisablingMFA(true);
    try {
      await disableMFA(disablePassword, disableCode);
      toast.success('MFA disabled successfully');
      setShowDisableMFA(false);
      setDisablePassword('');
      setDisableCode('');
      await loadData();
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setDisablingMFA(false);
    }
  };

  const copyBackupCodes = () => {
    if (mfaSetupData?.backup_codes) {
      navigator.clipboard.writeText(mfaSetupData.backup_codes.join('\n'));
      setCopiedCodes(true);
      toast.success('Backup codes copied to clipboard');
      setTimeout(() => setCopiedCodes(false), 2000);
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
          {/* MFA Section */}
          <div className="py-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Smartphone className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">
                    Add extra security with TOTP
                  </p>
                </div>
              </div>
              <div>
                {user?.mfa_enabled ? (
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      Enabled
                    </span>
                    {mfaStatus && (
                      <span className="text-xs text-muted-foreground">
                        {mfaStatus.backup_codes_remaining} backup codes left
                      </span>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDisableMFA(!showDisableMFA)}
                    >
                      Disable
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowMFASetup(!showMFASetup)}
                  >
                    Enable MFA
                  </Button>
                )}
              </div>
            </div>

            {/* MFA Setup Flow */}
            {showMFASetup && !user?.mfa_enabled && (
              <div className="mt-4 p-4 border rounded-lg bg-muted/50">
                {mfaStep === 'password' && (
                  <form onSubmit={handleStartMFASetup} className="space-y-4">
                    <div>
                      <Label htmlFor="mfa-password">Confirm your password</Label>
                      <Input
                        id="mfa-password"
                        type="password"
                        value={mfaPassword}
                        onChange={(e) => setMfaPassword(e.target.value)}
                        placeholder="Enter your password"
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" disabled={enablingMFA}>
                        {enablingMFA ? 'Setting up...' : 'Continue'}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setShowMFASetup(false);
                          setMfaPassword('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                )}

                {mfaStep === 'verify' && mfaSetupData && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">1. Scan QR Code</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Scan this QR code with Google Authenticator, Authy, or another TOTP app.
                      </p>
                      <div className="flex justify-center p-4 bg-white rounded-lg">
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(mfaSetupData.qr_code_uri)}`}
                          alt="MFA QR Code"
                          className="w-48 h-48"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 text-center break-all">
                        Manual entry: {mfaSetupData.secret}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">2. Save Backup Codes</h4>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <p className="text-sm text-yellow-600">
                          Save these codes in a safe place. You will not see them again.
                        </p>
                      </div>
                      <div className="p-3 bg-muted rounded-lg font-mono text-sm grid grid-cols-2 gap-2">
                        {mfaSetupData.backup_codes.map((code, i) => (
                          <span key={i}>{code}</span>
                        ))}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={copyBackupCodes}
                      >
                        {copiedCodes ? (
                          <>
                            <Check className="h-4 w-4 mr-2" /> Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4 mr-2" /> Copy codes
                          </>
                        )}
                      </Button>
                    </div>

                    <form onSubmit={handleConfirmMFA}>
                      <h4 className="font-medium mb-2">3. Verify Setup</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        Enter the 6-digit code from your authenticator app.
                      </p>
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          maxLength={6}
                          value={mfaCode}
                          onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                          placeholder="000000"
                          className="w-32 text-center font-mono text-lg"
                        />
                        <Button type="submit" disabled={enablingMFA || mfaCode.length !== 6}>
                          {enablingMFA ? 'Verifying...' : 'Enable MFA'}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            )}

            {/* Disable MFA Form */}
            {showDisableMFA && user?.mfa_enabled && (
              <form onSubmit={handleDisableMFA} className="mt-4 p-4 border rounded-lg bg-muted/50 space-y-4">
                <div className="flex items-center gap-2 text-yellow-600">
                  <AlertTriangle className="h-4 w-4" />
                  <p className="text-sm">Disabling MFA will make your account less secure.</p>
                </div>
                <div>
                  <Label htmlFor="disable-password">Password</Label>
                  <Input
                    id="disable-password"
                    type="password"
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="disable-code">Authenticator Code</Label>
                  <Input
                    id="disable-code"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    value={disableCode}
                    onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ''))}
                    placeholder="000000"
                    className="w-32 font-mono"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" variant="destructive" disabled={disablingMFA}>
                    {disablingMFA ? 'Disabling...' : 'Disable MFA'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setShowDisableMFA(false);
                      setDisablePassword('');
                      setDisableCode('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Password Section */}
          <div className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Key className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">Password</p>
                  <p className="text-sm text-muted-foreground">
                    Change your account password
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowChangePassword(!showChangePassword)}
              >
                Change
              </Button>
            </div>

            {/* Change Password Form */}
            {showChangePassword && (
              <form onSubmit={handleChangePassword} className="mt-4 p-4 border rounded-lg bg-muted/50 space-y-4">
                <div>
                  <Label htmlFor="current-password">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter current password"
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="new-password">New Password</Label>
                  <div className="relative">
                    <Input
                      id="new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      minLength={8}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Must be at least 8 characters
                  </p>
                </div>
                <div>
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={changingPassword}>
                    {changingPassword ? 'Changing...' : 'Change Password'}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setShowChangePassword(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                  >
                    Cancel
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  You will be logged out after changing your password.
                </p>
              </form>
            )}
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
