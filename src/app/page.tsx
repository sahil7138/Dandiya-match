"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { 
  CalendarDays, MapPin, Clock, Users, Sparkles, Music, Star, ArrowRight, ArrowUpRight,
  ShieldCheck, Phone, MessageSquare, ChevronDown, Check, Zap, Heart, Disc, Flame
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { EventCountdown } from "@/components/countdown"

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const passes = [
    {
      id: "SINGLE",
      name: "Solo Pass",
      tagline: "Solo Entry + Dandiya Match",
      price: "₹299",
      priceNum: 299,
      entry: "Entry for 1 Person",
      highlight: true,
      badge: "🎲 MATCHMAKING ELIGIBLE",
      badgeColor: "from-primary to-[#ffb800]",
      features: [
        "Full access to Garba & DJ dance floor",
        "Eligible for Random Partner Matchmaking",
        "24-Hour Secret Partner Reveal on Dashboard",
        "Complimentary parking pass access",
        "Access to food stalls & photo booths",
      ],
      cta: "Join The Match Pool",
    },
    {
      id: "COUPLE",
      name: "Duo Pass",
      tagline: "Entry for Two",
      price: "₹549",
      priceNum: 549,
      entry: "Entry for 2 People",
      highlight: false,
      badge: "👯 DYNAMIC DUO",
      badgeColor: "from-[#8b5cf6] to-primary",
      features: [
        "Direct entry for 2 participants",
        "Dance side-by-side all night",
        "Full access to Garba & live DJ sets",
        "Convenient turf parking space",
        "Access to food stalls & photo-ops",
      ],
      cta: "Get Duo Pass",
    },
    {
      id: "GROUP",
      name: "Bling Squad",
      tagline: "Squad Entry for 4",
      price: "₹1,149",
      priceNum: 1149,
      entry: "Entry for 4 People",
      highlight: false,
      badge: "⚡ SQUAD GOALS",
      badgeColor: "from-[#ffb800] to-orange-500",
      features: [
        "Entry for 4 members together",
        "Save on group pricing",
        "Full access to turf dance zone",
        "Fast-track entry lane for groups",
        "Access to all stalls & festivities",
      ],
      cta: "Grab Squad Pass",
    },
    {
      id: "GANG",
      name: "Bling Gang",
      tagline: "Mega Crew Pass for 10",
      price: "₹2,799",
      priceNum: 2799,
      entry: "Entry for 10 People",
      highlight: false,
      badge: "👑 BEST VALUE (₹280/p)",
      badgeColor: "from-emerald-400 to-teal-500",
      features: [
        "Massive group entry for 10 people",
        "Lowest per-person rate (₹280/head)",
        "VIP group photo-op priority",
        "Fast-track crew entry lane",
        "Full access to turf & DJ celebration",
      ],
      cta: "Book Gang Pass",
    },
  ]

  const expectations = [
    {
      icon: "🎶",
      title: "Live Music + DJ",
      desc: "Authentic Gujarati Dhol, high-octane Bollywood remixes & non-stop dance anthems.",
      color: "from-pink-500/20 to-purple-500/20",
    },
    {
      icon: "💃",
      title: "Garba & Dandiya",
      desc: "Celebrate Navratri in full festive spirit with energetic circles, steps, and swag.",
      color: "from-amber-500/20 to-orange-500/20",
    },
    {
      icon: "🅿️",
      title: "Good Parking Space",
      desc: "Convenient & hassle-free parking facility reserved for attendees at Noupark Turf.",
      color: "from-blue-500/20 to-cyan-500/20",
    },
    {
      icon: "👥",
      title: "Limited Crowd",
      desc: "Strictly limited capacity to ensure a comfortable, premium experience without overcrowding.",
      color: "from-emerald-500/20 to-teal-500/20",
    },
    {
      icon: "🍴",
      title: "Food & Mocktail Stalls",
      desc: "Delicious festive treats, chaat counters, and refreshing drinks to keep energy peaking.",
      color: "from-rose-500/20 to-pink-500/20",
    },
    {
      icon: "✨",
      title: "Festive Experience",
      desc: "Garba | Glam | Glow. Aesthetic neon lighting, mirror-work aesthetics & Instagram reels spots.",
      color: "from-violet-500/20 to-indigo-500/20",
    },
  ]

  const faqs = [
    {
      q: "What is GenZ Bling Navratri 2026?",
      a: "It's Pune's most energetic, modern Navratri night hosted at Noupark Turf, Narhe on 17th October 2026. Combining traditional Dandiya with live music, a curated limited crowd, and a fun secret partner matchmaking feature for solo attendees.",
    },
    {
      q: "How does the Dandiya Partner Matchmaking work?",
      a: "If you purchase a Solo Pass (₹299), you can opt-in during registration to be paired with a random dance partner based on your age, dance vibe, and gender preferences. Your match stays strictly locked until 24 hours prior to the event, when it reveals on your personal dashboard!",
    },
    {
      q: "Can Couples or Squad passes participate in Matchmaking?",
      a: "No. Partner matchmaking is exclusively for Solo Pass holders who want to meet a new dance companion. Duo and Squad pass holders already attend with their chosen companions.",
    },
    {
      q: "What should I wear?",
      a: "Festive Glam! Traditional Chaniya Choli, Kurta Pajama, or Indo-western festive attire with your best bling accessories. Comfortable footwear suitable for artificial turf is recommended.",
    },
    {
      q: "Are Dandiya sticks available at the venue?",
      a: "Yes! High-quality Dandiya sticks will be available for purchase at the venue merchandise counter, or you can bring your own favorite pair.",
    },
    {
      q: "How do I access my ticket after payment?",
      a: "Once you register and upload your payment screenshot, you will receive a unique GBN Pass Number. You can immediately log into the Attendee Dashboard using your phone number to check your status, pass details, and countdown.",
    },
  ]

  const helplines = [
    { phone: "+91 7709468117", raw: "917709468117" },
    { phone: "+91 8080206737", raw: "918080206737" },
    { phone: "+91 9130389407", raw: "919130389407" },
    { phone: "+91 9689582000", raw: "919689582000" },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-[#09080e] text-white overflow-x-hidden selection:bg-primary selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 px-4 flex flex-col items-center text-center">
        {/* Glow ambient background orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-to-r from-primary/20 via-[#8b5cf6]/20 to-[#ffb800]/15 rounded-full blur-[140px] pointer-events-none -z-10" />

        {/* Floating GenZ Pill */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-pill border border-white/10 text-xs sm:text-sm font-bold tracking-wide mb-6 shadow-lg"
        >
          <span className="text-base">🪩</span>
          <span className="text-gradient-gold">PUNE&apos;S MOST HYPED NAVRATRI</span>
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-zinc-300">17TH OCT 2026</span>
        </motion.div>

        {/* Official Event Logo Artwork */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative mb-4 max-w-[260px] sm:max-w-[320px] md:max-w-[360px] mx-auto group"
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-primary/35 via-[#8b5cf6]/25 to-[#ffb800]/35 rounded-full blur-3xl -z-10 scale-95 animate-pulse" />
          <img
            src="/logo.png"
            alt="GENZ BLING NAVRATRI 2026"
            className="w-full h-auto object-contain drop-shadow-[0_15px_40px_rgba(255,42,122,0.45)] transition-transform duration-300 group-hover:scale-105"
          />
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl md:text-7xl font-black font-outfit tracking-tight leading-[1.05] max-w-5xl mb-4"
        >
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#ffe0ec] to-white">
            PUNE&apos;S ULTIMATE
          </span> <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-[#ff6b00] to-[#ffb800] drop-shadow-[0_10px_30px_rgba(255,42,122,0.35)]">
            DANDIYA CELEBRATION
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg sm:text-2xl text-zinc-300 font-light max-w-2xl mb-8 leading-relaxed"
        >
          <strong className="text-white font-semibold">Garba | Dandiya | Live Music | DJ 🎶</strong>
          <br className="hidden sm:inline" />
          <span className="text-zinc-400 text-base sm:text-xl">
            One night. One secret Dandiya partner. Unlimited memories.
          </span>
        </motion.p>

        {/* CTA Button Group */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center max-w-lg mb-12"
        >
          <Link href="#passes" className="w-full sm:w-auto">
            <Button
              size="lg"
              className="w-full sm:w-auto h-14 px-8 rounded-2xl bg-gradient-to-r from-primary via-[#e11d48] to-[#ffb800] text-white font-bold text-base shadow-[0_10px_30px_rgba(255,42,122,0.35)] hover:scale-[1.03] transition-all border-0"
            >
              <Sparkles className="w-5 h-5 mr-2" /> Book Your Pass
            </Button>
          </Link>
          <Link href="/register?pass=SINGLE" className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto h-14 px-7 rounded-2xl glass-card border-white/15 text-white hover:bg-white/10 hover:border-primary/50 text-base font-semibold transition-all"
            >
              🎲 Enter Matchmaking
            </Button>
          </Link>
        </motion.div>

        {/* Live Countdown Component */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="w-full max-w-lg"
        >
          <EventCountdown />
        </motion.div>

        {/* Sponsors Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="w-full max-w-5xl mt-16"
        >
          <p className="text-sm font-semibold text-zinc-400 uppercase tracking-widest mb-6">Our Sponsors & Partners</p>
          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6">
            {[
              "001.png",
              "Black Musical Notes Icon Logo_20260221_090025_0000.png",
              "Digital Prabhat_Logo.jpg.jpeg",
              "Eventwale logo.png",
              "GD.png",
              "Layer 29.png",
              "PHOTO-2026-09-29-11-41-56.png",
              "PHOTO-2026-09-29-11-51-41.png",
              "genz bling png.png",
              "noupark.png",
              "parvati logo.png"
            ].map((logo, idx) => (
              <div key={idx} className="h-16 w-24 sm:h-20 sm:w-32 flex items-center justify-center p-2 sm:p-3 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors">
                <img
                  src={`/Sponsores/${logo}`}
                  alt={`Sponsor ${idx + 1}`}
                  className="max-h-full max-w-full object-contain filter drop-shadow-sm brightness-110"
                />
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Event Overview Badges Banner */}
      <section className="w-full max-w-6xl mx-auto px-4 -mt-6 mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {[
            { icon: CalendarDays, label: "DATE", value: "17th October 2026", sub: "Saturday Night" },
            { icon: Clock, label: "TIMING", value: "7:00 PM Onwards", sub: "Until Midnight Beats" },
            { icon: MapPin, label: "VENUE", value: "Noupark Turf, Narhe", sub: "Near Premia Society, Pune" },
            { icon: Music, label: "SOUND", value: "Live Dhol + DJ", sub: "Bollywood & EDM Beats" },
          ].map((item, i) => (
            <div
              key={i}
              className="glass-card glass-card-hover rounded-2xl p-4 sm:p-5 border border-white/5 flex items-start gap-3.5"
            >
              <div className="p-2.5 rounded-xl bg-primary/15 text-primary border border-primary/20 shrink-0">
                <item.icon className="w-5 h-5" />
              </div>
              <div className="text-left overflow-hidden">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#ffb800]">
                  {item.label}
                </span>
                <p className="font-bold text-sm sm:text-base text-white truncate">{item.value}</p>
                <p className="text-xs text-zinc-400 truncate">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* What To Expect Section */}
      <section id="experience" className="w-full max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-pill border border-white/10 text-xs font-semibold text-[#ffb800] uppercase tracking-widest mb-3">
            <Flame className="w-3.5 h-3.5 text-primary" /> THE BLING EXPERIENCE
          </div>
          <h2 className="text-3xl sm:text-5xl font-black font-outfit tracking-tight text-white mb-4">
            What To Expect
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto">
            A high-energy, safe, and comfortable Navratri celebration designed for GenZ creators, dancers, and festive lovers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {expectations.map((item, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="glass-card rounded-2xl p-6 border border-white/10 relative overflow-hidden group transition-all"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${item.color} rounded-full blur-2xl pointer-events-none -z-0 opacity-40 group-hover:opacity-80 transition-opacity`} />
              <div className="relative z-10">
                <div className="text-4xl mb-4 p-3 w-fit rounded-2xl bg-white/5 border border-white/10 shadow-inner">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold font-outfit text-white mb-2">{item.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Secret Matchmaking Section */}
      <section id="matchmaking" className="w-full max-w-6xl mx-auto px-4 py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-[#8b5cf6]/10 to-transparent rounded-[3rem] blur-3xl pointer-events-none -z-10" />

        <div className="glass-card rounded-[2.5rem] p-8 md:p-14 border border-white/10 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-primary/15 border border-primary/30 text-primary text-xs font-bold tracking-wider uppercase">
                <Sparkles className="w-3.5 h-3.5 text-[#ffb800]" /> SECRET FEATURE
              </div>
              <h2 className="text-3xl sm:text-5xl font-black font-outfit tracking-tight text-white leading-tight">
                How The Secret Dandiya <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#ffb800]">
                  Matchmaking Works
                </span>
              </h2>
              <p className="text-zinc-300 text-base sm:text-lg leading-relaxed">
                Coming solo? You won&apos;t be dancing alone! Our algorithm pairs you with a random Dandiya partner based on your age, dance experience, and vibe.
              </p>

              {/* 3 Step Timeline */}
              <div className="space-y-4 pt-2">
                {[
                  {
                    step: "01",
                    title: "Opt-In with a Solo Pass",
                    desc: "Select the ₹299 Solo Pass and opt-in for random partner matching during registration.",
                  },
                  {
                    step: "02",
                    title: "AI Vibe Matching",
                    desc: "Pick your preferred gender (Male / Female / Anyone), your Dandiya skill level, and energy vibe.",
                  },
                  {
                    step: "03",
                    title: "The 24-Hour Secret Reveal",
                    desc: "Your match stays locked until strictly 24 hours before the event, when it reveals on your private dashboard!",
                  },
                ].map((st, idx) => (
                  <div key={idx} className="flex items-start gap-4 p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                    <span className="text-lg font-black font-mono text-primary px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 shrink-0">
                      {st.step}
                    </span>
                    <div>
                      <h4 className="font-bold text-sm sm:text-base text-white">{st.title}</h4>
                      <p className="text-xs sm:text-sm text-zinc-400">{st.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex flex-wrap gap-4">
                <Link href="/register?pass=SINGLE">
                  <Button className="h-12 px-6 rounded-xl bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/25">
                    Join Match Pool (₹299) <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>
                <Link href="/rules">
                  <Button variant="outline" className="h-12 px-5 rounded-xl border-white/10 hover:bg-white/5 text-zinc-300">
                    Read Match Rules
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Card Mockup */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="w-full max-w-sm rounded-3xl p-6 glass-card border border-primary/30 shadow-[0_0_50px_rgba(255,42,122,0.2)] text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 px-4 py-1 bg-gradient-to-r from-primary to-[#ffb800] text-black font-extrabold text-[10px] rounded-bl-xl tracking-wider uppercase">
                  CONFIDENTIAL
                </div>
                
                <div className="w-20 h-20 mx-auto rounded-full bg-gradient-to-br from-primary/20 via-[#8b5cf6]/30 to-[#ffb800]/20 border-2 border-primary/50 flex items-center justify-center text-3xl mb-4 mt-2">
                  🪩
                </div>

                <span className="text-[11px] font-bold tracking-widest text-[#ffb800] uppercase">
                  DANDIYA PARTNER MATCH
                </span>
                <h3 className="text-2xl font-black font-outfit text-white my-1">Locked until 24H</h3>
                <p className="text-xs text-zinc-400 mb-6">
                  Reveal Countdown triggers on Oct 16, 2026 at 7:00 PM.
                </p>

                <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 text-left space-y-2 mb-6">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400">Match Pool:</span>
                    <span className="font-semibold text-emerald-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Active & Filling
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400">Preferences:</span>
                    <span className="font-semibold text-white">Gender • Vibe • Age</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-400">Reveal Venue:</span>
                    <span className="font-semibold text-[#ffb800]">Your Dashboard</span>
                  </div>
                </div>

                <Link href="/register?pass=SINGLE" className="block w-full">
                  <Button className="w-full rounded-xl bg-gradient-to-r from-primary to-[#ffb800] text-white font-bold h-11">
                    Get Single Pass & Get Paired
                  </Button>
                </Link>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Ticket Passes Section */}
      <section id="passes" className="w-full max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full glass-pill border border-white/10 text-xs font-semibold text-[#ffb800] uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5 text-primary" /> PASS SELECTION
          </div>
          <h2 className="text-3xl sm:text-5xl font-black font-outfit tracking-tight text-white mb-4">
            Choose Your Entry Pass
          </h2>
          <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto">
            Limited crowd passes for an exclusive turf experience. Book early before prices hike!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {passes.map((pass) => (
            <motion.div
              key={pass.id}
              whileHover={{ y: -6 }}
              className={`rounded-3xl p-6 glass-card flex flex-col justify-between transition-all relative ${
                pass.highlight
                  ? "border-primary/50 shadow-[0_0_40px_rgba(255,42,122,0.25)] bg-[#171126]/90"
                  : "border-white/10 hover:border-white/20"
              }`}
            >
              {/* Badge */}
              <div className="mb-4">
                <span
                  className={`inline-block text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-gradient-to-r ${pass.badgeColor} text-black`}
                >
                  {pass.badge}
                </span>
              </div>

              {/* Title & Price */}
              <div>
                <h3 className="text-2xl font-extrabold font-outfit text-white mb-1">{pass.name}</h3>
                <p className="text-xs text-zinc-400 mb-4">{pass.tagline}</p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-black font-outfit text-white tracking-tight">
                    {pass.price}
                  </span>
                  <span className="text-xs text-zinc-400">/ pass</span>
                </div>
                <p className="text-xs font-medium text-[#ffb800] pb-5 border-b border-white/10">
                  {pass.entry}
                </p>

                {/* Features */}
                <ul className="space-y-3 py-6 text-left">
                  {pass.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2.5 text-xs text-zinc-300">
                      <div className="p-0.5 rounded-full bg-primary/20 text-primary mt-0.5 shrink-0">
                        <Check className="w-3 h-3" />
                      </div>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <Link href={`/register?pass=${pass.id}`} className="w-full mt-4">
                <Button
                  className={`w-full h-12 rounded-xl font-bold text-sm ${
                    pass.highlight
                      ? "bg-gradient-to-r from-primary via-[#e11d48] to-[#ffb800] text-white shadow-lg shadow-primary/30 hover:opacity-95"
                      : "bg-white/10 hover:bg-white/15 text-white border border-white/10"
                  }`}
                >
                  {pass.cta} <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Venue & Location Section */}
      <section className="w-full max-w-6xl mx-auto px-4 py-16">
        <div className="glass-card rounded-[2.5rem] p-8 md:p-12 border border-white/10 relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-5 text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffb800]/15 border border-[#ffb800]/30 text-[#ffb800] text-xs font-bold uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5" /> TURF VENUE
              </div>
              <h2 className="text-3xl sm:text-4xl font-black font-outfit text-white">
                Noupark Turf, Narhe
              </h2>
              <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
                Located near Premia Society in Narhe, Pune. A premier, spacious synthetic turf arena equipped with festival lighting, professional sound arrays, food stall walkways, and ample hassle-free parking.
              </p>
              <div className="space-y-2 pt-2 text-sm text-zinc-300">
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary" /> Near Premia Society, Narhe, Pune - 411041
                </p>
                <p className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#ffb800]" /> Saturday, 17th October 2026 • Gates open 6:30 PM
                </p>
              </div>
              <div className="pt-2">
                <a
                  href="https://maps.google.com/?q=Noupark+Turf+Narhe+Pune"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="rounded-xl h-12 px-6 bg-white/10 hover:bg-white/15 text-white border border-white/15 font-semibold">
                    Open in Google Maps <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </a>
              </div>
            </div>

            {/* Quick Venue Visual Card */}
            <div className="rounded-3xl p-8 bg-gradient-to-br from-[#1b152d] to-[#0d0a17] border border-white/10 text-center flex flex-col items-center justify-center min-h-[260px] relative">
              <div className="w-16 h-16 rounded-2xl bg-primary/20 border border-primary/30 flex items-center justify-center text-3xl mb-4">
                🏟️
              </div>
              <h4 className="text-xl font-bold font-outfit text-white mb-2">Turf Navratri Arena</h4>
              <p className="text-xs text-zinc-400 max-w-xs mb-4">
                Synthetic turf surface protects feet for 5+ hours of continuous Garba dancing!
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                🅿️ Dedicated Parking Available
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Official Enquiries Helpline Bar */}
      <section className="w-full max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold font-outfit text-white mb-2">
            Have Questions? Reach Out!
          </h2>
          <p className="text-zinc-400 text-sm">
            Contact any of our official organizers directly for bulk bookings, queries or sponsorship.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {helplines.map((h, idx) => (
            <div key={idx} className="glass-card rounded-2xl p-4 border border-white/10 text-center flex flex-col items-center">
              <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2">
                <Phone className="w-4 h-4" />
              </div>
              <span className="text-xs text-zinc-400 font-medium mb-1">Helpline {idx + 1}</span>
              <a href={`tel:${h.phone}`} className="font-mono font-bold text-base text-white hover:text-primary mb-3">
                {h.phone}
              </a>
              <div className="flex items-center gap-2 w-full">
                <a href={`tel:${h.phone}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full rounded-xl text-xs border-white/10 bg-white/5 hover:bg-white/10">
                    <Phone className="w-3 h-3 mr-1" /> Call
                  </Button>
                </a>
                <a
                  href={`https://wa.me/${h.raw}?text=Hi!%20I%20have%20an%20enquiry%20regarding%20GenZ%20Bling%20Navratri%202026`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1"
                >
                  <Button size="sm" className="w-full rounded-xl text-xs bg-emerald-600 hover:bg-emerald-500 text-white">
                    <MessageSquare className="w-3 h-3 mr-1" /> WhatsApp
                  </Button>
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Partners & Organizers Section */}
      <section id="partners" className="w-full max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-pill border border-white/10 text-xs font-semibold text-[#ffb800] uppercase tracking-widest mb-3">
            <Sparkles className="w-3.5 h-3.5 text-primary" /> CREATIVE & TECH FORCE
          </div>
          <h2 className="text-3xl sm:text-4xl font-black font-outfit text-white mb-2">
            Organizers & Partners
          </h2>
          <p className="text-zinc-400 text-sm max-w-xl mx-auto">
            Powered by industry-leading event curation and next-generation software engineering.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* EventWale - Organizer */}
          <motion.div
            whileHover={{ y: -4 }}
            className="glass-card rounded-3xl p-8 border border-primary/30 relative overflow-hidden flex flex-col justify-between group"
          >
            <div className="absolute top-0 right-0 w-36 h-36 bg-primary/10 rounded-full blur-3xl pointer-events-none -z-0" />
            <div>
              <div className="flex items-center justify-between gap-3 mb-6">
                <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-gradient-to-r from-primary to-[#ffb800] text-black">
                  OFFICIAL ORGANIZER
                </span>
                <span className="text-xs text-zinc-500 font-mono">EST. PUNE</span>
              </div>

              {/* Logo / Brand Display */}
              <div className="flex items-center gap-4 mb-4">
                <div className="h-16 px-4 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-center">
                  <img
                    src="/Sponsores/Eventwale logo.png"
                    alt="EventWale"
                    className="h-9 w-auto object-contain"
                    onError={(e) => {
                      // Fallback if image fails
                      (e.target as HTMLElement).style.display = "none"
                    }}
                  />
                  <span className="font-extrabold text-2xl font-outfit text-white tracking-tight ml-2">
                    EventWale
                  </span>
                </div>
              </div>

              <h3 className="text-xl font-bold font-outfit text-white mb-2">
                EventWale
              </h3>
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                Curating premier cultural, festive, and live music experiences across Pune. Bringing luxury crowd curation, top-tier artists, and unforgettable festive energy to Navratri 2026.
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
              <span>Event Curation & Production</span>
              <span className="text-[#ffb800] font-semibold">★ Main Organizer</span>
            </div>
          </motion.div>

          {/* Webwork Studios LLP - Technology Partner */}
          <motion.div
            whileHover={{ y: -4 }}
            className="glass-card rounded-3xl p-8 border border-[#8b5cf6]/30 relative overflow-hidden flex flex-col justify-between group"
          >
            <div className="absolute top-0 right-0 w-36 h-36 bg-[#8b5cf6]/10 rounded-full blur-3xl pointer-events-none -z-0" />
            <div>
              <div className="flex items-center justify-between gap-3 mb-6">
                <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-gradient-to-r from-[#8b5cf6] to-cyan-400 text-white">
                  TECHNOLOGY PARTNER
                </span>
                <span className="text-xs text-zinc-500 font-mono">TECH & PRODUCT</span>
              </div>

              {/* Logo / Brand Display */}
              <div className="flex items-center gap-4 mb-4">
                <a
                  href="https://webworksstudios.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-16 px-4 rounded-2xl bg-white/95 border border-white/20 flex items-center justify-center shadow-lg hover:bg-white transition-all group/logo cursor-pointer"
                >
                  <img
                    src="/partners/webwork.png"
                    alt="Webwork Studios LLP"
                    className="h-12 w-auto object-contain transition-transform group-hover/logo:scale-105"
                  />
                  <div className="ml-3 flex items-baseline gap-1">
                    <span className="font-extrabold text-xl font-outfit text-zinc-950 tracking-tight">
                      webwork studios
                    </span>
                    <span className="font-mono text-xs font-bold text-cyan-600">LLP</span>
                  </div>
                </a>
              </div>

              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold font-outfit text-white">
                  Webwork Studios LLP
                </h3>
                <a
                  href="https://webworksstudios.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 hover:underline"
                >
                  Visit Website <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed">
                Engineering high-performance web applications, digital pass verification, and the proprietary AI matchmaking algorithm powering the Dandiya Match experience.
              </p>
            </div>

            <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
              <a
                href="https://webworksstudios.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-cyan-400 transition-colors flex items-center gap-1"
              >
                webworksstudios.com <ArrowUpRight className="w-3 h-3" />
              </a>
              <span className="text-cyan-400 font-semibold">★ Technology Partner</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FAQs Section */}
      <section className="w-full max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-pill border border-white/10 text-xs font-semibold text-[#ffb800] uppercase tracking-widest mb-3">
            NEED HELP?
          </div>
          <h2 className="text-3xl sm:text-4xl font-black font-outfit text-white mb-2">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx
            return (
              <div
                key={idx}
                className="glass-card rounded-2xl border border-white/10 overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex justify-between items-center gap-4 hover:bg-white/[0.02]"
                >
                  <span className="font-bold text-sm sm:text-base text-white">{faq.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-sm text-zinc-300 leading-relaxed border-t border-white/5">
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Bottom Master CTA */}
      <section className="w-full max-w-5xl mx-auto px-4 py-16 text-center">
        <div className="glass-card rounded-[3rem] p-10 md:p-16 border border-primary/30 relative overflow-hidden shadow-[0_0_80px_rgba(255,42,122,0.2)]">
          <div className="absolute top-0 right-0 w-80 h-80 bg-primary/20 rounded-full blur-[100px] pointer-events-none -z-0" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#8b5cf6]/20 rounded-full blur-[100px] pointer-events-none -z-0" />
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <span className="text-4xl mb-3 block">🪩</span>
            <h2 className="text-3xl sm:text-5xl font-black font-outfit text-white mb-4">
              Ready For The Bling Night?
            </h2>
            <p className="text-zinc-300 text-base sm:text-lg mb-8 leading-relaxed">
              Limited crowd tickets are selling fast. Grab your pass, pick your vibe, and let the Dandiya magic do the rest.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="h-14 px-8 rounded-2xl bg-gradient-to-r from-primary to-[#ffb800] text-white font-bold text-base shadow-xl shadow-primary/30">
                  Register & Get Pass Now <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="h-14 px-8 rounded-2xl border-white/15 bg-white/5 text-white hover:bg-white/10 text-base font-semibold">
                  Attendee Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
