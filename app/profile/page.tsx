'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { useAuthStore } from '@/lib/store/auth';

export default function ProfilePage() {
  const { user, credits, isLoading, initialize } = useAuthStore();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    async function loadProfile() {
      if (!user) {
        router.push('/auth/login');
        return;
      }

      // Get profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();

      if (profile) {
        setFirstName(profile.first_name || '');
        setLastName(profile.last_name || '');
      }

      setLoading(false);
    }

    initialize();
    loadProfile();
  }, [user]);

  async function updateProfile() {
    if (!user) return;

    await supabase
      .from('profiles')
      .update({
        first_name: firstName,
        last_name: lastName,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    router.refresh();
  }

  if (loading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-4 space-y-8">
      <h1 className="text-3xl font-bold">Profile Settings</h1>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            First Name
          </label>
          <Input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Enter your first name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Last Name
          </label>
          <Input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="Enter your last name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Available Credits
          </label>
          <div className="text-2xl font-bold">{credits}</div>
        </div>

        <button
          onClick={updateProfile}
          className="w-full bg-gradient-to-r from-[#63BCA5] to-[#52AB94] text-white rounded-lg px-4 py-2 hover:opacity-90 transition-opacity"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
