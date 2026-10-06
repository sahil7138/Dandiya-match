"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"

export function EventCountdown() {
  const [timeLeft, setTimeLeft] = useState<{
    days: string
    hours: string
    minutes: string
    seconds: string
  }>({
    days: "00",
    hours: "00",
    minutes: "00",
    seconds: "00",
  })

  useEffect(() => {
    // Event date: October 17, 2026 at 19:00:00 IST
    const targetDate = new Date("2026-10-17T19:00:00+05:30").getTime()

    const updateCountdown = () => {
      const now = new Date().getTime()
      const difference = targetDate - now

      if (difference <= 0) {
        setTimeLeft({ days: "00", hours: "00", minutes: "00", seconds: "00" })
        return
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      setTimeLeft({
        days: days.toString().padStart(2, "0"),
        hours: hours.toString().padStart(2, "0"),
        minutes: minutes.toString().padStart(2, "0"),
        seconds: seconds.toString().padStart(2, "0"),
      })
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [])

  const items = [
    { label: "DAYS", value: timeLeft.days },
    { label: "HOURS", value: timeLeft.hours },
    { label: "MINS", value: timeLeft.minutes },
    { label: "SECS", value: timeLeft.seconds },
  ]

  return (
    <div className="glass-card rounded-2xl p-4 sm:p-6 border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] max-w-xl mx-auto backdrop-blur-xl">
      <div className="flex items-center justify-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
        <span className="text-xs font-bold uppercase tracking-widest text-[#ffb800] flex items-center gap-1 font-mono">
          <Sparkles className="w-3.5 h-3.5" /> COUNTDOWN TO THE BLING NIGHT
        </span>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:gap-3">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center justify-center bg-black/40 border border-white/5 rounded-xl py-3 px-2 sm:px-4"
          >
            <span className="text-2xl sm:text-4xl font-black font-outfit text-white tracking-tight">
              {item.value}
            </span>
            <span className="text-[10px] sm:text-xs font-semibold tracking-widest text-zinc-400 mt-0.5">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
