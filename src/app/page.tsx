"use client"

import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center overflow-x-hidden pt-12 pb-24 px-4">
      <div className="absolute inset-0 -z-10 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
      
      {/* Hero Section */}
      <motion.section 
        className="w-full max-w-4xl flex flex-col items-center text-center mt-12 md:mt-24 space-y-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-medium mb-4">
          ✨ GenZ Bling Navratri 2026
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight font-outfit text-foreground">
          DANDIYA <span className="text-primary">MATCH</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground font-light max-w-2xl">
          One Night. One Random Partner. <br className="hidden md:block"/> One Dandiya Memory.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 w-full justify-center">
          <Link href="/register" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto text-lg px-8 rounded-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground shadow-[0_0_20px_rgba(255,183,3,0.3)]">
              JOIN THE EXPERIENCE
            </Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-lg px-8 rounded-full h-14 border-primary/50 hover:bg-primary/10">
              PARTICIPANT LOGIN
            </Button>
          </Link>
        </div>
      </motion.section>

      {/* How It Works */}
      <motion.section 
        className="w-full max-w-4xl mt-32"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
      >
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 font-outfit">HOW IT WORKS</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: "01", title: "REGISTER", desc: "Secure your pass for the event." },
            { step: "02", title: "OPT IN", desc: "Choose to enter the random Dandiya partner pool (Single pass only)." },
            { step: "03", title: "GET MATCHED", desc: "Our system assigns you a random partner behind the scenes." },
            { step: "04", title: "WAIT FOR IT", desc: "Matches remain locked until exactly 24 hours before." },
            { step: "05", title: "THE REVEAL", desc: "Check your dashboard when the countdown hits zero." },
            { step: "06", title: "MEET UP", desc: "Find your partner at the venue and slay!" },
          ].map((item, i) => (
            <motion.div 
              key={i}
              className="bg-card p-6 rounded-2xl border border-border shadow-sm flex flex-col gap-3 relative overflow-hidden"
              whileHover={{ y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="text-4xl font-black text-muted/50 absolute -right-2 -bottom-4 z-0 pointer-events-none">
                {item.step}
              </div>
              <h3 className="text-xl font-bold z-10 text-primary">{item.title}</h3>
              <p className="text-muted-foreground z-10">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>
      
      {/* Rules short */}
      <motion.section 
        className="w-full max-w-3xl mt-32 text-center bg-secondary/10 p-8 rounded-3xl border border-secondary/20"
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
      >
        <h2 className="text-2xl font-bold mb-6 font-outfit">WHO CAN JOIN THE POOL?</h2>
        <div className="flex flex-col gap-4 text-left mx-auto max-w-md">
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center shrink-0">✓</div>
            <span><strong className="text-foreground">Single Ticket:</strong> Eligible for Random Match</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center shrink-0">✕</div>
            <span className="text-muted-foreground"><strong>Couple Entry:</strong> Random Match unavailable</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-6 w-6 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center shrink-0">✕</div>
            <span className="text-muted-foreground"><strong>Group Entry:</strong> Random Match unavailable</span>
          </div>
        </div>
        <div className="mt-8">
          <Link href="/rules" className="text-primary hover:underline text-sm font-medium">
            Read all matchmaking rules →
          </Link>
        </div>
      </motion.section>
      
    </main>
  )
}
