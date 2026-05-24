"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users, Bell, ShieldAlert, Settings, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";

const navItems = [
  { title: "Dashboard", icon: Home, path: "/admin/dashboard" },
  { title: "Users", icon: Users, path: "/admin/users" },
  { title: "Alerts", icon: Bell, path: "/admin/alerts" },
  { title: "Security", icon: ShieldAlert, path: "/admin/security" },
  { title: "Settings", icon: Settings, path: "/admin/settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  useAuth();

  const handleLogout = async () => {
    await signOut(auth);
    await fetch("/api/v1/auth/session", { method: "DELETE" });
    router.push("/");
  };

  return (
    <div className="flex">
      <aside className="h-screen w-64 bg-gray-900 text-white p-4 fixed">
        <h1 className="text-xl font-bold mb-6">Admin Panel</h1>
        <nav className="space-y-4">
          {navItems.map(({ title, icon: Icon, path }) => (
            <Link
              key={title}
              href={path}
              className={`flex items-center p-3 rounded-md ${
                pathname === path ? "bg-blue-500" : "hover:bg-gray-800"
              }`}
            >
              <Icon className="w-5 h-5 mr-2" />
              {title}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1 ml-64">
        <div className="w-full bg-gray-900 text-white flex justify-between p-4">
          <h2 className="text-lg font-bold">Admin Dashboard</h2>
          <div className="flex gap-4">
            <Link href="/admin/alerts">
              <Bell size={24} className="text-gray-400 hover:text-white" />
            </Link>
            <button onClick={handleLogout} className="text-red-400 hover:text-white">
              <LogOut size={24} />
            </button>
          </div>
        </div>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
