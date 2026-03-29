import { ReactNode, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore, UserRole } from "@/stores/authStore";
import { Icon } from "@iconify/react";
import ThemeToggle from "@/components/ThemeToggle";

interface NavItem {
  label: string;
  path: string;
  icon: string;
  section: string;
}

const getSidebarItems = (role: UserRole): NavItem[] => {
  switch (role) {
    case "Admin":
      return [
        { label: "Analytics", path: "/admin/analytics", icon: "solar:chart-2-bold-duotone", section: "Overview" },
        { label: "Users", path: "/admin/users", icon: "solar:users-group-rounded-bold-duotone", section: "Manage" },
        { label: "Providers", path: "/admin/providers", icon: "solar:case-round-bold-duotone", section: "Manage" },
        { label: "Services", path: "/admin/services", icon: "solar:layers-bold-duotone", section: "Manage" },
        { label: "Coupons", path: "/admin/coupons", icon: "solar:ticket-sale-bold-duotone", section: "Manage" },
        { label: "Bookings", path: "/admin/bookings", icon: "solar:calendar-bold-duotone", section: "Finance" },
        { label: "Transactions", path: "/admin/transactions", icon: "solar:card-recive-bold-duotone", section: "Finance" },
        { label: "Withdrawals", path: "/admin/withdrawals", icon: "solar:hand-money-bold-duotone", section: "Finance" },
        { label: "Settings", path: "/admin/settings", icon: "solar:settings-bold-duotone", section: "System" },
        { label: "Profile", path: "/profile", icon: "solar:user-rounded-bold-duotone", section: "System" },
      ];
    default:
      return [
        { label: "Dashboard", path: "/dashboard", icon: "solar:home-2-bold-duotone", section: "Overview" },
        { label: "Services", path: "/services", icon: "solar:compass-bold-duotone", section: "Explore" },
        { label: "Bookings", path: "/bookings", icon: "solar:calendar-bold-duotone", section: "Explore" },
        { label: "Wallet", path: "/wallet", icon: "solar:wallet-2-bold-duotone", section: "Finance" },
        { label: "Profile", path: "/profile", icon: "solar:user-rounded-bold-duotone", section: "Account" },
        { label: "Settings", path: "/settings", icon: "solar:settings-bold-duotone", section: "Account" },
      ];
  }
};

const AppLayout = ({ children }: { children: ReactNode }) => {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = getSidebarItems(user?.role || "User");

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const sidebarWidth = collapsed ? "w-[70px]" : "w-[240px]";

  const sections: Record<string, NavItem[]> = {};
  navItems.forEach((item) => {
    if (!sections[item.section]) sections[item.section] = [];
    sections[item.section].push(item);
  });

  return (
    <div className="flex h-screen overflow-hidden bg-background">

      {/* MOBILE OVERLAY */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 ${sidebarWidth}
        flex flex-col transition-all duration-300
        lg:static lg:translate-x-0
        bg-background/80 backdrop-blur-xl border-r border-border
        ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Gradient Glow */}
        <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none" />

        {/* BRAND */}
        <div className="flex h-14 items-center gap-2 px-4 border-b border-border">
          <div className="h-8 w-8 flex items-center justify-center rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 text-white shadow">
            <Icon icon="solar:home-smile-bold" className="h-4 w-4" />
          </div>

          {!collapsed && (
            <span className="text-sm font-bold tracking-tight">
              ServiceBridge
            </span>
          )}

          <button onClick={() => setMobileOpen(false)} className="ml-auto lg:hidden">
            <Icon icon="solar:close-circle-bold-duotone" className="h-5 w-5" />
          </button>
        </div>

        {/* NAV */}
        <nav className="flex-1 overflow-y-auto py-2 px-2">
          {Object.entries(sections).map(([section, items]) => (
            <div key={section}>
              {!collapsed && (
                <p className="px-3 pt-3 pb-1 text-[10px] uppercase tracking-wider text-muted-foreground">
                  {section}
                </p>
              )}

              {items.map((item) => {
                const active = location.pathname === item.path;

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition-all
                    ${
                      active
                        ? "bg-primary/10 text-primary border-l-2 border-primary shadow-sm"
                        : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                    }
                    ${collapsed ? "justify-center px-2" : ""}`}
                  >
                    <Icon icon={item.icon} className="h-4 w-4" />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* FOOTER */}
        <div className="border-t border-border p-3">
          {!collapsed && (
            <div className="flex items-center gap-2 mb-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                {user?.name?.charAt(0) || "U"}
              </div>
              <div>
                <p className="text-xs font-semibold">{user?.name}</p>
                <p className="text-[10px] text-muted-foreground">{user?.role}</p>
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-500/10"
          >
            <Icon icon="solar:logout-2-bold-duotone" className="h-4 w-4" />
            {!collapsed && "Logout"}
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* TOPBAR */}
        <header className="flex h-14 items-center gap-3 border-b border-border bg-background/60 backdrop-blur-xl px-4">

          {/* MOBILE MENU */}
          <button onClick={() => setMobileOpen(true)} className="lg:hidden">
            <Icon icon="solar:hamburger-menu-bold-duotone" className="h-5 w-5" />
          </button>

          {/* COLLAPSE */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex h-8 w-8 items-center justify-center rounded-md hover:bg-muted"
          >
            <Icon icon={collapsed ? "solar:alt-arrow-right-bold" : "solar:alt-arrow-left-bold"} />
          </button>

          {/* SEARCH */}
          <div className="hidden md:flex flex-1 max-w-sm items-center gap-2 rounded-lg bg-muted/50 px-3 py-1.5 border border-border">
            <Icon icon="solar:magnifer-bold-duotone" className="h-4 w-4" />
            <span className="text-xs text-muted-foreground">Search...</span>
          </div>

          {/* RIGHT */}
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />

            <button className="relative h-8 w-8 flex items-center justify-center rounded-md hover:bg-muted">
              <Icon icon="solar:bell-bold-duotone" className="h-4 w-4" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-primary rounded-full" />
            </button>

            <div className="h-6 w-px bg-border" />

            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                {user?.name?.charAt(0) || "U"}
              </div>
              <div className="hidden lg:block">
                <p className="text-xs font-semibold">{user?.name}</p>
                <p className="text-[10px] text-muted-foreground">{user?.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-7xl p-4 lg:p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;