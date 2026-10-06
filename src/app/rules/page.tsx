"use client"

import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Sparkles, ShieldCheck, Heart, Lock, AlertTriangle, Users } from "lucide-react"

export default function RulesPage() {
  const rules = [
    {
      num: "01",
      title: "Solo Pass Eligibility",
      desc: "Random partner matching is exclusively open to Solo Pass (₹299) participants who opt-in during registration. Duo and Group entries are already attending with their selected companions.",
      icon: Users,
    },
    {
      num: "02",
      title: "AI & Random Algorithmic Pairing",
      desc: "Matches are generated to balance dance vibes, age brackets, and preferred partner gender. The spirit of the night is celebrating Navratri and meeting someone with great dance energy!",
      icon: Sparkles,
    },
    {
      num: "03",
      title: "Strict 24-Hour Locked Reveal",
      desc: "All matches are kept strictly confidential and locked until 24 hours before the event starts (October 16, 2026, 7:00 PM). The timer unlocks your partner on your attendee dashboard.",
      icon: Lock,
    },
    {
      num: "04",
      title: "Privacy & Safe Community",
      desc: "Phone numbers and personal contact information are NEVER publicly shared. You only see your partner's first name, age group, experience, and vibe. Exchange numbers only with mutual consent at the venue.",
      icon: ShieldCheck,
    },
    {
      num: "05",
      title: "Pure Festive Dandiya Experience",
      desc: "This is a modern Navratri Garba & Dandiya dance event, NOT a dating or matrimony service. Keep conversations fun, respectful, and centered around celebrating festive culture.",
      icon: Heart,
    },
    {
      num: "06",
      title: "Respect & Zero Harassment Policy",
      desc: "We have strict on-ground security and turf staff. Any disrespectful behavior, harassment, or boundary-crossing will result in immediate escort from the venue without refund.",
      icon: AlertTriangle,
    },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-[#09080e] text-white">
      <Navbar />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 md:py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-pill border border-white/10 text-xs font-bold text-[#ffb800] uppercase tracking-wider mb-3">
            <ShieldCheck className="w-3.5 h-3.5 text-primary" /> COMMUNITY GUIDELINES
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-outfit text-white mb-3">
            Matchmaking & Event Rules
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base max-w-lg mx-auto">
            Everything you need to know about our fair pairing algorithm, privacy protocols, and code of conduct for GenZ Bling Navratri 2026.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {rules.map((rule, idx) => (
            <div
              key={idx}
              className="glass-card rounded-2xl p-6 border border-white/10 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-xs font-mono font-black text-primary px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20">
                    RULE {rule.num}
                  </span>
                  <rule.icon className="w-5 h-5 text-[#ffb800]" />
                </div>
                <h3 className="text-lg font-bold font-outfit text-white mb-2">{rule.title}</h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">{rule.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  )
}
