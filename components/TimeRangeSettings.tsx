import React from 'react'
import { Card, Select, Label, ListBox } from '@heroui/react'
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
    <Card className='p-4 mb-4 rounded-lg'>
      <h2 className='text-xl font-semibold mb-3'>Configure Time Range</h2>
      <div className='flex items-center gap-4 flex-wrap'>

        <Select
          selectedKey={String(startHour)}
          onSelectionChange={(key) => setStartHour(Number(key))}
          className='w-36'
          aria-label='Start hour'
        >
          <Label>Start</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {HOURS.map((h) => (
                <ListBox.Item key={String(h)} id={String(h)}>
                  <Label>{formatHour(h)}</Label>
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>

        <span className='text-gray-400'>→</span>

        <Select
          selectedKey={String(endHour)}
          onSelectionChange={(key) => setEndHour(Number(key))}
          className='w-36'
          aria-label='End hour'
        >
          <Label>End</Label>
          <Select.Trigger>
            <Select.Value />
            <Select.Indicator />
          </Select.Trigger>
          <Select.Popover>
            <ListBox>
              {HOURS.map((h) => (
                <ListBox.Item key={String(h)} id={String(h)}>
                  <Label>{formatHour(h)}</Label>
                </ListBox.Item>
              ))}
            </ListBox>
          </Select.Popover>
        </Select>

        <span className='text-sm text-gray-500'>
          {timeSlots.length > 0
            ? `${timeSlots.length} hour${timeSlots.length !== 1 ? 's' : ''}`
            : 'End must be after start'}
        </span>
      </div>
    </Card>
  )
}

export default TimeRangeSettings