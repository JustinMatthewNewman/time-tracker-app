import { Card } from '@heroui/react'

function SettingsCard() {
  return (
    <div>
      <Card className='h-full w-screen text-foreground p-4 m-4'>
        <h1 className='text-2xl font-bold mb-4'>Welcome to your Settings!</h1>
        <p className='text-gray-600 mb-6'>Here you can view and edit your Settings information.</p>
      </Card>
    </div>
  )
}

export default SettingsCard
