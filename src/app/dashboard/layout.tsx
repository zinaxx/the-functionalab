import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LayoutDashboard, Calendar, CreditCard } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/dashboard/bookings", label: "My Bookings", icon: Calendar },
  { href: "/dashboard/membership", label: "Membership", icon: CreditCard },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="min-h-screen bg-cream-50 pt-16">
      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-56 shrink-0">
            <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
              {navItems.map((item) => (
                <DashboardNavLink key={item.href} {...item} />
              ))}
            </nav>
          </aside>

          {/* Content */}
          <div className="flex-1 min-w-0">{children}</div>
        </div>
      </div>
    </div>
  );
}

function DashboardNavLink({
  href,
  label,
  icon: Icon,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  exact?: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium font-body text-stone-600 hover:text-stone-900 hover:bg-stone-100 transition-colors whitespace-nowrap"
    >
      <Icon className="h-4 w-4 shrink-0" />
      {label}
    </Link>
  );
}
