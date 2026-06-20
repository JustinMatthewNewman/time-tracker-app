"use client";

import { Card, Button, Divider } from '@heroui/react'
import { useAuth } from "@/hooks/useAuth";
import { logout } from "@/lib/auth";
import { useRouter } from "next/navigation";
import ProfileAuthSection from './ProfileAuthSection';

function ProfileCard() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const handleNavigation = (route: string) => {
    router.push(route);
  };

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8 px-4">
      <Card className='text-foreground p-8'>
        <div className='mb-6'>
          <h1 className='text-3xl font-bold mb-2'>Your Profile</h1>
          <p className='text-gray-500'>Manage your account information and settings</p>
        </div>

        <Divider className='mb-6' />

        {/* User Info Section */}
        <div className='mb-8'>
          <h2 className='text-lg font-semibold mb-4'>Account Information</h2>
          <ProfileAuthSection user={user} loading={loading} />
        </div>

        <Divider className='mb-6' />

        {/* Action Buttons */}
        <div className='flex flex-wrap gap-3 items-center justify-between'>
          <div className='flex gap-3'>
            <Button
              color="primary"
              onPress={() => handleNavigation("/dashboard")}
              isDisabled={loading}
            >
              Back to Dashboard
            </Button>
            <Button
              color="secondary"
              onPress={() => handleNavigation("/settings")}
              isDisabled={loading}
            >
              Settings
            </Button>
          </div>
          <Button
            color="danger"
            variant="light"
            onPress={handleLogout}
            isDisabled={loading}
          >
            Logout
          </Button>
        </div>
      </Card>
    </div>
  )
}

export default ProfileCard
