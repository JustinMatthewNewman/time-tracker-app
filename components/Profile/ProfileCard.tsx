"use client";

import { Card } from '@heroui/react'
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import ProfileAuthSection from './ProfileAuthSection';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { useEffect, useState } from 'react';

function ProfileCard() {
  const { user, loading } = useAuth();
  const { entries } = useTimeEntries();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalEntries: 0,
    totalHours: 0,
    thisWeek: 0,
  });

  useEffect(() => {
    if (entries.length > 0) {
      const totalHours = entries.reduce((sum, entry) => sum + entry.duration, 0) / 60;
      setStats({
        totalEntries: entries.length,
        totalHours: parseFloat(totalHours.toFixed(2)),
        thisWeek: calculateThisWeekHours(entries),
      });
    }
  }, [entries]);

  const calculateThisWeekHours = (entries: any[]) => {
    const now = new Date();
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
    const weekHours = entries
      .filter((e) => new Date(e.startTime) >= weekStart)
      .reduce((sum, entry) => sum + entry.duration, 0) / 60;
    return parseFloat(weekHours.toFixed(2));
  };

  return (
    <div className="w-full">
      <Card className='text-foreground p-8'>
        <div className='mb-6'>
          <h1 className='text-3xl font-bold mb-2'>👤 Your Profile</h1>
          <p className='text-gray-500'>Manage your account information and time tracking statistics</p>
        </div>

        <div className='border-t border-default-200 my-6'></div>

        {/* Stats Section */}
        {!loading && user && (
          <>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
              <Card className='p-4 bg-gradient-to-br from-blue-50 to-blue-100'>
                <div className='text-center'>
                  <p className='text-sm text-foreground/60 uppercase tracking-wider'>Total Entries</p>
                  <p className='text-3xl font-bold text-blue-600 mt-2'>{stats.totalEntries}</p>
                </div>
              </Card>
              <Card className='p-4 bg-gradient-to-br from-green-50 to-green-100'>
                <div className='text-center'>
                  <p className='text-sm text-foreground/60 uppercase tracking-wider'>Total Hours</p>
                  <p className='text-3xl font-bold text-green-600 mt-2'>{stats.totalHours}h</p>
                </div>
              </Card>
              <Card className='p-4 bg-gradient-to-br from-purple-50 to-purple-100'>
                <div className='text-center'>
                  <p className='text-sm text-foreground/60 uppercase tracking-wider'>This Week</p>
                  <p className='text-3xl font-bold text-purple-600 mt-2'>{stats.thisWeek}h</p>
                </div>
              </Card>
            </div>
            <div className='border-t border-default-200 my-6'></div>
          </>
        )}

        {/* User Info Section */}
        <div className='mb-8'>
          <h2 className='text-lg font-semibold mb-4'>Account Information</h2>
          <ProfileAuthSection user={user} loading={loading} />
        </div>
      </Card>
    </div>
  )
}

export default ProfileCard
