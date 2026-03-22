import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LayoutDashboard, BookOpen, Users, BarChart3, Settings } from "lucide-react";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/classes", label: "Classes", icon: BookOpen },
  { href: "/admin/members", label: "Members", icon: Users },
  { href: "/admin/revenue", label: "Revenue", icon: BarChart3 },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  if (user.email !== process.env.ADMIN_EMAIL) redirect("/");

  return (
    <div className="min-h-screen bg-[#0A0A0A] pt-16">
      <div className="bg-[#141414] border-b border-[#2A2A2A]">
        <div className="mx-auto max-w-7xl px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Settings className="h-4 w-4 text-stone-500 mr-2" />
            <span className="font-body text-sm font-medium text-stone-400">Admin</span>
          </div>
          <Link href="/" className="font-body text-xs text-stone-500 hover:text-stone-300">
            ← Back to site
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-48 shrink-0">
            <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium font-body text-stone-400 hover:text-white hover:bg-white/5 transition-colors whitespace-nowrap"
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  {item.label}
                </Link>
              ))}
            </nav>
          </aside>
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}
