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
    case "ProviderManager":
      return [
        { label: "Dashboard", path: "/dashboard", icon: "solar:home-2-bold-duotone", section: "Overview" },
        { label: "Applications", path: "/pm/applications", icon: "solar:document-add-bold-duotone", section: "Providers" },
        { label: "Approved", path: "/pm/approved", icon: "solar:verified-check-bold-duotone", section: "Providers" },
        { label: "Rejected", path: "/pm/rejected", icon: "solar:close-square-bold-duotone", section: "Providers" },
        { label: "Reports", path: "/admin/reports", icon: "solar:danger-triangle-bold-duotone", section: "Providers" },
        { label: "Profile", path: "/profile", icon: "solar:user-rounded-bold-duotone", section: "Account" },
        { label: "Settings", path: "/settings", icon: "solar:settings-bold-duotone", section: "Account" },
      ];
    case "ServiceProvider":
      return [
        { label: "Dashboard", path: "/dashboard", icon: "solar:home-2-bold-duotone", section: "Overview" },
        { label: "My Services", path: "/provider/services", icon: "solar:layers-bold-duotone", section: "Business" },
        { label: "Bookings", path: "/provider/bookings", icon: "solar:clipboard-check-bold-duotone", section: "Business" },
        { label: "Chat", path: "/chat", icon: "solar:chat-round-dots-bold-duotone", section: "Business" },
        { label: "Earnings", path: "/provider/earnings", icon: "solar:chart-2-bold-duotone", section: "Finance" },
        { label: "Wallet", path: "/provider/withdraw", icon: "solar:wallet-2-bold-duotone", section: "Finance" },
        { label: "Documents", path: "/provider/upload-documents", icon: "solar:file-check-bold-duotone", section: "Account" },
        { label: "Reviews", path: "/reviews", icon: "solar:star-bold-duotone", section: "Account" },
        { label: "Profile", path: "/profile", icon: "solar:user-rounded-bold-duotone", section: "Account" },
        { label: "Settings", path: "/settings", icon: "solar:settings-bold-duotone", section: "Account" },
      ];
    case "VerificationManager":
      return [
        { label: "Dashboard", path: "/dashboard", icon: "solar:home-2-bold-duotone", section: "Overview" },
        { label: "Verification", path: "/verification", icon: "solar:shield-check-bold-duotone", section: "Documents" },
        { label: "Pending", path: "/verification/pending", icon: "solar:hourglass-bold-duotone", section: "Documents" },
        { label: "Approved", path: "/verification/approved", icon: "solar:verified-check-bold-duotone", section: "Documents" },
        { label: "Rejected", path: "/verification/rejected", icon: "solar:close-square-bold-duotone", section: "Documents" },
        { label: "Profile", path: "/profile", icon: "solar:user-rounded-bold-duotone", section: "Account" },
        { label: "Settings", path: "/settings", icon: "solar:settings-bold-duotone", section: "Account" },
      ];
    case "User":
    default:
      return [
        { label: "Dashboard", path: "/dashboard", icon: "solar:home-2-bold-duotone", section: "Overview" },
        { label: "Services", path: "/services", icon: "solar:compass-bold-duotone", section: "Explore" },
        { label: "My Bookings", path: "/bookings", icon: "solar:calendar-bold-duotone", section: "Explore" },
        { label: "Chat", path: "/chat", icon: "solar:chat-round-dots-bold-duotone", section: "Explore" },
        { label: "Wallet", path: "/wallet", icon: "solar:wallet-2-bold-duotone", section: "Finance" },
        { label: "Coupons", path: "/coupons", icon: "solar:ticket-sale-bold-duotone", section: "Finance" },
        { label: "Reviews", path: "/reviews", icon: "solar:star-bold-duotone", section: "Account" },
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

  const sidebarWidth = collapsed ? "w-[60px]" : "w-[220px]";

  const sections: Record<string, NavItem[]> = {};
  navItems.forEach((item) => {
    if (!sections[item.section]) sections[item.section] = [];
    sections[item.section].push(item);
  });

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-background/60 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 ${sidebarWidth} flex flex-col transition-all duration-200 lg:static lg:translate-x-0 bg-sidebar border-r border-sidebar-border ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex h-14 items-center gap-2.5 px-4 border-b border-sidebar-border">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary">
            <Icon icon="solar:home-smile-bold" className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="text-sm font-bold text-sidebar-foreground tracking-tight">
              ServiceBridge
            </span>
          )}
          <button onClick={() => setMobileOpen(false)} className="ml-auto lg:hidden text-sidebar-muted hover:text-sidebar-foreground">
            <Icon icon="solar:close-circle-bold-duotone" className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin py-2 px-2">
          {Object.entries(sections).map(([section, items]) => (
            <div key={section} className="mb-1">
              {!collapsed && (
                <p className="px-3 pt-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.15em] text-sidebar-muted/50">
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
                    title={collapsed ? item.label : undefined}
                    className={`group flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-medium transition-all duration-150 mb-0.5 ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-sidebar-muted hover:bg-secondary hover:text-sidebar-foreground"
                    } ${collapsed ? "justify-center px-2" : ""}`}
                  >
                    <Icon
                      icon={item.icon}
                      className={`h-[17px] w-[17px] flex-shrink-0 ${
                        active ? "text-primary" : "text-sidebar-muted group-hover:text-sidebar-foreground"
                      }`}
                    />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User Footer */}
        <div className="border-t border-sidebar-border p-2">
          {!collapsed && (
            <div className="flex items-center gap-2.5 rounded-md px-3 py-2 mb-1">
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary text-[10px] font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="truncate text-xs font-semibold text-sidebar-foreground">{user?.name}</p>
                <p className="truncate text-[10px] text-sidebar-muted">{user?.role}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            title="Sign out"
            className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs text-sidebar-muted hover:bg-destructive/10 hover:text-destructive transition-colors ${
              collapsed ? "justify-center px-2" : ""
            }`}
          >
            <Icon icon="solar:logout-2-bold-duotone" className="h-[17px] w-[17px] flex-shrink-0" />
            {!collapsed && <span>Sign out</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex h-14 items-center gap-3 border-b border-border bg-card/50 px-4 lg:px-5">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden text-muted-foreground hover:text-foreground">
            <Icon icon="solar:hamburger-menu-bold-duotone" className="h-5 w-5" />
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <Icon icon={collapsed ? "solar:alt-arrow-right-bold" : "solar:alt-arrow-left-bold"} className="h-3.5 w-3.5" />
          </button>

          <div className="hidden md:flex flex-1 max-w-sm items-center gap-2 rounded-md bg-secondary px-3 py-1.5 text-sm text-muted-foreground">
            <Icon icon="solar:magnifer-bold-duotone" className="h-3.5 w-3.5" />
            <span className="text-xs">Search...</span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <button className="relative flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors">
              <Icon icon="solar:bell-bold-duotone" className="h-4.5 w-4.5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary ring-2 ring-card" />
            </button>
            <div className="h-6 w-px bg-border" />
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center text-primary text-xs font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <div className="hidden lg:block">
                <p className="text-xs font-semibold text-foreground leading-none">{user?.name?.split(" ")[0] || "User"}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{user?.role || "Member"}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto scrollbar-thin bg-background">
          <div className="mx-auto max-w-7xl p-4 lg:p-6 animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;
