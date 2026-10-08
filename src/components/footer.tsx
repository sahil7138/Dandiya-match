"use client"

import Link from "next/link"
import { Sparkles, MapPin, Phone, MessageSquare, ShieldCheck, Heart, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Footer() {
  const enquiryNumbers = [
    { number: "+91 7709468117", raw: "917709468117", label: "Helpline 1" },
    { number: "+91 8080206737", raw: "918080206737", label: "Helpline 2" },
    { number: "+91 9130389407", raw: "919130389407", label: "Helpline 3" },
    { number: "+91 9689582000", raw: "919689582000", label: "Helpline 4" },
  ]

  return (
    <footer id="enquiries" className="w-full border-t border-white/10 bg-[#07050d] relative overflow-hidden pt-16 pb-12">
      {/* Glow decorative orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-0" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#8b5cf6]/10 rounded-full blur-[120px] pointer-events-none -z-0" />

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 pb-12 border-b border-white/10">
          
          {/* Brand & Concept */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-black/60 border border-white/10 p-1 shrink-0 shadow-lg shadow-primary/20">
                <img
                  src="/logo.png"
                  alt="GENZ BLING NAVRATRI 2026"
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="font-extrabold text-xl tracking-tight font-outfit text-white">
                GENZ BLING NAVRATRI 2026
              </h3>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-sm">
              Pune&apos;s ultimate modern Dandiya experience. Garba, Glam, Glow, live artists, curated limited crowd, and secret AI-powered partner matchmaking.
            </p>
            <div className="flex items-center gap-2 text-xs text-zinc-400 pt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Official Registration & Matchmaking Portal</span>
            </div>
          </div>

          {/* Enquiries & Helplines */}
          <div className="lg:col-span-4 space-y-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <Phone className="w-4 h-4 text-primary" /> Official Enquiries
            </h4>
            <p className="text-xs text-zinc-400">Have questions about passes or group bookings? Call or WhatsApp anytime:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
              {enquiryNumbers.map((item, idx) => (
                <div key={idx} className="glass-card rounded-xl p-2.5 border border-white/5 flex flex-col gap-1.5">
                  <span className="text-[10px] text-zinc-400 uppercase font-semibold">{item.label}</span>
                  <a
                    href={`tel:${item.number}`}
                    className="text-xs font-mono font-bold text-white hover:text-primary transition-colors"
                  >
                    {item.number}
                  </a>
                  <div className="flex items-center gap-1.5 pt-1">
                    <a
                      href={`tel:${item.number}`}
                      className="px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-[10px] text-zinc-300 font-medium flex items-center gap-1"
                    >
                      <Phone className="w-2.5 h-2.5" /> Call
                    </a>
                    <a
                      href={`https://wa.me/${item.raw}?text=Hi!%20I%20have%20an%20enquiry%20regarding%20GenZ%20Bling%20Navratri%202026`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2 py-0.5 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-[10px] text-emerald-400 font-medium flex items-center gap-1"
                    >
                      <MessageSquare className="w-2.5 h-2.5" /> WhatsApp
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Venue & Navigation */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="text-sm font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#ffb800]" /> Venue Location
            </h4>
            <div className="glass-card rounded-xl p-3.5 border border-white/5 space-y-2">
              <p className="text-xs font-semibold text-white">Noupark Turf</p>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Near Premia Society, Narhe, Pune, Maharashtra 411041
              </p>
              <a
                href="https://maps.google.com/?q=Noupark+Turf+Narhe+Pune"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] font-bold text-[#ffb800] hover:underline pt-1"
              >
                Open in Google Maps <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>

            <div className="pt-2 flex flex-wrap gap-2 text-xs text-zinc-400">
              <Link href="/rules" className="hover:text-white transition-colors">
                Matchmaking Rules
              </Link>
              <span>•</span>
              <Link href="/login" className="hover:text-white transition-colors">
                Attendee Login
              </Link>
              <span>•</span>
              <Link href="/admin/login" className="hover:text-white transition-colors">
                Admin
              </Link>
            </div>
          </div>

        </div>

        {/* Partners Showcase Bar */}
        <div className="py-8 my-8 border-y border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* EventWale */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Organized By:</span>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10">
                <div className="w-6 h-6 rounded-lg overflow-hidden bg-black/40 p-0.5 flex items-center justify-center">
                  <img
                    src="/Sponsores/Eventwale logo.png"
                    alt="EventWale"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="font-extrabold text-sm text-white font-outfit tracking-wide">
                  EventWale
                </span>
              </div>
            </div>

            <div className="hidden sm:block w-[1px] h-6 bg-white/10" />

            {/* Webwork Studios LLP */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Technology Partner:</span>
              <a
                href="https://webworksstudios.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-500/30 transition-all group"
              >
                <div className="w-6 h-6 rounded-lg overflow-hidden bg-white p-0.5 flex items-center justify-center">
                  <img
                    src="/partners/webwork.png"
                    alt="Webwork Studios"
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="font-extrabold text-sm text-white group-hover:text-cyan-400 transition-colors font-outfit tracking-wide flex items-center gap-1">
                  Webwork Studios LLP <ArrowUpRight className="w-3 h-3 text-zinc-400 group-hover:text-cyan-400" />
                </span>
              </a>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] text-zinc-400">
              Official Matchmaking Platform & Ticketing
            </span>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© 2026 GENZ BLING NAVRATRI. Organized by EventWale • Tech by <a href="https://webworksstudios.com/" target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white underline">Webwork Studios LLP</a>.</p>
          <p className="flex items-center gap-1.5 text-zinc-400">
            Designed for the ultimate festive energy <Sparkles className="w-3.5 h-3.5 text-[#ffb800]" />
          </p>
        </div>
      </div>
    </footer>
  )
}
