import React, { createContext, useContext, useState, useMemo } from 'react'

type TimeRangeContextType = {
  startHour: number
  endHour: number
  timeSlots: number[]
  setStartHour: (h: number) => void
  setEndHour: (h: number) => void
}

const TimeRangeContext = createContext<TimeRangeContextType | null>(null)

export function TimeRangeProvider({ children }: { children: React.ReactNode }) {
  const [startHour, setStartHour] = useState(8)
  const [endHour, setEndHour] = useState(16)

  const timeSlots = useMemo(() => {
    if (endHour <= startHour) return []
    return Array.from({ length: endHour - startHour }, (_, i) => startHour + i)
  }, [startHour, endHour])

  return (
    <TimeRangeContext.Provider value={{ startHour, endHour, timeSlots, setStartHour, setEndHour }}>
      {children}
    </TimeRangeContext.Provider>
  )
}

export function useTimeRange() {
  const ctx = useContext(TimeRangeContext)
  if (!ctx) throw new Error('useTimeRange must be used within a TimeRangeProvider')
  return ctx
}