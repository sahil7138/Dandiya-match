"use client"

import { useState } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, Menu, X, ArrowUpRight, ShieldCheck, Ticket, User, Disc3 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const navLinks = [
    { name: "Experience", href: "/#experience" },
    { name: "Passes", href: "/#passes" },
    { name: "Matchmaking", href: "/#matchmaking" },
    { name: "Partners", href: "/#partners" },
    { name: "Rules", href: "/rules" },
    { name: "Enquiries", href: "/#enquiries" },
  ]

  return (
    <header className="sticky top-3 z-50 w-full px-4 max-w-6xl mx-auto">
      <div className="glass-card rounded-2xl px-5 py-3.5 flex items-center justify-between border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-xl overflow-hidden bg-black/60 border border-white/10 p-0.5 transition-transform group-hover:scale-105 shadow-md shadow-primary/20">
            <img
              src="/logo.png"
              alt="GENZ BLING NAVRATRI 2026"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold tracking-tight font-outfit text-lg text-white">GENZ BLING</span>
              <span className="text-[10px] font-black uppercase px-1.5 py-0.5 rounded bg-primary/20 text-primary border border-primary/30 tracking-wider">
                2026
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-medium">By EventWale • Tech by Webwork</p>
          </div>
        </Link>

        {/* Desktop Nav Items */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-muted-foreground hover:text-white transition-colors duration-200 tracking-wide"
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right CTA */}
        <div className="hidden md:flex items-center gap-3">
          <Link href="/login">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-xl text-xs font-semibold text-zinc-300 hover:text-white hover:bg-white/5 border border-white/5"
            >
              <User className="w-3.5 h-3.5 mr-1.5 text-primary" />
              Login
            </Button>
          </Link>
          <a href="/register">
            <Button
              size="sm"
              className="rounded-xl text-xs font-bold bg-gradient-to-r from-primary via-[#e11d48] to-[#ffb800] hover:opacity-95 text-white shadow-lg shadow-primary/25 border-0 hover:scale-[1.02] transition-transform"
            >
              <Ticket className="w-3.5 h-3.5 mr-1.5" />
              Book Pass
            </Button>
          </a>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 rounded-xl text-zinc-300 hover:text-white bg-white/5 border border-white/10"
          aria-label="Toggle Navigation"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden mt-2 glass-card rounded-2xl p-5 border border-white/10 shadow-2xl flex flex-col gap-4"
          >
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
            <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
              <Link href="/login" onClick={() => setIsOpen(false)}>
                <Button variant="outline" className="w-full rounded-xl border-white/10 text-white bg-white/5">
                  <User className="w-4 h-4 mr-2" /> Participant Login
                </Button>
              </Link>
              <a href="/register" onClick={() => setIsOpen(false)}>
                <Button className="w-full rounded-xl bg-gradient-to-r from-primary to-[#ffb800] text-white font-bold">
                  <Ticket className="w-4 h-4 mr-2" /> Book Pass Now
                </Button>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
