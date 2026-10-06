"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Link from "next/link"
import { CalendarDays, MapPin, Clock, Users, Sparkles, Music, Star, ArrowRight, ShieldCheck } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center overflow-x-hidden">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 -z-10 bg-background">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background"></div>
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay"></div>
      </div>

      {/* Hero Section */}
      <section className="w-full max-w-6xl mx-auto px-4 pt-24 pb-16 flex flex-col items-center text-center relative">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="absolute top-10 w-96 h-96 bg-primary/20 rounded-full blur-[100px] -z-10"
        />

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center px-4 py-2 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-semibold tracking-wide mb-8 backdrop-blur-md"
        >
          <Sparkles className="w-4 h-4 mr-2" /> GEN-Z NAVRATRI 2026
        </motion.div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-6xl md:text-8xl font-black tracking-tighter font-outfit text-foreground leading-[1.1] mb-6"
        >
          DANDIYA <br className="md:hidden" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-orange-500 drop-shadow-sm">
            MATCH
          </span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-xl md:text-2xl text-muted-foreground font-light max-w-2xl mb-12"
        >
          Experience the ultimate Garba night. <strong className="text-foreground font-semibold">One night. One random partner. Unlimited memories.</strong>
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center max-w-md"
        >
          <Link href="/register" className="w-full">
            <Button size="lg" className="w-full text-lg h-14 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-[1.02]">
              Register Now <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link href="/login" className="w-full">
            <Button size="lg" variant="outline" className="w-full text-lg h-14 rounded-xl border-primary/20 bg-background/50 backdrop-blur-sm hover:bg-primary/10 transition-all">
              Login to Dashboard
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* Event Details Grid */}
      <section className="w-full max-w-5xl mx-auto px-4 py-16">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {[
            { icon: CalendarDays, label: "Date", value: "Oct 17, 2026" },
            { icon: Clock, label: "Time", value: "7:00 PM Onwards" },
            { icon: MapPin, label: "Venue", value: "Noupark Turf, Narhe" },
            { icon: Music, label: "Vibe", value: "Garba, Live Music & DJ" },
          ].map((stat, i) => (
            <div key={i} className="bg-card/50 backdrop-blur-md border border-white/10 p-6 rounded-2xl flex items-center gap-4 hover:bg-card/80 transition-colors">
              <div className="bg-primary/20 p-3 rounded-xl text-primary">
                <stat.icon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="font-semibold text-foreground">{stat.value}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* What to Expect Section */}
      <section className="w-full max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold font-outfit mb-4">What To Expect</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A fun, energetic & comfortable Navratri experience.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { title: "Live Music + DJ", desc: "Garba, Bollywood & non-stop dance vibes", icon: "🎶" },
            { title: "Garba & Dandiya", desc: "Celebrate Navratri in full festive spirit", icon: "💃" },
            { title: "Good Parking Space", desc: "Convenient parking available", icon: "🅿️" },
            { title: "Limited Crowd", desc: "Comfortable & enjoyable experience without overcrowding", icon: "👥" },
            { title: "Food Stalls", desc: "Delicious food & refreshments available", icon: "🍴" },
            { title: "Festive Experience", desc: "Garba | Glam | Glow", icon: "✨" },
          ].map((feature, i) => (
            <div key={i} className="bg-card/30 p-6 rounded-2xl border border-border flex items-start gap-4">
              <div className="text-3xl">{feature.icon}</div>
              <div>
                <h3 className="font-bold text-lg mb-1">{feature.title}</h3>
                <p className="text-muted-foreground text-sm">{feature.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Ticket Prices */}
      <section className="w-full max-w-5xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold font-outfit mb-4">Passes</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: "Solo Pass", price: "₹299", entry: "Entry for 1", type: "SINGLE" },
            { name: "Duo Pass", price: "₹549", entry: "Entry for 2", type: "COUPLE" },
            { name: "Bling Squad", price: "₹1,149", entry: "Entry for 4", type: "GROUP" },
            { name: "Bling Gang", price: "₹2,799", entry: "Entry for 10", type: "GANG" },
          ].map((ticket, i) => (
            <div key={i} className="bg-gradient-to-b from-card to-background p-6 rounded-3xl border border-primary/20 text-center flex flex-col items-center hover:border-primary/50 transition-all hover:-translate-y-2">
              <h3 className="font-bold text-xl mb-2">{ticket.name}</h3>
              <p className="text-4xl font-black text-primary font-outfit mb-2">{ticket.price}</p>
              <p className="text-muted-foreground text-sm mb-6">{ticket.entry}</p>
              <Link href={`/register?pass=${ticket.type}`} className="w-full mt-auto">
                <Button variant={ticket.type === "SINGLE" ? "default" : "outline"} className="w-full rounded-full">
                  {ticket.type === "SINGLE" ? "Get Matched!" : "Buy Pass"}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* How the Matchmaking Works */}
      <section className="w-full max-w-6xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold font-outfit mb-4">How The Magic Works</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Our algorithm pairs you with a random Dandiya partner based on your vibe, age, and experience. 
            The catch? <span className="text-primary font-medium">Matches are kept secret until 24 hours before the event.</span>
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 relative">
          {/* Connector Line */}
          <div className="hidden md:block absolute top-[40%] left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent z-0" />

          {[
            { 
              step: "01", 
              title: "Opt-In for Matchmaking", 
              desc: "Buy a Single Pass and select 'Yes' to enter the random partner pool during registration.",
              icon: Users
            },
            { 
              step: "02", 
              title: "The Algorithm Runs", 
              desc: "Behind the scenes, we pair you up matching your experience and preferred vibe.",
              icon: ShieldCheck
            },
            { 
              step: "03", 
              title: "The Big Reveal", 
              desc: "24 hours before the event, log into your dashboard to unveil your partner's profile!",
              icon: Star
            },
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.2 }}
              className="bg-card border border-border p-8 rounded-3xl relative z-10 shadow-xl flex flex-col items-center text-center mt-12 md:mt-0"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-orange-500 flex items-center justify-center text-white mb-6 shadow-lg shadow-primary/30 transform -translate-y-12 bg-card">
                <item.icon className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full max-w-4xl mx-auto px-4 py-24 text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="bg-gradient-to-br from-primary/20 via-background to-background border border-primary/20 p-12 rounded-[3rem] relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
          <h2 className="text-4xl font-bold font-outfit mb-6">Ready to find your partner?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Spots in the matchmaking pool are filling up fast. Register now, complete your profile, and let the algorithm do the rest.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="text-lg px-8 h-14 rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                Join the Pool
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

    </main>
  )
}
