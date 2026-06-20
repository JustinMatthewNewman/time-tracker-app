"use client";

import { Card, Switch } from '@heroui/react'
import TimeRangeSettings from '../TimeRangeSettings'
import { useState } from 'react'

function SettingsCard() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [autoBreakReminder, setAutoBreakReminder] = useState(true)

  return (
    <div>
      <Card className='h-full w-screen text-foreground p-6 m-4'>
        <h1 className='text-3xl font-bold mb-2'>⚙️ Settings</h1>
        <p className='text-gray-600 mb-8'>Customize your time tracking experience</p>
        
        <div className='space-y-8'>
          {/* Time Range Settings */}
          <div>
            <h2 className='text-xl font-semibold mb-4'>⏱️ Working Hours</h2>
            <TimeRangeSettings />
          </div>

          <div className='border-t border-default-200 my-4'></div>

          {/* Notification Settings */}
          <div>
            <h2 className='text-xl font-semibold mb-4'>🔔 Notifications</h2>
            <div className='space-y-4'>
              <div className='flex items-center justify-between p-3 bg-default-50 rounded-lg'>
                <div>
                  <p className='font-semibold'>Enable Notifications</p>
                  <p className='text-sm text-gray-600'>Get reminders for your time entries</p>
                </div>
                <Switch
                  isSelected={notificationsEnabled}
                  onChange={setNotificationsEnabled}
                />
              </div>

              {notificationsEnabled && (
                <div className='flex items-center justify-between p-3 bg-default-50 rounded-lg ml-4'>
                  <div>
                    <p className='font-semibold'>Break Reminders</p>
                    <p className='text-sm text-gray-600'>Remind me to take breaks every 2 hours</p>
                  </div>
                  <Switch
                    isSelected={autoBreakReminder}
                    onChange={setAutoBreakReminder}
                  />
                </div>
              )}
            </div>
          </div>

          <div className='border-t border-default-200 my-4'></div>

          {/* About */}
          <div>
            <h2 className='text-xl font-semibold mb-4'>ℹ️ About</h2>
            <Card className='p-4 bg-default-50'>
              <div className='space-y-2 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-foreground/60'>App Version:</span>
                  <span className='font-mono'>1.0.0</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-foreground/60'>Last Updated:</span>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default SettingsCard