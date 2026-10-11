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
  CheckCircle,
} from "lucide-react"
import { deleteParticipant, bulkDeleteParticipants } from "@/actions/admin-participants"
import { toast } from "sonner"
import type { ParticipantListItem } from "@/types"

interface ParticipantsTableProps {
  registrations: ParticipantListItem[]
}

export function ParticipantsTable({ registrations }: ParticipantsTableProps) {
  const router = useRouter()
  const [items, setItems] = useState<ParticipantListItem[]>(registrations)
  const [search, setSearch] = useState("")
  const [passFilter, setPassFilter] = useState<string>("ALL")
  const [paymentFilter, setPaymentFilter] = useState<string>("ALL")

  // Keep items updated when server revalidates props
  useEffect(() => {
    setItems(registrations)
  }, [registrations])

  // Multi-selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Modal states
  const [entryToDelete, setEntryToDelete] = useState<ParticipantListItem | null>(null)
  const [isSingleDeleting, setIsSingleDeleting] = useState(false)

  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)

  const filteredRegistrations = useMemo(() => {
    return items.filter((reg) => {
      const q = search.toLowerCase().trim()
      const matchesSearch =
        !q ||
        reg.user.name.toLowerCase().includes(q) ||
        reg.user.phone.includes(q) ||
        reg.gbnNumber.toLowerCase().includes(q) ||
        reg.user.instagramId?.toLowerCase().includes(q) ||
        reg.instagramId?.toLowerCase().includes(q)

      const matchesPass = passFilter === "ALL" || reg.passType === passFilter
      const matchesPayment = paymentFilter === "ALL" || reg.paymentStatus === paymentFilter

      return matchesSearch && matchesPass && matchesPayment
    })
  }, [items, search, passFilter, paymentFilter])

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
      <Card className="border-border">
        <CardHeader className="border-b bg-muted/10 pb-4 space-y-3">
          {/* Top Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2 flex-1 max-w-md">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, phone, IG handle, or GBN pass..."
                className="h-9 text-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={passFilter}
                onChange={(e) => setPassFilter(e.target.value)}
                aria-label="Filter by pass type"
                className="h-9 px-3 text-xs bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
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
                <th className="px-6 py-4 font-semibold">Participant</th>
                <th className="px-6 py-4 font-semibold">GBN Pass</th>
                <th className="px-6 py-4 font-semibold">Tier</th>
                <th className="px-6 py-4 font-semibold">Payment</th>
                <th className="px-6 py-4 font-semibold">Matchmaking</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredRegistrations.map((reg) => {
                const isSelected = selectedIds.includes(reg.id)
                return (
                  <tr
                    key={reg.id}
                    className={`transition-colors ${
                      isSelected ? "bg-red-500/5 hover:bg-red-500/10" : "bg-card hover:bg-muted/10"
                    }`}
                  >
                    <td className="w-12 px-4 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => handleToggleSelect(reg.id, e.target.checked)}
                        className="h-4 w-4 rounded border-border text-primary focus:ring-primary accent-primary cursor-pointer"
                        title={isSelected ? "Deselect" : "Select"}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-semibold text-foreground">{reg.user.name}</div>
                      <div className="text-xs text-muted-foreground font-mono">+91 {reg.user.phone}</div>
                      {(reg.user.instagramId || reg.instagramId) && (
                        <div className="text-[11px] text-[#e1306c] font-mono mt-0.5 font-medium">
                          @{((reg.user.instagramId || reg.instagramId) as string).replace(/^@+/, "")}
                        </div>
                      )}
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
                <span className="text-muted-foreground">Participant:</span>
                <span className="font-semibold text-foreground">{entryToDelete.user.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mobile:</span>
                <span className="font-mono text-xs">+91 {entryToDelete.user.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">GBN Pass:</span>
                <span className="font-mono font-bold text-primary">{entryToDelete.gbnNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Pass Tier:</span>
                <span className="text-xs font-semibold">{entryToDelete.passType}</span>
              </div>
            </div>

            {/* Warning Message */}
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 leading-relaxed">
              ⚠️ <strong>Warning:</strong> This will permanently delete this participant&apos;s registration pass, payment verification records, and matchmaking profile. This action cannot be undone.
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
              You are about to delete the following {selectedIds.length} participant entries:
            </p>

            {/* List of items */}
            <div className="max-h-48 overflow-y-auto space-y-1.5 p-2.5 rounded-xl bg-muted/40 border border-border/80 divide-y divide-border/40">
              {selectedItemsData.map((item) => (
                <div key={item.id} className="pt-1.5 first:pt-0 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-foreground">{item.user.name}</span>
                    <span className="text-muted-foreground ml-2 font-mono">(+91 {item.user.phone})</span>
                  </div>
                  <span className="font-mono font-bold text-primary">{item.gbnNumber}</span>
                </div>
              ))}
            </div>

            {/* Warning Message */}
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-300 leading-relaxed">
              ⚠️ <strong>Warning:</strong> This will permanently erase all registrations, payment records, and matchmaking allocations for all {selectedIds.length} selected participants. This action cannot be undone.
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
                  : `Delete All ${selectedIds.length} Entries`}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
