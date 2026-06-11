import { Card } from '@heroui/react'

function ProfileCard() {
  return (
    <div>
      <Card className='h-full w-screen text-foreground p-4 m-4'>
        <h1 className='text-2xl font-bold mb-4'>Welcome to your Profile!</h1>
        <p className='text-gray-600 mb-6'>Here you can view and edit your profile information.</p>
      </Card>
    </div>
  )
}

export default ProfileCard
