'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Link from 'next/link';
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
  Bug,
  RotateCcw,
  Camera,
  Upload,
  Bell,
  Mail,
  MonitorSmartphone,
  SlidersHorizontal,
  Database,
  ChevronRight,
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
  updateAvatar,
  type User,
  type SessionInfo,
  type MFAEnableResponse,
  type MFAStatusResponse,
} from '@/lib/api/auth';
import {
  getNotificationPreferences,
  updateNotificationPreferences,
  type NotificationPreferences,
  type AlertThresholds,
} from '@/lib/api/notifications';
import { UserAvatar, PRESET_COLORS } from '@/components/ui/user-avatar';
import { getErrorMessage } from '@/lib/api-client';
import { resetAssistantHint } from '@/lib/assistant-hint';

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [mfaStatus, setMfaStatus] = useState<MFAStatusResponse | null>(null);

  // Avatar state
  const [avatarTab, setAvatarTab] = useState<'preset' | 'upload'>('preset');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [avatarSaving, setAvatarSaving] = useState(false);

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

  // Notification preferences state
  const [notifPrefs, setNotifPrefs] = useState<NotificationPreferences | null>(null);
  const [savingNotif, setSavingNotif] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [userData, sessionsData, mfaStatusData, notifData] = await Promise.all([
        getCurrentUser(),
        getSessions(),
        getMFAStatus(),
        getNotificationPreferences(),
      ]);
      setUser(userData);
      setSessions(sessionsData.sessions);
      setMfaStatus(mfaStatusData);
      setNotifPrefs(notifData);
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

  const handleSavePresetAvatar = async () => {
    if (!selectedPreset) return;
    setAvatarSaving(true);
    try {
      const updated = await updateAvatar(`preset:${selectedPreset}`);
      setUser(updated);
      toast.success('Profile picture updated');
      setSelectedPreset(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setAvatarSaving(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File must be under 5MB');
      return;
    }

    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, 256, 256);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      if (dataUrl.length > 204_800) {
        toast.error('Image too large after compression. Try a smaller file.');
        return;
      }
      setUploadPreview(dataUrl);
    };
    img.src = URL.createObjectURL(file);
  };

  const handleSaveUploadAvatar = async () => {
    if (!uploadPreview) return;
    setAvatarSaving(true);
    try {
      const updated = await updateAvatar(uploadPreview);
      setUser(updated);
      toast.success('Profile picture updated');
      setUploadPreview(null);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setAvatarSaving(false);
    }
  };

  const handleNotifToggle = async (key: keyof NotificationPreferences, value: boolean) => {
    if (!notifPrefs) return;
    const optimistic = { ...notifPrefs, [key]: value };
    setNotifPrefs(optimistic);
    setSavingNotif(true);
    try {
      const updated = await updateNotificationPreferences({ [key]: value });
      setNotifPrefs(updated);
    } catch (error) {
      setNotifPrefs(notifPrefs);
      toast.error(getErrorMessage(error));
    } finally {
      setSavingNotif(false);
    }
  };

  const handleThresholdChange = async (
    key: keyof AlertThresholds,
    value: number
  ) => {
    if (!notifPrefs) return;
    const updated = {
      ...notifPrefs,
      thresholds: { ...notifPrefs.thresholds, [key]: value },
    };
    setNotifPrefs(updated);
  };

  const saveThresholds = async () => {
    if (!notifPrefs) return;
    setSavingNotif(true);
    try {
      const updated = await updateNotificationPreferences({
        thresholds: notifPrefs.thresholds,
      });
      setNotifPrefs(updated);
      toast.success('Alert thresholds saved');
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setSavingNotif(false);
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
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Account Settings</h1>
          <p className="text-muted-foreground mt-1">
            Manage your account security and preferences
          </p>
        </div>
        <Link
          href="/app/settings/privacy"
          className="flex items-center gap-2 rounded-lg border border-border/70 bg-card px-3 py-2 text-sm text-muted-foreground hover:bg-accent/50 hover:text-foreground transition-colors shrink-0 elevation-1"
        >
          <Database className="h-4 w-4" />
          Privacy & Data
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Profile Picture section */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-primary/10">
            <Camera className="h-5 w-5 text-primary" />
          </div>
          <h2 className="text-lg font-semibold">Profile Picture</h2>
        </div>

        <div className="flex items-center gap-4 mb-6">
          <UserAvatar
            avatarUrl={user?.avatar_url}
            name={user?.full_name || user?.email || '?'}
            size={64}
          />
          <div>
            <p className="font-medium">{user?.full_name || user?.email}</p>
            <p className="text-sm text-muted-foreground">
              {user?.avatar_url
                ? user.avatar_url.startsWith('preset:')
                  ? `Color: ${user.avatar_url.split(':')[1]}`
                  : 'Custom photo'
                : 'Using auto-generated color'}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4 border-b">
          <button
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
              avatarTab === 'preset'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setAvatarTab('preset')}
          >
            Color Preset
          </button>
          <button
            className={`pb-2 px-1 text-sm font-medium border-b-2 transition-colors ${
              avatarTab === 'upload'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setAvatarTab('upload')}
          >
            Upload Photo
          </button>
        </div>

        {avatarTab === 'preset' && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              {Object.entries(PRESET_COLORS).map(([colorName, colors]) => (
                <button
                  key={colorName}
                  title={colorName}
                  onClick={() => setSelectedPreset(colorName)}
                  className={`rounded-full flex items-center justify-center font-semibold text-xs transition-all ${colors.bg} ${colors.text} ${
                    selectedPreset === colorName
                      ? 'ring-2 ring-offset-2 ring-primary scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ width: 40, height: 40 }}
                >
                  {(user?.full_name || user?.email || '?').slice(0, 2).toUpperCase()}
                </button>
              ))}
            </div>
            {selectedPreset && (
              <div className="flex items-center gap-3">
                <p className="text-sm text-muted-foreground">
                  Selected: <span className="capitalize font-medium">{selectedPreset}</span>
                </p>
                <Button size="sm" onClick={handleSavePresetAvatar} disabled={avatarSaving}>
                  {avatarSaving ? 'Saving...' : 'Save'}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSelectedPreset(null)}>
                  Cancel
                </Button>
              </div>
            )}
          </div>
        )}

        {avatarTab === 'upload' && (
          <div className="space-y-4">
            <div>
              <label
                htmlFor="avatar-upload"
                className="flex items-center gap-2 cursor-pointer w-fit px-4 py-2 rounded-md border text-sm hover:bg-muted transition-colors"
              >
                <Upload className="h-4 w-4" />
                Choose image
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleFileChange}
              />
              <p className="text-xs text-muted-foreground mt-2">
                Max 5MB · JPG, PNG or WebP · Resized to 256×256
              </p>
            </div>

            {uploadPreview && (
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={uploadPreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleSaveUploadAvatar} disabled={avatarSaving}>
                    {avatarSaving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => setUploadPreview(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
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

      {/* Notifications section */}
      <div className="rounded-lg border bg-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-orange-100">
            <Bell className="h-5 w-5 text-orange-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Notifications</h2>
            <p className="text-sm text-muted-foreground">
              Choose what you hear about and how
            </p>
          </div>
        </div>

        {notifPrefs ? (
          <div className="space-y-8">
            {/* Email notifications */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium text-sm">Email Notifications</h3>
              </div>
              <div className="space-y-4">
                {(
                  [
                    {
                      key: 'email_security_alerts' as const,
                      label: 'Security alerts',
                      description: 'New sign-ins, password changes, suspicious activity',
                      locked: true,
                    },
                    {
                      key: 'email_billing' as const,
                      label: 'Billing & subscription',
                      description: 'Payment confirmations and subscription changes',
                      locked: true,
                    },
                    {
                      key: 'email_portfolio_summary' as const,
                      label: 'Weekly portfolio summary',
                      description: 'A digest of your portfolio performance every week',
                      locked: false,
                    },
                    {
                      key: 'email_signal_alerts' as const,
                      label: 'Signal alerts',
                      description: 'Email when new trading signals fire for your watchlist',
                      locked: false,
                    },
                    {
                      key: 'email_price_alerts' as const,
                      label: 'Price threshold alerts',
                      description: 'Email when a stock hits your configured price target',
                      locked: false,
                    },
                    {
                      key: 'email_news_digest' as const,
                      label: 'Daily market news digest',
                      description: 'Morning summary of key market events and news',
                      locked: false,
                    },
                    {
                      key: 'email_paper_trade_fills' as const,
                      label: 'Paper trade confirmations',
                      description: 'Email when paper orders are filled or rejected',
                      locked: false,
                    },
                    {
                      key: 'email_product_updates' as const,
                      label: 'Product updates',
                      description: 'New features, improvements, and platform news',
                      locked: false,
                    },
                  ] satisfies Array<{
                    key: keyof NotificationPreferences;
                    label: string;
                    description: string;
                    locked: boolean;
                  }>
                ).map(({ key, label, description, locked }) => (
                  <div key={key} className="flex items-start justify-between py-2 border-b last:border-0">
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                      {locked && (
                        <p className="text-xs text-muted-foreground mt-0.5 italic">
                          Required for account safety
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      disabled={locked || savingNotif}
                      onClick={() =>
                        !locked && handleNotifToggle(key, !notifPrefs[key])
                      }
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                        notifPrefs[key] ? 'bg-primary' : 'bg-input'
                      }`}
                      aria-pressed={notifPrefs[key] as boolean}
                    >
                      <span
                        className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                          notifPrefs[key] ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* In-app notifications */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MonitorSmartphone className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium text-sm">In-App Notifications</h3>
              </div>
              <div className="space-y-4">
                {([
                  {
                    key: 'push_signal_alerts' as const,
                    label: 'Signal alerts',
                    description: 'In-app banner when signals fire for your watchlist',
                  },
                  {
                    key: 'push_portfolio_alerts' as const,
                    label: 'Portfolio risk warnings',
                    description: 'Drawdown and concentration alerts inside the app',
                  },
                  {
                    key: 'push_paper_trade_fills' as const,
                    label: 'Paper trade fills',
                    description: 'In-app notification when paper orders execute',
                  },
                  {
                    key: 'push_earnings_reminders' as const,
                    label: 'Earnings reminders',
                    description: 'Reminder before earnings for stocks you follow',
                  },
                  {
                    key: 'push_community_activity' as const,
                    label: 'Community activity',
                    description: 'Likes, comments, and mentions on your posts',
                  },
                ] as const).map(({ key, label, description }) => (
                  <div key={key} className="flex items-start justify-between py-2 border-b last:border-0">
                    <div className="flex-1 min-w-0 pr-4">
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                    </div>
                    <button
                      type="button"
                      disabled={savingNotif}
                      onClick={() => handleNotifToggle(key, !notifPrefs[key])}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                        notifPrefs[key] ? 'bg-primary' : 'bg-input'
                      }`}
                      aria-pressed={notifPrefs[key] as boolean}
                    >
                      <span
                        className={`pointer-events-none block h-5 w-5 rounded-full bg-background shadow-lg ring-0 transition-transform ${
                          notifPrefs[key] ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Alert thresholds */}
            <div>
              <div className="flex items-center gap-2 mb-1">
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                <h3 className="font-medium text-sm">Alert Thresholds</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Trigger portfolio and position alerts at these levels
              </p>
              <div className="space-y-5">
                {([
                  {
                    key: 'portfolio_drawdown_pct' as const,
                    label: 'Portfolio drawdown alert',
                    description: 'Alert when overall portfolio drops this % from its peak',
                    min: 1,
                    max: 50,
                    step: 1,
                  },
                  {
                    key: 'position_loss_pct' as const,
                    label: 'Single position loss alert',
                    description: 'Alert when any position loses this % from your entry price',
                    min: 1,
                    max: 75,
                    step: 1,
                  },
                  {
                    key: 'paper_drawdown_pct' as const,
                    label: 'Paper account drawdown alert',
                    description: 'Alert when your paper trading account drawdown exceeds this %',
                    min: 1,
                    max: 75,
                    step: 1,
                  },
                ] as const).map(({ key, label, description, min, max, step }) => (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-1">
                      <Label className="text-sm font-medium">{label}</Label>
                      <span className="text-sm font-semibold tabular-nums text-primary">
                        {notifPrefs.thresholds[key]}%
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">{description}</p>
                    <input
                      type="range"
                      min={min}
                      max={max}
                      step={step}
                      value={notifPrefs.thresholds[key]}
                      onChange={(e) =>
                        handleThresholdChange(key, Number(e.target.value))
                      }
                      className="w-full h-2 accent-primary cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground mt-1">
                      <span>{min}%</span>
                      <span>{max}%</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5">
                <Button size="sm" onClick={saveThresholds} disabled={savingNotif}>
                  {savingNotif ? 'Saving...' : 'Save thresholds'}
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center py-8">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        )}
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

      {/* Developer section - only visible in development */}
      {process.env.NODE_ENV !== 'production' && (
        <div className="rounded-lg border border-dashed border-yellow-600/50 bg-yellow-950/20 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-yellow-600/20">
              <Bug className="h-5 w-5 text-yellow-500" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-yellow-500">Developer Tools</h2>
              <p className="text-xs text-muted-foreground">Only visible in development mode</p>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-sm">Reset Assistant Hint</p>
                <p className="text-xs text-muted-foreground">
                  Show the onboarding hint again on next page load
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  resetAssistantHint();
                  toast.success('Assistant hint reset. Refresh the page to see it again.');
                }}
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
