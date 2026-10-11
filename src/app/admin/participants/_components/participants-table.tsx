"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Card, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Filter, ArrowUpDown } from "lucide-react"
import type { ParticipantListItem } from "@/types"

interface ParticipantsTableProps {
  registrations: ParticipantListItem[]
}

export function ParticipantsTable({ registrations }: ParticipantsTableProps) {
  const [search, setSearch] = useState("")
  const [passFilter, setPassFilter] = useState<string>("ALL")
  const [paymentFilter, setPaymentFilter] = useState<string>("ALL")

  const filteredRegistrations = useMemo(() => {
    return registrations.filter((reg) => {
      const q = search.toLowerCase().trim()
      const matchesSearch =
        !q ||
        reg.user.name.toLowerCase().includes(q) ||
        reg.user.phone.includes(q) ||
        reg.gbnNumber.toLowerCase().includes(q)

      const matchesPass = passFilter === "ALL" || reg.passType === passFilter
      const matchesPayment = paymentFilter === "ALL" || reg.paymentStatus === paymentFilter

      return matchesSearch && matchesPass && matchesPayment
    })
  }, [registrations, search, passFilter, paymentFilter])

  return (
    <Card className="border-border">
      <CardHeader className="border-b bg-muted/10 pb-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2 flex-1 max-w-md">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, phone, or GBN pass..."
              className="h-9 text-sm"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={passFilter}
              onChange={(e) => setPassFilter(e.target.value)}
              aria-label="Filter by pass type"
              className="h-9 px-3 text-xs bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="ALL">All Passes</option>
              <option value="SINGLE">Solo Pass</option>
              <option value="COUPLE">Duo Pass</option>
              <option value="GROUP">Bling Squad</option>
              <option value="GANG">Bling Gang</option>
            </select>

            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              aria-label="Filter by payment status"
              className="h-9 px-3 text-xs bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="ALL">All Payments</option>
              <option value="VERIFIED">Verified</option>
              <option value="PENDING">Pending</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </CardHeader>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground bg-muted/30 uppercase border-b">
            <tr>
              <th className="px-6 py-4 font-semibold">Participant</th>
              <th className="px-6 py-4 font-semibold">GBN Pass</th>
              <th className="px-6 py-4 font-semibold">Tier</th>
              <th className="px-6 py-4 font-semibold">Payment</th>
              <th className="px-6 py-4 font-semibold">Matchmaking</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredRegistrations.map((reg) => (
              <tr key={reg.id} className="bg-card hover:bg-muted/10 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-semibold text-foreground">{reg.user.name}</div>
                  <div className="text-xs text-muted-foreground font-mono">+91 {reg.user.phone}</div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-mono text-xs font-bold text-primary">
                    {reg.gbnNumber}
                  </div>
                  {reg.coordinatorPhone && (
                    <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                      Coord: +91 {reg.coordinatorPhone}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <Badge variant="outline">{reg.passType}</Badge>
                </td>
                <td className="px-6 py-4">
                  <Badge
                    variant={
                      reg.paymentStatus === "VERIFIED"
                        ? "default"
                        : reg.paymentStatus === "REJECTED"
                        ? "destructive"
                        : "secondary"
                    }
                    className={
                      reg.paymentStatus === "VERIFIED"
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : ""
                    }
                  >
                    {reg.paymentStatus}
                  </Badge>
                </td>
                <td className="px-6 py-4">
                  {reg.passType === "SINGLE" ? (
                    <Badge
                      variant="outline"
                      className={reg.matchmakingOptIn ? "border-primary text-primary" : ""}
                    >
                      {reg.matchmakingOptIn ? "OPTED IN" : "OPTED OUT"}
                    </Badge>
                  ) : (
                    <span className="text-xs text-muted-foreground">Not Eligible</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/admin/participants/${reg.id}`}
                    className="text-primary hover:underline text-sm font-medium"
                  >
                    View Detail
                  </Link>
                </td>
              </tr>
            ))}
            {filteredRegistrations.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                  {registrations.length === 0
                    ? "No participants registered yet."
                    : "No participants match your search criteria."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
