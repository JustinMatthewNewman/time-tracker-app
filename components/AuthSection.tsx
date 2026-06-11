import {
  Button,
  Dropdown,
  Skeleton,
} from "@heroui/react";

// ─────────────────────────────────────────────
// Auth Section
// ─────────────────────────────────────────────

function AuthSection({
  user,
  loading,
  onLogin,
  onAction,
}: {
  user: any;
  loading: boolean;
  onLogin: () => Promise<any>;
  onAction: (key: string) => void;
}) {
  if (loading) {
    return <Skeleton className="w-8 h-8 rounded-full" />;
  }

  if (!user) {
    return (
      <div className="flex gap-2">
        <Button size="sm" onPress={onLogin}>
          Sign in
        </Button>
        <Button size="sm" onPress={onLogin}>
          Get started
        </Button>
      </div>
    );
  }

  return (
    <Dropdown>
      <Dropdown.Trigger>
        <div className="flex items-center gap-2 text-sm text-foreground/80 hover:text-foreground">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt="avatar"
              className="h-7 w-7 rounded-full"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="h-7 w-7 rounded-full bg-default-200 flex items-center justify-center text-xs">
              {(user.displayName ?? user.email ?? "U")[0].toUpperCase()}
            </div>
          )}

          <span className="hidden sm:block">
            {user.displayName ?? user.email}
          </span>
        </div>
      </Dropdown.Trigger>

      <Dropdown.Popover placement="bottom end">
        <Dropdown.Menu onAction={(key) => onAction(String(key))}>
          {/* <Dropdown.Item id="profile">Profile</Dropdown.Item>
          <Dropdown.Item id="dashboard">Dashboard</Dropdown.Item>
          <Dropdown.Item id="settings">Settings</Dropdown.Item> */}
          <Dropdown.Item id="logout">Sign out</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown.Popover>
    </Dropdown>
  );
}

export default AuthSection;