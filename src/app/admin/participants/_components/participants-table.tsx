"use client"

import { useState, useMemo, useEffect, Fragment } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Card, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
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
} from "lucide-react"
import { deleteParticipant, bulkDeleteParticipants } from "@/actions/admin-participants"
import { toast } from "sonner"
import type { ParticipantListItem } from "@/types"
import { getIndividualPasses, countTotalPasses, type IndividualPass } from "@/lib/passes"

interface ParticipantsTableProps {
  registrations: ParticipantListItem[]
}

type ViewMode = "PASSES" | "BOOKINGS"

export function ParticipantsTable({ registrations }: ParticipantsTableProps) {
  const router = useRouter()
  const [items, setItems] = useState<ParticipantListItem[]>(registrations)
  const [search, setSearch] = useState("")
  const [passFilter, setPassFilter] = useState<string>("ALL")
  const [paymentFilter, setPaymentFilter] = useState<string>("ALL")

  // Default to showing all individual passes so every member is immediately visible!
  const [viewMode, setViewMode] = useState<ViewMode>("PASSES")

  // Expanded registration rows in Bookings mode
  const [expandedBookingIds, setExpandedBookingIds] = useState<Set<string>>(new Set())

  // Multi-selection state (tracks individual pass IDs or registration IDs)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Modal states
  const [entryToDelete, setEntryToDelete] = useState<{
    id: string
    registrationId: string
    name: string
    passNumber: string
    phone: string
    passType: string
    isLead: boolean
  } | null>(null)
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

  // Flattened Individual Passes (Every attendee gets their own row)
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
        p.leadName.toLowerCase().includes(q) ||
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
  const currentActiveItems = viewMode === "PASSES" ? filteredIndividualPasses : filteredRegistrations
  const allFilteredSelected =
    currentActiveItems.length > 0 &&
    currentActiveItems.every((item) => selectedIds.includes(item.id))

  const handleToggleSelectAll = (checked: boolean) => {
    if (!checked) {
      const currentIds = new Set(currentActiveItems.map((r) => r.id))
      setSelectedIds((prev) => prev.filter((id) => !currentIds.has(id)))
    } else {
      const newSelected = new Set(selectedIds)
      currentActiveItems.forEach((r) => newSelected.add(r.id))
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
      const res = await deleteParticipant(entryToDelete.registrationId)
      if (res.success) {
        toast.success(res.message || "Participant entry deleted successfully.")
        setItems((prev) => prev.filter((r) => r.id !== entryToDelete.registrationId))
        setSelectedIds((prev) => prev.filter((id) => id !== entryToDelete.id && id !== entryToDelete.registrationId))
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
      // Resolve distinct registration IDs
      const regIdSet = new Set<string>()
      selectedIds.forEach((selId) => {
        // If it's a registration ID directly
        const reg = items.find((r) => r.id === selId)
        if (reg) {
          regIdSet.add(reg.id)
        } else {
          // If it's a member pass ID (format `${regId}_m...` or similar)
          const pass = filteredIndividualPasses.find((p) => p.id === selId)
          if (pass) {
            regIdSet.add(pass.registrationId)
          }
        }
      })

      const targetRegIds = Array.from(regIdSet)
      const res = await bulkDeleteParticipants(targetRegIds)
      if (res.success) {
        toast.success(res.message || `${targetRegIds.length} participant bookings deleted.`)
        const deletedSet = new Set(targetRegIds)
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

  return (
    <>
      {/* Top Pass Metrics & Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="p-4 rounded-xl bg-card border border-border/80 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Total Participants / Passes</span>
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
            {/* View Mode Toggle: All Participants is Primary */}
            <div className="inline-flex p-1 bg-muted/40 border border-border/60 rounded-xl shrink-0">
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
            </div>

            {/* Search Input */}
            <div className="flex items-center space-x-2 flex-1 max-w-md">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search attendee name, distinct GBN pass (e.g. GBN-0006), mobile..."
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

        {/* VIEW 1 (PRIMARY): ALL INDIVIDUAL PASSES VIEW - EACH MEMBER HAS A SEPARATE ID & PASS */}
        {viewMode === "PASSES" && (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground bg-muted/30 uppercase border-b font-mono">
                <tr>
                  <th className="w-12 px-4 py-4 text-center">
                    <input
                      type="checkbox"
                      id="select-all-passes-checkbox"
                      checked={allFilteredSelected}
                      onChange={(e) => handleToggleSelectAll(e.target.checked)}
                      title={allFilteredSelected ? "Deselect all" : "Select all"}
                      className="h-4 w-4 rounded border-border text-primary focus:ring-primary accent-primary cursor-pointer"
                    />
                  </th>
                  <th className="px-5 py-4 font-semibold">Distinct Pass No</th>
                  <th className="px-6 py-4 font-semibold">Attendee Name</th>
                  <th className="px-6 py-4 font-semibold">Role / Pass Tier</th>
                  <th className="px-6 py-4 font-semibold">Mobile Contact</th>
                  <th className="px-6 py-4 font-semibold">Booking Reference / Lead</th>
                  <th className="px-6 py-4 font-semibold">Payment Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredIndividualPasses.map((p, index) => {
                  const isSelected = selectedIds.includes(p.id)
                  const isThisCopied = copiedPass === p.passNumber

                  return (
                    <tr
                      key={p.id}
                      className={`transition-colors ${
                        isSelected ? "bg-red-500/5 hover:bg-red-500/10" : "bg-card hover:bg-muted/10"
                      }`}
                    >
                      <td className="w-12 px-4 py-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => handleToggleSelect(p.id, e.target.checked)}
                          className="h-4 w-4 rounded border-border text-primary focus:ring-primary accent-primary cursor-pointer"
                          title={isSelected ? "Deselect" : "Select"}
                        />
                      </td>

                      <td className="px-5 py-4">
                        {p.paymentStatus === "VERIFIED" ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-black text-primary bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20 tracking-wider">
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
                        ) : p.paymentStatus === "REJECTED" ? (
                          <span className="text-[11px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20 whitespace-nowrap">
                            Payment Declined
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-yellow-400 bg-yellow-500/10 px-2 py-0.5 rounded border border-yellow-500/20 whitespace-nowrap">
                            Pending Verification
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-semibold text-foreground flex items-center gap-1.5">
                          {p.name}
                          {p.isLead ? (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary font-bold">
                              Lead
                            </span>
                          ) : (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">
                              Member {p.memberIndex}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <Badge variant="outline" className="text-xs font-medium">
                          {p.role}
                        </Badge>
                      </td>

                      <td className="px-6 py-4 font-mono text-xs text-muted-foreground">
                        {p.phone ? `+91 ${p.phone}` : `Via Lead (+91 ${p.leadPhone})`}
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-xs">
                          {p.isLead ? (
                            <span className="text-muted-foreground font-medium">Self (Primary Booking)</span>
                          ) : (
                            <div>
                              <span className="text-muted-foreground">Booked by </span>
                              <strong className="text-foreground">{p.leadName}</strong>
                              <span className="text-muted-foreground font-mono ml-1">({p.bookingGbn})</span>
                            </div>
                          )}
                        </div>
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
                            View Detail
                          </Link>
                          <button
                            type="button"
                            onClick={() =>
                              setEntryToDelete({
                                id: p.id,
                                registrationId: p.registrationId,
                                name: p.name,
                                passNumber: p.passNumber,
                                phone: p.phone || p.leadPhone,
                                passType: p.passType,
                                isLead: p.isLead,
                              })
                            }
                            title={`Delete entry for ${p.name}`}
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

        {/* VIEW 2: GROUP BOOKINGS VIEW */}
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
                  <th className="px-6 py-4 font-semibold">Passes Assigned</th>
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
                    <Fragment key={reg.id}>
                      <tr
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
                                {isExpanded ? "Hide Passes" : "View Passes"}
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
                          {reg.paymentStatus === "VERIFIED" ? (
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
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

                              {/* Show distinct passes for members */}
                              {isMultiPass && (
                                <div className="mt-1 flex flex-wrap gap-1 max-w-xs">
                                  {individualPasses.slice(1).map((p) => (
                                    <span
                                      key={p.passNumber}
                                      title={`${p.name} (${p.passNumber})`}
                                      className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-muted text-foreground border border-border/80"
                                    >
                                      {p.passNumber}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : reg.paymentStatus === "REJECTED" ? (
                            <span className="text-[11px] font-bold text-red-400 bg-red-500/10 px-2.5 py-1 rounded border border-red-500/20 whitespace-nowrap">
                              Payment Declined
                            </span>
                          ) : (
                            <div className="flex flex-col gap-1">
                              <span className="text-[11px] font-bold text-yellow-400 bg-yellow-500/10 px-2.5 py-1 rounded border border-yellow-500/20 w-fit whitespace-nowrap">
                                Pending Verification
                              </span>
                              <span className="text-[10px] text-muted-foreground font-mono">
                                Passes held until approval
                              </span>
                            </div>
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
                              onClick={() =>
                                setEntryToDelete({
                                  id: reg.id,
                                  registrationId: reg.id,
                                  name: reg.user.name,
                                  passNumber: reg.gbnNumber,
                                  phone: reg.user.phone,
                                  passType: reg.passType,
                                  isLead: true,
                                })
                              }
                              title={`Delete ${reg.user.name}`}
                              className="p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {/* Expanded row rendered IMMEDIATELY beneath the booking row */}
                      {isExpanded && (
                        <tr className="bg-muted/20 border-b">
                          <td colSpan={7} className="p-4 sm:p-5">
                            <div className="p-4 rounded-xl bg-card border border-primary/20 shadow-sm space-y-3">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-2.5">
                                <div className="flex items-center gap-2">
                                  <Ticket className="h-4 w-4 text-primary" />
                                  <span className="text-xs font-bold text-foreground">
                                    Member Passes for Booking {reg.gbnNumber} ({reg.passType})
                                  </span>
                                  <Badge variant="outline" className="text-[10px] font-semibold">
                                    {individualPasses.length} Distinct Passes
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
                                        {reg.paymentStatus === "VERIFIED" ? (
                                          <>
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
                                          </>
                                        ) : (
                                          <span className="text-[10px] font-semibold text-yellow-400">
                                            On Hold (Pending Payment)
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </Fragment>
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
                <span className="text-muted-foreground">Attendee Name:</span>
                <span className="font-semibold text-foreground">{entryToDelete.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pass Number:</span>
                <span className="font-mono font-bold text-primary">{entryToDelete.passNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pass Tier:</span>
                <span className="text-xs font-semibold">{entryToDelete.passType}</span>
              </div>
            </div>

            {/* Warning Message */}
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 leading-relaxed">
              ⚠️ <strong>Warning:</strong> This will permanently delete this participant&apos;s registration and associated member passes. This action cannot be undone.
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

      {/* Bulk Delete Modal */}
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
                    Delete {selectedIds.length} Selected Entries
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Confirm bulk removal of selected records
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
              You are about to delete {selectedIds.length} selected participant entries.
            </p>

            {/* Warning Message */}
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 leading-relaxed">
              ⚠️ <strong>Warning:</strong> This action cannot be undone. All registration data and payment verification records will be permanently removed.
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setIsBulkDeleteOpen(false)}
                disabled={isBulkDeleting}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-input hover:bg-muted/50 text-foreground transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmBulkDelete}
                disabled={isBulkDeleting}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white shadow-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                {isBulkDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
                {isBulkDeleting ? "Deleting..." : `Delete ${selectedIds.length} Entries`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
