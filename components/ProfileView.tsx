// components/ProfileView.tsx
"use client";

import { useState, useEffect, useMemo, ChangeEvent } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useSession } from "next-auth/react";
import { Edit3, Save, X, User, Calendar, MessageSquare, FileText, Globe, Mail, Lock, Upload, Camera } from "lucide-react";
import PasswordInput from "@/components/PasswordInput";

interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
}

interface Stats {
  threads: number;
  replies: number;
}

export default function ProfileView({
  profile,
  stats,
  isOwnProfile,
  user,
}: {
  profile: Profile;
  stats: Stats;
  isOwnProfile: boolean;
  user: any;
}) {
  const { data: session } = useSession();
  const supabase = useMemo(() => createClientComponentClient(), []);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [username, setUsername] = useState(profile.username || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);

  // Reset form when profile changes
  useEffect(() => {
    setUsername(profile.username || "");
    setBio(profile.bio || "");
    setAvatarUrl(profile.avatar_url);
  }, [profile]);

  const canEdit = isOwnProfile && session?.user?.id;

  // Enhanced avatar upload handler with Supabase storage
  const onChangeAvatar = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0] || !canEdit) return;
    setUploading(true);
    setError(null);
    
    const file = e.target.files[0];
    
    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      setUploading(false);
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setError('Image must be smaller than 5MB.');
      setUploading(false);
      return;
    }

    try {
      const ext = file.name.split(".").pop();
      const fileName = `${session?.user?.id}-${Date.now()}.${ext}`;
      const filePath = `avatars/${fileName}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: publicUrl })
        .eq("user_id", session?.user?.id);

      if (updateError) {
        throw updateError;
      }

      setAvatarUrl(publicUrl);
      setSuccess("Avatar updated successfully!");
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err: any) {
      setError(err.message || 'Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  // Save profile changes
  const onSave = async () => {
    if (!canEdit) return;
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const { error: updErr } = await supabase
        .from("profiles")
        .update({ 
          username: username.trim() || null, 
          bio: bio.trim() || null 
        })
        .eq("user_id", session?.user?.id);

      if (updErr) {
        throw updErr;
      }

      setSuccess("Profile updated successfully!");
      setIsEditing(false);
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err: any) {
      setError(
        err.code === "23505"
          ? "Username already taken."
          : err.message || "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  // Change password
  const onChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setError("New passwords don't match.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setChangingPassword(true);
    setError(null);
    setSuccess(null);

    try {
      // Call API to change password
      const response = await fetch('/api/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      setSuccess("Password changed successfully!");
      setIsChangingPassword(false);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSuccess(null), 3000);
      
    } catch (err: any) {
      setError(err.message || "Failed to change password");
    } finally {
      setChangingPassword(false);
    }
  };

  const onCancel = () => {
    setUsername(profile.username || "");
    setBio(profile.bio || "");
    setError(null);
    setIsEditing(false);
  };

  const onCancelPassword = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setError(null);
    setIsChangingPassword(false);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="bg-spacex border border-white/10 rounded-lg p-6 mb-6">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-6">
            {/* Avatar */}
            <div className="relative group">
              <img
                src={avatarUrl || user?.image || "/default-avatar.png"}
                alt="Avatar"
                className="w-24 h-24 rounded-full object-cover border-2 border-primary"
              />
              {canEdit && (
                <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera size={20} className="text-white" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={onChangeAvatar}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              )}
              {uploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                  <div className="text-white text-sm">Uploading...</div>
                </div>
              )}
            </div>
            
            {/* User Info */}
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {profile.username || "Anonymous User"}
              </h1>
              <div className="flex items-center space-x-4 text-spacex-gray">
                <div className="flex items-center space-x-1">
                  <User size={16} />
                  <span>Member</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar size={16} />
                  <span>Joined {new Date().toLocaleDateString()}</span>
                </div>
                {user?.email && (
                  <div className="flex items-center space-x-1">
                    <Mail size={16} />
                    <span>{user.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          {canEdit && (
            isEditing ? (
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={onSave}
                  disabled={saving}
                  className="flex items-center space-x-2 bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/80 transition disabled:opacity-50"
                >
                  <Save size={16} />
                  <span>{saving ? "Saving..." : "Save"}</span>
                </button>
                <button
                  onClick={onCancel}
                  className="flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-500 transition"
                >
                  <X size={16} />
                  <span>Cancel</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2">
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 text-sm font-medium"
                >
                  Edit Profile
                </button>
                <button
                  onClick={() => setIsChangingPassword(true)}
                  className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-800 text-sm font-medium"
                >
                  Change Password
                </button>
              </div>
            )
          )}
        </div>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-500/20 border border-green-500 text-green-400 p-3 rounded-lg mb-6">
          {success}
        </div>
      )}
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded-lg mb-6">
          {error}
        </div>
      )}

      {/* Password Change Modal */}
      {isChangingPassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-spacex border border-white/10 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-white mb-4">Change Password</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-spacex-gray mb-2">
                  Current Password
                </label>
                <PasswordInput
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full p-3 rounded-lg bg-background border border-white/10 text-white focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-spacex-gray mb-2">
                  New Password
                </label>
                <PasswordInput
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-3 rounded-lg bg-background border border-white/10 text-white focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-spacex-gray mb-2">
                  Confirm New Password
                </label>
                <PasswordInput
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-3 rounded-lg bg-background border border-white/10 text-white focus:border-primary focus:outline-none"
                />
              </div>
              <div className="flex space-x-2 pt-4">
                <button
                  onClick={onChangePassword}
                  disabled={changingPassword}
                  className="flex-1 bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/80 transition disabled:opacity-50"
                >
                  {changingPassword ? "Changing..." : "Change Password"}
                </button>
                <button
                  onClick={onCancelPassword}
                  className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-500 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* About Me */}
          <div className="bg-spacex border border-white/10 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center space-x-2">
              <User size={20} />
              <span>About Me</span>
            </h2>
            
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-spacex-gray mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Choose a unique username"
                    className="w-full p-3 rounded-lg bg-background border border-white/10 text-white focus:border-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-spacex-gray mb-2">
                    Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    rows={4}
                    className="w-full p-3 rounded-lg bg-background border border-white/10 text-white focus:border-primary focus:outline-none resize-none"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <span className="text-sm text-spacex-gray">Username</span>
                  <p className="text-white font-medium">{profile.username || "Not set"}</p>
                </div>
                <div>
                  <span className="text-sm text-spacex-gray">Bio</span>
                  <p className="text-white whitespace-pre-wrap">
                    {profile.bio || "No bio yet."}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-spacex border border-white/10 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
            <div className="text-spacex-gray">
              <p>No recent activity to show.</p>
            </div>
          </div>
        </div>

        {/* Stats Sidebar */}
        <div className="space-y-6">
          {/* Forum Stats */}
          <div className="bg-spacex border border-white/10 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Forum Stats</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                <div className="flex items-center space-x-3">
                  <FileText size={20} className="text-primary" />
                  <span className="text-white">Threads</span>
                </div>
                <span className="text-2xl font-bold text-primary">{stats.threads}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                <div className="flex items-center space-x-3">
                  <MessageSquare size={20} className="text-primary" />
                  <span className="text-white">Replies</span>
                </div>
                <span className="text-2xl font-bold text-primary">{stats.replies}</span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          {canEdit && (
            <div className="bg-spacex border border-white/10 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary/80 transition">
                  Create New Thread
                </button>
                <button className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-500 transition">
                  View My Posts
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
