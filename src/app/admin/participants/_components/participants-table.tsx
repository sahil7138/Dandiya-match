"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Search,
  Trash2,
  AlertTriangle,
  Loader2,
  X,
  Ticket,
  Users,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  ShieldCheck,
  Layers,
  Sparkles,
} from "lucide-react"
import { deleteParticipant, bulkDeleteParticipants } from "@/actions/admin-participants"
import { toast } from "sonner"
import type { ParticipantListItem } from "@/types"
import { getIndividualPasses, countTotalPasses, type IndividualPass } from "@/lib/passes"

interface ParticipantsTableProps {
  registrations: ParticipantListItem[]
}

type ViewMode = "BOOKINGS" | "PASSES"

export function ParticipantsTable({ registrations }: ParticipantsTableProps) {
  const router = useRouter()
  const [items, setItems] = useState<ParticipantListItem[]>(registrations)
  const [search, setSearch] = useState("")
  const [passFilter, setPassFilter] = useState<string>("ALL")
  const [paymentFilter, setPaymentFilter] = useState<string>("ALL")
  const [viewMode, setViewMode] = useState<ViewMode>("BOOKINGS")

  // Set of registration IDs that have their pass manifest expanded in bookings view
  const [expandedBookingIds, setExpandedBookingIds] = useState<Set<string>>(new Set())

  // Multi-selection state for bookings
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Modal states
  const [entryToDelete, setEntryToDelete] = useState<ParticipantListItem | null>(null)
  const [isSingleDeleting, setIsSingleDeleting] = useState(false)

  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)

  // Copy feedback state
  const [copiedPass, setCopiedPass] = useState<string | null>(null)

  // Keep items updated when server revalidates props
  useEffect(() => {
    setItems(registrations)
  }, [registrations])

  // Copy helper
  const handleCopyPass = (passNumber: string, attendeeName: string) => {
    navigator.clipboard.writeText(passNumber)
    setCopiedPass(passNumber)
    toast.success(`Copied pass ${passNumber} (${attendeeName})`)
    setTimeout(() => {
      setCopiedPass((prev) => (prev === passNumber ? null : prev))
    }, 2000)
  }

  // Toggle expanded passes for a booking
  const toggleBookingExpanded = (bookingId: string) => {
    setExpandedBookingIds((prev) => {
      const next = new Set(prev)
      if (next.has(bookingId)) {
        next.delete(bookingId)
      } else {
        next.add(bookingId)
      }
      return next
    })
  }

  // Filtered Bookings
  const filteredRegistrations = useMemo(() => {
    const q = search.toLowerCase().trim()
    return items.filter((reg) => {
      const passes = getIndividualPasses(reg)

      const matchesSearch =
        !q ||
        reg.user.name.toLowerCase().includes(q) ||
        reg.user.phone.includes(q) ||
        reg.gbnNumber.toLowerCase().includes(q) ||
        reg.user.instagramId?.toLowerCase().includes(q) ||
        reg.instagramId?.toLowerCase().includes(q) ||
        reg.partnerName?.toLowerCase().includes(q) ||
        reg.partnerPhone?.includes(q) ||
        passes.some(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.passNumber.toLowerCase().includes(q) ||
            (p.phone && p.phone.includes(q))
        )

      const matchesPass = passFilter === "ALL" || reg.passType === passFilter
      const matchesPayment = paymentFilter === "ALL" || reg.paymentStatus === paymentFilter

      return matchesSearch && matchesPass && matchesPayment
    })
  }, [items, search, passFilter, paymentFilter])

  // Flattened Individual Passes for "All Passes" View
  const filteredIndividualPasses = useMemo(() => {
    const q = search.toLowerCase().trim()
    const allPasses: (IndividualPass & { registration: ParticipantListItem })[] = []

    filteredRegistrations.forEach((reg) => {
      const passes = getIndividualPasses(reg)
      passes.forEach((p) => {
        allPasses.push({
          ...p,
          registration: reg,
        })
      })
    })

    if (!q) return allPasses

    return allPasses.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.passNumber.toLowerCase().includes(q) ||
        (p.phone && p.phone.includes(q)) ||
        p.bookingGbn.toLowerCase().includes(q) ||
        p.registration.user.name.toLowerCase().includes(q) ||
        p.role.toLowerCase().includes(q)
    )
  }, [filteredRegistrations, search])

  // Overall Statistics across items
  const stats = useMemo(() => {
    const totalBookings = items.length
    const totalPasses = countTotalPasses(items)
    const verifiedPasses = items.reduce((sum, r) => {
      if (r.paymentStatus === "VERIFIED") {
        return sum + (r.passType === "SINGLE" ? 1 : r.passType === "COUPLE" ? 2 : r.passType === "GROUP" ? 4 : 10)
      }
      return sum
    }, 0)
    const pendingPasses = items.reduce((sum, r) => {
      if (r.paymentStatus === "PENDING") {
        return sum + (r.passType === "SINGLE" ? 1 : r.passType === "COUPLE" ? 2 : r.passType === "GROUP" ? 4 : 10)
      }
      return sum
    }, 0)

    const soloCount = items.filter((r) => r.passType === "SINGLE").length
    const coupleCount = items.filter((r) => r.passType === "COUPLE").length
    const groupCount = items.filter((r) => r.passType === "GROUP").length
    const gangCount = items.filter((r) => r.passType === "GANG").length

    return {
      totalBookings,
      totalPasses,
      verifiedPasses,
      pendingPasses,
      soloCount,
      coupleCount,
      groupCount,
      gangCount,
    }
  }, [items])

  // Selection helpers
  const allFilteredSelected =
    filteredRegistrations.length > 0 &&
    filteredRegistrations.every((r) => selectedIds.includes(r.id))

  const handleToggleSelectAll = (checked: boolean) => {
    if (!checked) {
      const filteredIds = new Set(filteredRegistrations.map((r) => r.id))
      setSelectedIds((prev) => prev.filter((id) => !filteredIds.has(id)))
    } else {
      const newSelected = new Set(selectedIds)
      filteredRegistrations.forEach((r) => newSelected.add(r.id))
      setSelectedIds(Array.from(newSelected))
    }
  }

  const handleToggleSelect = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => (prev.includes(id) ? prev : [...prev, id]))
    } else {
      setSelectedIds((prev) => prev.filter((item) => item !== id))
    }
  }

  // Single delete handler
  const handleConfirmSingleDelete = async () => {
    if (!entryToDelete) return
    setIsSingleDeleting(true)
    try {
      const res = await deleteParticipant(entryToDelete.id)
      if (res.success) {
        toast.success(res.message || "Participant entry deleted successfully.")
        setItems((prev) => prev.filter((r) => r.id !== entryToDelete.id))
        setSelectedIds((prev) => prev.filter((id) => id !== entryToDelete.id))
        setEntryToDelete(null)
        router.refresh()
      } else {
        toast.error(res.error || "Failed to delete participant entry.")
      }
    } catch (err: any) {
      toast.error(err?.message || "An unexpected error occurred.")
    } finally {
      setIsSingleDeleting(false)
    }
  }

  // Bulk delete handler
  const handleConfirmBulkDelete = async () => {
    if (selectedIds.length === 0) return
    setIsBulkDeleting(true)
    try {
      const countToDelete = selectedIds.length
      const res = await bulkDeleteParticipants(selectedIds)
      if (res.success) {
        toast.success(res.message || `${countToDelete} participant entries deleted.`)
        const deletedSet = new Set(selectedIds)
        setItems((prev) => prev.filter((r) => !deletedSet.has(r.id)))
        setSelectedIds([])
        setIsBulkDeleteOpen(false)
        router.refresh()
      } else {
        toast.error(res.error || "Failed to delete participant entries.")
      }
    } catch (err: any) {
      toast.error(err?.message || "An unexpected error occurred.")
    } finally {
      setIsBulkDeleting(false)
    }
  }

  const selectedItemsData = useMemo(() => {
    return items.filter((r) => selectedIds.includes(r.id))
  }, [items, selectedIds])

  return (
    <>
      {/* Top Pass Metrics & Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-card border border-border/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Attendees / Passes</span>
            <Ticket className="h-4 w-4 text-primary" />
          </div>
          <div className="text-2xl font-black font-outfit text-foreground mt-1">
            {stats.totalPasses}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Across {stats.totalBookings} total bookings
          </p>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Verified Passes</span>
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black font-outfit text-emerald-500 mt-1">
            {stats.verifiedPasses}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Wristbands ready for issue
          </p>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Pending Verification</span>
            <Users className="h-4 w-4 text-yellow-500" />
          </div>
          <div className="text-2xl font-black font-outfit text-yellow-500 mt-1">
            {stats.pendingPasses}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Awaiting payment check
          </p>
        </div>

        <div className="p-4 rounded-xl bg-card border border-border/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Tier Breakdown</span>
            <Layers className="h-4 w-4 text-primary" />
          </div>
          <div className="flex flex-wrap gap-1.5 mt-2 text-[10px]">
            <span className="px-1.5 py-0.5 rounded bg-muted font-medium text-muted-foreground">
              Solo: {stats.soloCount}
            </span>
            <span className="px-1.5 py-0.5 rounded bg-muted font-medium text-muted-foreground">
              Duo: {stats.coupleCount} (×2)
            </span>
            <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-bold">
              Squad: {stats.groupCount} (×4)
            </span>
            {stats.gangCount > 0 && (
              <span className="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-400 font-bold">
                Gang: {stats.gangCount} (×10)
              </span>
            )}
          </div>
        </div>
      </div>

      <Card className="border-border">
        <CardHeader className="border-b bg-muted/10 pb-4 space-y-3">
          {/* View Mode Switcher + Search + Filters */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
            {/* View Mode Toggle */}
            <div className="inline-flex p-1 bg-muted/40 border border-border/60 rounded-xl shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("BOOKINGS")}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  viewMode === "BOOKINGS"
                    ? "bg-card text-foreground shadow-sm border border-border/80"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                <Users className="h-3.5 w-3.5 text-primary" />
                Group Bookings ({filteredRegistrations.length})
              </button>
              <button
                type="button"
                onClick={() => setViewMode("PASSES")}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  viewMode === "PASSES"
                    ? "bg-primary text-primary-foreground shadow-sm font-black"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                <Ticket className="h-3.5 w-3.5" />
                All Individual Passes ({filteredIndividualPasses.length})
              </button>
            </div>

            {/* Search Input */}
            <div className="flex items-center space-x-2 flex-1 max-w-md">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search member name, sub-pass (e.g. GBN-0001-B), mobile, or IG..."
                className="h-9 text-xs sm:text-sm"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <select
                value={passFilter}
                onChange={(e) => setPassFilter(e.target.value)}
                aria-label="Filter by pass type"
                className="h-9 px-3 text-xs bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="ALL">All Passes</option>
                <option value="SINGLE">Solo Pass (1)</option>
                <option value="COUPLE">Duo Pass (2)</option>
                <option value="GROUP">Bling Squad (4)</option>
                <option value="GANG">Bling Gang (10)</option>
              </select>

              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                aria-label="Filter by payment status"
                className="h-9 px-3 text-xs bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="ALL">All Payments</option>
                <option value="VERIFIED">Verified</option>
                <option value="PENDING">Pending</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
          </div>

          {/* Bulk Selection Action Bar */}
          {selectedIds.length > 0 && (
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-red-500/10 border border-red-500/25 rounded-xl animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex items-center justify-center bg-red-500 text-white font-bold text-xs rounded-full px-2.5 py-0.5">
                  {selectedIds.length}
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {selectedIds.length === 1 ? "entry selected" : "entries selected"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedIds([])}
                  className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                >
                  Clear Selection
                </button>
                <button
                  type="button"
                  id="bulk-delete-btn"
                  onClick={() => setIsBulkDeleteOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-sm transition-colors cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete Selected ({selectedIds.length})
                </button>
              </div>
            </div>
          )}
        </CardHeader>

        {/* VIEW 1: GROUP BOOKINGS VIEW */}
        {viewMode === "BOOKINGS" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-muted/30 uppercase border-b">
                <tr>
                  <th className="w-12 px-4 py-4 text-center">
                    <input
                      type="checkbox"
                      id="select-all-checkbox"
                      checked={allFilteredSelected}
                      onChange={(e) => handleToggleSelectAll(e.target.checked)}
                      title={allFilteredSelected ? "Deselect all" : "Select all"}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary accent-primary cursor-pointer"
                    />
                  </th>
                  <th className="px-6 py-4 font-semibold">Booking Lead &amp; Members</th>
                  <th className="px-6 py-4 font-semibold">GBN Pass &amp; Breakdown</th>
                  <th className="px-6 py-4 font-semibold">Tier</th>
                  <th className="px-6 py-4 font-semibold">Payment</th>
                  <th className="px-6 py-4 font-semibold">Matchmaking</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredRegistrations.map((reg) => {
                  const isSelected = selectedIds.includes(reg.id)
                  const isExpanded = expandedBookingIds.has(reg.id)
                  const individualPasses = getIndividualPasses(reg)
                  const isMultiPass = reg.passType !== "SINGLE"
                  const totalMembers = individualPasses.length

                  return (
                    <tr
                      key={reg.id}
                      className={`transition-colors ${
                        isSelected
                          ? "bg-red-500/5 hover:bg-red-500/10"
                          : isExpanded
                          ? "bg-primary/5 hover:bg-primary/10"
                          : "bg-card hover:bg-muted/10"
                      }`}
                    >
                      <td className="w-12 px-4 py-4 text-center align-top">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleToggleSelect(reg.id, e.target.checked)}
                          className="h-4 w-4 rounded border-border text-primary focus:ring-primary accent-primary cursor-pointer mt-1"
                          title={isSelected ? "Deselect" : "Select"}
                        />
                      </td>

                      <td className="px-6 py-4 align-top">
                        <div className="font-semibold text-foreground flex items-center gap-1.5">
                          {reg.user.name}
                          {isMultiPass && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-bold">
                              Lead
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">+91 {reg.user.phone}</div>

                        {(reg.user.instagramId || reg.instagramId) && (
                          <div className="text-[11px] text-[#e1306c] font-mono mt-0.5 font-medium">
                            @{((reg.user.instagramId || reg.instagramId) as string).replace(/^@+/, "")}
                          </div>
                        )}

                        {/* Group Member Count Indicator */}
                        {isMultiPass && (
                          <div className="mt-2 flex items-center gap-1.5">
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md border border-primary/20">
                              <Users className="h-3 w-3" />
                              {totalMembers} Total Attendees
                            </span>
                            <button
                              type="button"
                              onClick={() => toggleBookingExpanded(reg.id)}
                              className="text-[11px] text-muted-foreground hover:text-foreground font-medium underline cursor-pointer flex items-center gap-0.5"
                            >
                              {isExpanded ? "Hide Manifest" : "View Passes"}
                              {isExpanded ? (
                                <ChevronUp className="h-3 w-3" />
                              ) : (
                                <ChevronDown className="h-3 w-3" />
                              )}
                            </button>
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 align-top">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-bold text-primary">
                            {reg.gbnNumber}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyPass(reg.gbnNumber, reg.user.name)}
                            title="Copy base pass"
                            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          >
                            {copiedPass === reg.gbnNumber ? (
                              <Check className="h-3 w-3 text-emerald-500" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </button>
                        </div>

                        {/* Suffix Pill Breakdown for Groups/Couples */}
                        {isMultiPass ? (
                          <div className="mt-1.5">
                            <div className="flex flex-wrap gap-1">
                              {individualPasses.map((p) => {
                                const suffix = p.passNumber.replace(reg.gbnNumber, "").replace(/^-/, "")
                                return (
                                  <span
                                    key={p.passNumber}
                                    title={`${p.name} (${p.passNumber})`}
                                    className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-muted text-foreground border border-border/80"
                                  >
                                    {suffix || p.memberIndex}
                                  </span>
                                )
                              })}
                            </div>
                            <button
                              type="button"
                              onClick={() => toggleBookingExpanded(reg.id)}
                              className="text-[10px] text-primary hover:underline mt-1 block cursor-pointer"
                            >
                              {isExpanded ? "▲ Collapse passes" : `▼ Show all ${totalMembers} member passes`}
                            </button>
                          </div>
                        ) : (
                          reg.coordinatorPhone && (
                            <div className="text-[10px] text-muted-foreground font-mono mt-0.5">
                              Coord: +91 {reg.coordinatorPhone}
                            </div>
                          )
                        )}
                      </td>

                      <td className="px-6 py-4 align-top">
                        <Badge variant="outline" className="font-semibold">
                          {reg.passType}
                          {isMultiPass && ` (${totalMembers})`}
                        </Badge>
                      </td>

                      <td className="px-6 py-4 align-top">
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

                      <td className="px-6 py-4 align-top">
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

                      <td className="px-6 py-4 text-right align-top">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/participants/${reg.id}`}
                            className="text-primary hover:underline text-xs font-medium px-2 py-1"
                          >
                            View Detail
                          </Link>
                          <button
                            type="button"
                            id={`delete-entry-${reg.id}`}
                            onClick={() => setEntryToDelete(reg)}
                            title={`Delete ${reg.user.name}`}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}

                {/* Sub-rows for expanded bookings */}
                {filteredRegistrations.map((reg) => {
                  if (!expandedBookingIds.has(reg.id)) return null
                  const individualPasses = getIndividualPasses(reg)

                  return (
                    <tr key={`expanded-${reg.id}`} className="bg-muted/20 border-b">
                      <td colSpan={7} className="p-4 sm:p-5">
                        <div className="p-4 rounded-xl bg-card border border-primary/20 shadow-sm space-y-3">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-2.5">
                            <div className="flex items-center gap-2">
                              <Ticket className="h-4 w-4 text-primary" />
                              <span className="text-xs font-bold text-foreground">
                                Individual Member Passes for Booking {reg.gbnNumber} ({reg.passType})
                              </span>
                              <Badge variant="outline" className="text-[10px] font-semibold">
                                {individualPasses.length} Passes Issued
                              </Badge>
                            </div>
                            <span className="text-[11px] text-muted-foreground">
                              Lead: <strong className="text-foreground">{reg.user.name}</strong> • +91 {reg.user.phone}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                            {individualPasses.map((p) => {
                              const isThisCopied = copiedPass === p.passNumber
                              return (
                                <div
                                  key={p.passNumber}
                                  className="p-3 rounded-lg bg-muted/40 border border-border/80 flex flex-col justify-between space-y-2 hover:border-primary/40 transition-colors"
                                >
                                  <div className="flex items-start justify-between gap-1">
                                    <div>
                                      <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                                        {p.role}
                                      </span>
                                      <p className="text-xs font-bold text-foreground truncate mt-0.5">
                                        {p.name}
                                      </p>
                                    </div>
                                    {p.isLead && (
                                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-primary/20 text-primary font-bold shrink-0">
                                        Lead
                                      </span>
                                    )}
                                  </div>

                                  <div className="flex items-center justify-between pt-1 border-t border-border/40">
                                    <span className="font-mono text-xs font-black text-primary">
                                      {p.passNumber}
                                    </span>
                                    <button
                                      type="button"
                                      onClick={() => handleCopyPass(p.passNumber, p.name)}
                                      className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors cursor-pointer text-[10px] flex items-center gap-1"
                                      title={`Copy ${p.passNumber}`}
                                    >
                                      {isThisCopied ? (
                                        <>
                                          <Check className="h-3 w-3 text-emerald-500" />
                                          <span className="text-emerald-500">Copied</span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="h-3 w-3" />
                                          <span>Copy</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )
                })}

                {filteredRegistrations.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-muted-foreground">
                      {items.length === 0
                        ? "No participants registered yet."
                        : "No participants match your search criteria."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* VIEW 2: ALL INDIVIDUAL PASSES VIEW (MANIFEST VIEW) */}
        {viewMode === "PASSES" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-muted/30 uppercase border-b font-mono">
                <tr>
                  <th className="w-12 px-4 py-4 text-center">#</th>
                  <th className="px-6 py-4 font-semibold">Individual Pass No</th>
                  <th className="px-6 py-4 font-semibold">Attendee Name</th>
                  <th className="px-6 py-4 font-semibold">Role / Member Status</th>
                  <th className="px-6 py-4 font-semibold">Contact Phone</th>
                  <th className="px-6 py-4 font-semibold">Parent Booking</th>
                  <th className="px-6 py-4 font-semibold">Payment Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredIndividualPasses.map((p, index) => {
                  const isThisCopied = copiedPass === p.passNumber
                  return (
                    <tr
                      key={p.passNumber}
                      className="bg-card hover:bg-muted/10 transition-colors"
                    >
                      <td className="w-12 px-4 py-4 text-center text-xs text-muted-foreground font-mono">
                        {index + 1}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-black text-primary bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20">
                            {p.passNumber}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopyPass(p.passNumber, p.name)}
                            title="Copy pass"
                            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                          >
                            {isThisCopied ? (
                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                            ) : (
                              <Copy className="h-3.5 w-3.5" />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-semibold text-foreground flex items-center gap-1.5">
                          {p.name}
                          {p.isLead && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-bold">
                              Lead
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <Badge variant="outline" className="text-xs">
                          {p.role}
                        </Badge>
                      </td>

                      <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                        {p.phone ? `+91 ${p.phone}` : `Via Lead (+91 ${p.registration.user.phone})`}
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-xs">
                          <span className="font-semibold text-foreground">
                            {p.registration.user.name}
                          </span>
                          <span className="font-mono text-muted-foreground ml-1.5">
                            ({p.bookingGbn})
                          </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground">
                          {p.passType} Pass
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <Badge
                          variant={
                            p.paymentStatus === "VERIFIED"
                              ? "default"
                              : p.paymentStatus === "REJECTED"
                              ? "destructive"
                              : "secondary"
                          }
                          className={
                            p.paymentStatus === "VERIFIED"
                              ? "bg-green-600 hover:bg-green-700 text-white"
                              : ""
                          }
                        >
                          {p.paymentStatus}
                        </Badge>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/participants/${p.registrationId}`}
                            className="text-primary hover:underline text-xs font-medium px-2 py-1"
                          >
                            View Booking
                          </Link>
                          <button
                            type="button"
                            onClick={() => setEntryToDelete(p.registration)}
                            title={`Delete booking for ${p.registration.user.name}`}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}

                {filteredIndividualPasses.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-muted-foreground">
                      No individual passes match your search criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Rock-solid Single Entry Delete Modal */}
      {entryToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0 text-red-500">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">Delete Participant Entry</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Confirm permanent removal of attendee record
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEntryToDelete(null)}
                className="text-muted-foreground hover:text-foreground rounded-lg p-1 hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Details Box */}
            <div className="p-3.5 rounded-xl bg-muted/40 border border-border/80 text-sm space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Booking Lead:</span>
                <span className="font-semibold text-foreground">{entryToDelete.user.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mobile:</span>
                <span className="font-mono text-xs">+91 {entryToDelete.user.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Base GBN Pass:</span>
                <span className="font-mono font-bold text-primary">{entryToDelete.gbnNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pass Tier &amp; Total Passes:</span>
                <span className="text-xs font-semibold">
                  {entryToDelete.passType} ({getIndividualPasses(entryToDelete).length} Passes)
                </span>
              </div>
            </div>

            {/* Warning Message */}
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 leading-relaxed">
              ⚠️ <strong>Warning:</strong> This will permanently delete this booking, all {getIndividualPasses(entryToDelete).length} associated individual member passes, payment verification records, and matchmaking allocations. This action cannot be undone.
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                id="cancel-delete-btn"
                onClick={() => setEntryToDelete(null)}
                disabled={isSingleDeleting}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-input hover:bg-muted/50 text-foreground transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-delete-btn"
                onClick={handleConfirmSingleDelete}
                disabled={isSingleDeleting}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSingleDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                {isSingleDeleting ? "Deleting..." : "Permanently Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Rock-solid Bulk Delete Modal */}
      {isBulkDeleteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0 text-red-500">
                  <AlertTriangle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    Delete {selectedIds.length} Participant Entries
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Confirm bulk permanent removal of attendee records
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBulkDeleteOpen(false)}
                className="text-muted-foreground hover:text-foreground rounded-lg p-1 hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              You are about to delete the following {selectedIds.length} participant bookings and their member passes:
            </p>

            {/* List of items */}
            <div className="max-h-48 overflow-y-auto space-y-1.5 p-2.5 rounded-xl bg-muted/40 border border-border/80 divide-y divide-border/40">
              {selectedItemsData.map((item) => {
                const count = getIndividualPasses(item).length
                return (
                  <div key={item.id} className="pt-1.5 first:pt-0 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-foreground">{item.user.name}</span>
                      <span className="text-muted-foreground ml-2 font-mono">(+91 {item.user.phone})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted-foreground">({count} passes)</span>
                      <span className="font-mono font-bold text-primary">{item.gbnNumber}</span>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Warning Message */}
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 leading-relaxed">
              ⚠️ <strong>Warning:</strong> This will permanently erase all registrations, member passes, payment records, and matchmaking allocations for all {selectedIds.length} selected participant bookings. This action cannot be undone.
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                id="cancel-bulk-delete-btn"
                onClick={() => setIsBulkDeleteOpen(false)}
                disabled={isBulkDeleting}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-input hover:bg-muted/50 text-foreground transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                id="confirm-bulk-delete-btn"
                onClick={handleConfirmBulkDelete}
                disabled={isBulkDeleting}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                {isBulkDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                {isBulkDeleting
                  ? "Deleting..."
                  : `Delete All ${selectedIds.length} Bookings`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
