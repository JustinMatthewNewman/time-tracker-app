"use client";

import React from 'react'
import { Card, Select, Label, ListBox } from '@heroui/react'
import { Clock, CircleExclamation } from '@gravity-ui/icons'
import { useTimeRange } from '../context/TimeRangeContext'

const HOURS = Array.from({ length: 24 }, (_, i) => i)

export function formatHour(h: number): string {
  const suffix = h < 12 ? 'AM' : 'PM'
  const display = h === 0 ? 12 : h > 12 ? h - 12 : h
  return `${display}:00 ${suffix}`
}

function TimeRangeSettings() {
  const { startHour, endHour, timeSlots, setStartHour, setEndHour } = useTimeRange()

  return (
    <Card className='p-6'>
      <h2 className='flex items-center gap-2 text-lg font-semibold mb-1'>
        <Clock className='size-4' /> Working Hours
      </h2>
      <p className='text-sm text-foreground/60 mb-4'>Set your typical working hours for time tracking</p>
      <div className='flex items-center gap-4 flex-wrap'>

        <div className='flex flex-col gap-1'>
          <Label className='text-xs font-semibold'>Start Hour</Label>
          <Select
            selectedKey={String(startHour)}
            onSelectionChange={(key) => setStartHour(Number(key))}
            className='w-36'
            aria-label='Start hour'
          >
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {HOURS.map((h) => (
                  <ListBox.Item key={String(h)} id={String(h)}>
                    {formatHour(h)}
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
        </div>

        <span className='text-foreground/40 text-2xl mt-6'>→</span>

        <div className='flex flex-col gap-1'>
          <Label className='text-xs font-semibold'>End Hour</Label>
          <Select
            selectedKey={String(endHour)}
            onSelectionChange={(key) => setEndHour(Number(key))}
            className='w-36'
            aria-label='End hour'
          >
            <Select.Trigger>
              <Select.Value />
              <Select.Indicator />
            </Select.Trigger>
            <Select.Popover>
              <ListBox>
                {HOURS.map((h) => (
                  <ListBox.Item key={String(h)} id={String(h)}>
                    {formatHour(h)}
                  </ListBox.Item>
                ))}
              </ListBox>
            </Select.Popover>
          </Select>
        </div>
      </div>

      <div className='mt-4 p-3 bg-default-100 rounded-lg'>
        <p className='text-sm text-foreground'>
          <strong>Working Hours:</strong> {formatHour(startHour)} - {formatHour(endHour)}
        </p>
        <p className={`text-xs mt-1 flex items-center gap-1 ${timeSlots.length > 0 ? 'text-foreground/60' : 'text-danger'}`}>
          {timeSlots.length === 0 && <CircleExclamation className='size-3.5 shrink-0' />}
          {timeSlots.length > 0
            ? `${timeSlots.length} hour${timeSlots.length !== 1 ? 's' : ''} per day`
            : 'End time must be after start time'}
        </p>
      </div>
    </Card>
  )
}

export default TimeRangeSettings