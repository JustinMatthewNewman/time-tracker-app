import { Card } from '@heroui/react'
import { useAuth } from "@/hooks/useAuth";
import { loginWithGoogle, logout } from "@/lib/auth";
import { useRouter } from "next/navigation";
import ProfileAuthSection from './ProfileAuthSection';

interface NavLink {
  label: string;
  href: string;
  authRequired?: boolean;
}

const NAV_LINKS: NavLink[] = [
  { label: "Dashboard", href: "/dashboard", authRequired: true },
  { label: "Profile", href: "/profile", authRequired: true },
  { label: "Settings", href: "/settings", authRequired: true },
];


function ProfileCard() {
  const { user, loading } = useAuth();
    const router = useRouter();
  
    const handleAction = async (key: string) => {
      if (key === "logout") return logout();
  
      const routes: Record<string, string> = {
        dashboard: "/dashboard",
        settings: "/settings",
        profile: "/profile",
      };
  
      const route = routes[key];
      if (route) router.push(route);
    };
  
    const filteredLinks = NAV_LINKS.filter((link: any) => {
      if (!link.authRequired) return true;
      return !!user;
    });
  return (
    <div>
      <Card className='h-full w-screen text-foreground p-4 m-4'>
        <h1 className='text-2xl font-bold mb-4'>Welcome to your Profile!</h1>
        <p className='text-gray-600 mb-6'>Here you can view and edit your profile information.</p>
        <ProfileAuthSection user={user} loading={loading} />
      </Card>
    </div>
  )
}

export default ProfileCard
