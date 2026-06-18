'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Camera, User, KeyRound, Mail, Info } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuthStore } from '@/store/auth.store';
import { useChangePassword, useUpdateProfile, useUploadAvatar } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { extractApiError, getInitials } from '@/lib/utils';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  bio: z.string().max(500, 'Bio cannot exceed 500 characters').optional().or(z.literal('')),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
      'Password must contain uppercase, lowercase, number, and special character'
    ),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export function UserProfileSettings() {
  const { user, setUser, accessToken } = useAuthStore();
  const { toast } = useToast();
  const [avatarLoading, setAvatarLoading] = useState(false);

  const { mutate: updateProfile, isPending: profileUpdating } = useUpdateProfile();
  const { mutate: changePassword, isPending: passwordChanging } = useChangePassword();
  const { mutate: uploadAvatar } = useUploadAvatar();

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      bio: user?.bio || '',
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPasswordForm,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = (data: ProfileFormData) => {
    updateProfile(data, {
      onSuccess: (updatedUser) => {
        if (user && accessToken) {
          // Update local state in Zustand
          setUser({ ...user, ...updatedUser }, accessToken);
        }
        toast({ title: 'Profile updated successfully' });
      },
      onError: (err) => {
        toast({
          variant: 'destructive',
          title: 'Update failed',
          description: extractApiError(err),
        });
      },
    });
  };

  const onPasswordSubmit = (data: PasswordFormData) => {
    changePassword(
      {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      },
      {
        onSuccess: () => {
          toast({ title: 'Password updated successfully' });
          resetPasswordForm();
        },
        onError: (err) => {
          toast({
            variant: 'destructive',
            title: 'Change password failed',
            description: extractApiError(err),
          });
        },
      }
    );
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarLoading(true);
    uploadAvatar(file, {
      onSuccess: (updatedUser) => {
        setAvatarLoading(false);
        if (user && accessToken) {
          setUser({ ...user, ...updatedUser }, accessToken);
        }
        toast({ title: 'Avatar updated successfully' });
      },
      onError: (err) => {
        setAvatarLoading(false);
        toast({
          variant: 'destructive',
          title: 'Avatar upload failed',
          description: extractApiError(err),
        });
      },
    });
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Account Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your profile details and security settings</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: Avatar & Details */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-primary flex items-center justify-center text-white text-3xl font-bold overflow-hidden border-4 border-background shadow-lg">
                  {avatarLoading ? (
                    <Loader2 className="w-8 h-8 animate-spin" />
                  ) : user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    getInitials(user?.name || 'U')
                  )}
                </div>
                <label className="absolute bottom-0 right-0 p-1.5 bg-primary text-white rounded-full cursor-pointer shadow-md hover:scale-105 transition-transform">
                  <Camera className="w-4 h-4" />
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={avatarLoading}
                  />
                </label>
              </div>

              <h2 className="mt-4 font-semibold text-lg">{user?.name}</h2>
              <p className="text-sm text-muted-foreground capitalize">{user?.role?.replace('_', ' ')}</p>
              
              <div className="w-full border-t my-4" />

              <div className="w-full space-y-3 text-left">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{user?.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Info className="w-4 h-4 flex-shrink-0" />
                  <span className="capitalize">Status: Active</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Edit Profile & Change Password */}
        <div className="md:col-span-2 space-y-6">
          {/* Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Profile Information
              </CardTitle>
              <CardDescription>Update your public account information</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit(onProfileSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="profile-name">Full Name *</Label>
                  <Input
                    id="profile-name"
                    placeholder="Your name"
                    {...registerProfile('name')}
                  />
                  {profileErrors.name && (
                    <p className="text-xs text-destructive">{profileErrors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="profile-bio">Bio</Label>
                  <Textarea
                    id="profile-bio"
                    placeholder="Tell us about yourself..."
                    rows={4}
                    {...registerProfile('bio')}
                  />
                  {profileErrors.bio && (
                    <p className="text-xs text-destructive">{profileErrors.bio.message}</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={profileUpdating}>
                    {profileUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Change Password Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-primary" />
                Security Settings
              </CardTitle>
              <CardDescription>Change your password to secure your account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit(onPasswordSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password *</Label>
                  <Input
                    id="current-password"
                    type="password"
                    placeholder="••••••••"
                    {...registerPassword('currentPassword')}
                  />
                  {passwordErrors.currentPassword && (
                    <p className="text-xs text-destructive">{passwordErrors.currentPassword.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password *</Label>
                  <Input
                    id="new-password"
                    type="password"
                    placeholder="••••••••"
                    {...registerPassword('newPassword')}
                  />
                  {passwordErrors.newPassword && (
                    <p className="text-xs text-destructive">{passwordErrors.newPassword.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password *</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    {...registerPassword('confirmPassword')}
                  />
                  {passwordErrors.confirmPassword && (
                    <p className="text-xs text-destructive">{passwordErrors.confirmPassword.message}</p>
                  )}
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={passwordChanging}>
                    {passwordChanging && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    Update Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
