"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { logoutAdmin } from "../actions/admin-auth"
import { Button } from "@/components/ui/button"
import { 
  LayoutDashboard, Users, CreditCard, Network, Dices, 
  Settings, ShieldAlert, LogOut, Menu, X, Bell 
} from "lucide-react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  
  const navItems = [
    { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { name: "Participants", href: "/admin/participants", icon: Users },
    { name: "Payments", href: "/admin/payments", icon: CreditCard },
    { name: "Matchmaking", href: "/admin/matchmaking", icon: Network },
    { name: "Matches", href: "/admin/matches", icon: Dices },
    { name: "Event Settings", href: "/admin/event", icon: Settings },
  ]

  const SidebarContent = () => (
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
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`) && item.href !== "/admin"
          return (
            <Link key={item.name} href={item.href} onClick={() => setIsMobileOpen(false)}>
              <Button 
                variant={isActive ? "secondary" : "ghost"} 
                className={`w-full justify-start ${isActive ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </Button>
            </Link>
          )
        })}
      </nav>
      <div className="p-4 border-t">
        <form action={logoutAdmin}>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-red-500 hover:bg-red-500/10">
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </Button>
        </form>
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
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />
          <aside className="relative w-64 bg-card border-r flex flex-col h-screen shadow-xl z-50">
            <Button variant="ghost" size="icon" className="absolute top-4 right-4" onClick={() => setIsMobileOpen(false)}>
              <X className="h-5 w-5" />
            </Button>
            <SidebarContent />
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
          
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1.5 h-2 w-2 rounded-full bg-primary" />
            </Button>
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
              AD
            </div>
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
