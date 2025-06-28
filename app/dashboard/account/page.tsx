'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  CreditCard,
  Globe,
  Bell,
  Shield,
  Trash2,
  ChevronRight,
  Loader2,
  Check,
  AlertCircle,
  Key,
  Palette,
  FileText,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/contexts/auth-context';
import { userService } from '@/lib/features/auth/services/user-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface UserProfile {
  displayName?: string;
  email?: string;
  photoURL?: string;
  firstName?: string;
  lastName?: string;
  jobTitle?: string;
  company?: string;
  location?: string;
  bio?: string;
  preferences?: {
    theme?: 'light' | 'dark' | 'system';
    emailNotifications?: boolean;
    marketingEmails?: boolean;
  };
  subscription?: {
    plan: 'free' | 'pro' | 'enterprise';
    status: 'active' | 'cancelled' | 'expired';
    endDate?: any;
  };
}

export default function AccountPage() {
  const router = useRouter();
  const { user, logout, updateProfile, updateEmail, deleteAccount } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({});
  const [activeTab, setActiveTab] = useState('account');
  const [redemptionCode, setRedemptionCode] = useState('');

  // Form states
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);

  // Dialog states
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  useEffect(() => {
    loadUserProfile();
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;

    try {
      const userProfile = await userService.getUserDocument(user.uid);
      if (userProfile) {
        setProfile(userProfile);
        setFirstName(userProfile.firstName || '');
        setLastName(userProfile.lastName || '');
        setJobTitle(userProfile.jobTitle || '');
        setCompany(userProfile.company || '');
        setLocation(userProfile.location || '');
        setBio(userProfile.bio || '');
        setTheme(userProfile.preferences?.theme || 'system');
        setEmailNotifications(userProfile.preferences?.emailNotifications ?? true);
        setMarketingEmails(userProfile.preferences?.marketingEmails ?? false);
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load user profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    setSaving(true);
    try {
      await userService.updateUserDocument(user.uid, {
        firstName,
        lastName,
        jobTitle,
        company,
        location,
        bio,
        displayName: `${firstName} ${lastName}`.trim(),
      });

      // Update Firebase Auth profile
      if (firstName || lastName) {
        await updateProfile({
          displayName: `${firstName} ${lastName}`.trim(),
        });
      }

      toast({
        title: 'Success',
        description: 'Profile updated successfully',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    if (!user) return;

    setSaving(true);
    try {
      await userService.updateUserPreferences(user.uid, {
        theme,
        emailNotifications,
        marketingEmails,
      });

      // Apply theme
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else if (theme === 'light') {
        document.documentElement.classList.remove('dark');
      } else {
        // System preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.toggle('dark', prefersDark);
      }

      toast({
        title: 'Success',
        description: 'Preferences updated successfully',
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      toast({
        title: 'Error',
        description: 'Failed to update preferences',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRedeemCode = async () => {
    if (!redemptionCode.trim()) return;

    setSaving(true);
    try {
      // TODO: Implement redemption code logic
      toast({
        title: 'Coming Soon',
        description: 'Redemption code feature will be available soon',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Invalid redemption code',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
      setRedemptionCode('');
    }
  };

  const handleEmailChange = async (newEmail: string, password: string) => {
    try {
      await updateEmail(newEmail, password);
      setShowEmailDialog(false);
      toast({
        title: 'Success',
        description: 'Email update request sent. Please check your new email for verification.',
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update email',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') return;

    try {
      // TODO: Get password from user for re-authentication
      const password = prompt('Please enter your password to confirm account deletion:');
      if (!password) return;

      await deleteAccount(password);
      router.push('/');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete account',
        variant: 'destructive',
      });
    }
  };

  const handleManageBilling = () => {
    // TODO: Integrate with Stripe Customer Portal
    toast({
      title: 'Coming Soon',
      description: 'Billing management will be available soon',
    });
  };

  const getUserInitials = () => {
    if (profile.displayName) {
      return profile.displayName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase();
    }
    return user?.email?.[0].toUpperCase() || 'U';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Account Settings</h1>
            <p className="text-muted-foreground mt-1">
              Manage your account settings and preferences
            </p>
          </div>
          <Avatar className="w-16 h-16">
            <AvatarImage src={user?.photoURL || undefined} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xl">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>

          <TabsContent value="account" className="space-y-6 mt-6">
            {/* Profile Information */}
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>
                  Update your personal information and professional details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input
                      id="jobTitle"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="Software Engineer"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Tech Corp"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="San Francisco, CA"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    className="w-full min-h-[100px] px-3 py-2 border border-input rounded-md bg-background text-sm"
                  />
                </div>

                <Button onClick={handleSaveProfile} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Language Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Language Settings</CardTitle>
                <CardDescription>
                  Select the language to be used in the Rezi web app
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select defaultValue="en-US">
                  <SelectTrigger className="w-full md:w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en-US">English (US)</SelectItem>
                    <SelectItem value="en-GB">English (GB)</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="fr-CA">Français (Canada)</SelectItem>
                    <SelectItem value="hi">हिन्दी</SelectItem>
                    <SelectItem value="ko">한국어</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Theme Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Theme Preferences</CardTitle>
                <CardDescription>
                  Choose your preferred color theme
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select value={theme} onValueChange={(value: any) => setTheme(value)}>
                  <SelectTrigger className="w-full md:w-64">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">
                      <div className="flex items-center">
                        <Palette className="w-4 h-4 mr-2" />
                        Light
                      </div>
                    </SelectItem>
                    <SelectItem value="dark">
                      <div className="flex items-center">
                        <Palette className="w-4 h-4 mr-2" />
                        Dark
                      </div>
                    </SelectItem>
                    <SelectItem value="system">
                      <div className="flex items-center">
                        <Palette className="w-4 h-4 mr-2" />
                        System
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={handleSavePreferences} className="mt-4" disabled={saving}>
                  Save Theme
                </Button>
              </CardContent>
            </Card>

            {/* Redemption Code */}
            <Card>
              <CardHeader>
                <CardTitle>Redemption Code</CardTitle>
                <CardDescription>
                  Have a promo code? Redeem it here
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Input
                    value={redemptionCode}
                    onChange={(e) => setRedemptionCode(e.target.value)}
                    placeholder="Enter redemption code"
                    className="flex-1"
                  />
                  <Button onClick={handleRedeemCode} disabled={saving || !redemptionCode}>
                    Apply
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Email Management */}
            <Card>
              <CardHeader>
                <CardTitle>Change Email</CardTitle>
                <CardDescription>
                  Your current email address is <span className="font-semibold">{user?.email}</span>
                  {user?.providerData[0]?.providerId && (
                    <span> (Signed in with {user.providerData[0].providerId})</span>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Mail className="w-4 h-4 mr-2" />
                      Request Email Change
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Change Email Address</DialogTitle>
                      <DialogDescription>
                        Enter your new email address and current password
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      handleEmailChange(
                        formData.get('email') as string,
                        formData.get('password') as string
                      );
                    }}>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="new-email">New Email Address</Label>
                          <Input
                            id="new-email"
                            name="email"
                            type="email"
                            required
                            placeholder="newemail@example.com"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="current-password">Current Password</Label>
                          <Input
                            id="current-password"
                            name="password"
                            type="password"
                            required
                            placeholder="Enter your password"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button type="submit">Update Email</Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* Subscription Management */}
            <Card>
              <CardHeader>
                <CardTitle>Subscription & Billing</CardTitle>
                <CardDescription>
                  Manage your subscription and payment information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                  <div>
                    <p className="font-semibold">Current Plan: {profile.subscription?.plan || 'Free'}</p>
                    <p className="text-sm text-muted-foreground">
                      Status: {profile.subscription?.status || 'Active'}
                    </p>
                  </div>
                  <Button onClick={handleManageBilling} variant="outline">
                    <CreditCard className="w-4 h-4 mr-2" />
                    Manage Billing
                  </Button>
                </div>

                {profile.subscription?.plan !== 'free' && (
                  <Button variant="destructive" className="w-full">
                    Cancel Subscription
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Delete Account */}
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Delete Account</CardTitle>
                <CardDescription>
                  Permanently delete your account and all your resumes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                  <DialogTrigger asChild>
                    <Button variant="destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete Account
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Are you absolutely sure?</DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. This will permanently delete your
                        account and remove all your data from our servers.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <Label htmlFor="delete-confirm">
                        Type <span className="font-mono font-bold">DELETE</span> to confirm
                      </Label>
                      <Input
                        id="delete-confirm"
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value)}
                        placeholder="Type DELETE"
                        className="mt-2"
                      />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                        Cancel
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={handleDeleteAccount}
                        disabled={deleteConfirmation !== 'DELETE'}
                      >
                        Delete Account
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6 mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>
                  Manage your email notification preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="email-notifications" className="text-base">
                      Email Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive emails about your account activity
                    </p>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="marketing-emails" className="text-base">
                      Marketing Emails
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive emails about new features and promotions
                    </p>
                  </div>
                  <Switch
                    id="marketing-emails"
                    checked={marketingEmails}
                    onCheckedChange={setMarketingEmails}
                  />
                </div>

                <Button onClick={handleSavePreferences} disabled={saving}>
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Save Preferences
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button variant="outline" className="justify-start" onClick={() => router.push('/help')}>
                <FileText className="w-4 h-4 mr-2" />
                User Guides
              </Button>
              <Button variant="outline" className="justify-start" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Log Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}