"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { logoutAdmin } from "@/actions/admin-auth"
import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "cn"
import { 
  LayoutDashboard, Users, CreditCard, Network, Dices, 
  Settings, ShieldAlert, LogOut, Menu, X, Bell, Database, Loader2, KeyRound 
} from "lucide-react"
import { ChangePasswordModal } from "./_components/change-password-modal"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async (e?: React.MouseEvent | React.FormEvent) => {
    if (e) e.preventDefault()
    setIsLoggingOut(true)
    try {
      await fetch("/api/admin/logout", { method: "POST" })
    } catch (err) {
      console.error("Logout error:", err)
    }
    window.location.href = "/admin/login"
  }
  
  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Participants", href: "/admin/participants", icon: Users },
    { name: "Payments", href: "/admin/payments", icon: CreditCard },
    { name: "Matchmaking", href: "/admin/matchmaking", icon: Network },
    { name: "Matches", href: "/admin/matches", icon: Dices },
    { name: "Backup & Sync", href: "/admin/backup", icon: Database },
    { name: "Event Settings", href: "/admin/event", icon: Settings },
  ]

  const renderSidebarContent = () => (
    <>
      <div className="p-6 border-b flex items-center gap-2.5">
        <div className="w-9 h-9 rounded-xl overflow-hidden bg-black/60 border border-white/10 p-0.5 shadow-md shadow-primary/20 shrink-0">
          <img
            src="/logo.png"
            alt="GENZ BLING '26"
            className="w-full h-full object-contain"
          />
        </div>
        <div>
          <h2 className="text-base font-extrabold text-foreground leading-none font-outfit">GENZ BLING &apos;26</h2>
          <span className="text-[10px] uppercase font-mono text-muted-foreground tracking-wider">Admin Control</span>
        </div>
      </div>
      <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname.startsWith(`${item.href}/`) && item.href !== "/admin")
          return (
            <Link
              key={item.name}
              href={item.href}
              prefetch={true}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                buttonVariants({ variant: isActive ? "secondary" : "ghost" }),
                "w-full justify-start cursor-pointer transition-all duration-150 h-9 px-3",
                isActive 
                  ? "bg-primary/15 text-primary font-bold hover:bg-primary/25 shadow-sm" 
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )}
            >
              <item.icon className="mr-3 h-5 w-5 shrink-0" />
              {item.name}
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t space-y-1.5">
        <ChangePasswordModal
          trigger={
            <Button
              type="button"
              variant="ghost"
              className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-white/5 cursor-pointer h-9 px-3 text-xs"
            >
              <KeyRound className="mr-3 h-4 w-4 text-primary shrink-0" />
              Change Password
            </Button>
          }
        />
        <Button
          type="button"
          onClick={handleLogout}
          disabled={isLoggingOut}
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-red-500 hover:bg-red-500/10 cursor-pointer h-9 px-3 text-xs"
        >
          {isLoggingOut ? (
            <Loader2 className="mr-3 h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="mr-3 h-4 w-4" />
          )}
          {isLoggingOut ? "Logging out..." : "Logout"}
        </Button>
      </div>
    </>
  )

  if (pathname === "/admin/login") {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen flex bg-muted/20">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-card border-r flex-col h-screen sticky top-0">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />
          <aside className="relative w-64 bg-card border-r flex flex-col h-screen shadow-xl z-50">
            <Button variant="ghost" size="icon" className="absolute top-4 right-4" onClick={() => setIsMobileOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
            {renderSidebarContent()}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-card border-b flex items-center justify-between px-4 lg:px-8 sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setIsMobileOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            {/* Can add breadcrumbs or search here */}
          </div>
          
          <div className="flex items-center gap-2.5">
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1.5 h-2 w-2 rounded-full bg-primary" />
            </Button>
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-muted/40 border text-xs">
              <div className="h-6 w-6 rounded-md bg-primary/15 flex items-center justify-center text-primary font-bold text-xs">
                AD
              </div>
              <span className="font-mono text-muted-foreground hidden md:inline text-[11px]">
                rccindia@webworksstudios.com
              </span>
            </div>
            <ChangePasswordModal />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-xs gap-1.5 text-muted-foreground hover:text-red-500 hover:border-red-500/30 cursor-pointer h-8 px-2.5"
            >
              {isLoggingOut ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <LogOut className="h-3.5 w-3.5" />
              )}
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
