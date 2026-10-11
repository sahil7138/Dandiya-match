import { Loader2 } from "lucide-react"

export default function AdminLoading() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-pulse">
      {/* Header skeleton */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-white/10 rounded-lg" />
          <div className="h-4 w-72 bg-white/5 rounded-md" />
        </div>
        <div className="h-8 w-40 bg-white/5 rounded-full" />
      </div>

      {/* Action buttons skeleton */}
      <div className="flex flex-wrap gap-3">
        <div className="h-9 w-36 bg-white/10 rounded-lg" />
        <div className="h-9 w-32 bg-white/10 rounded-lg" />
        <div className="h-9 w-32 bg-white/10 rounded-lg" />
        <div className="h-9 w-28 bg-white/10 rounded-lg" />
        <div className="h-9 w-28 bg-white/10 rounded-lg" />
      </div>

      {/* Metrics skeleton cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="p-5 rounded-2xl bg-card border border-white/5 space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-4 w-28 bg-white/10 rounded" />
              <div className="h-4 w-4 bg-white/10 rounded" />
            </div>
            <div className="h-8 w-16 bg-white/15 rounded" />
          </div>
        ))}
      </div>

      {/* Loading banner */}
      <div className="p-8 rounded-2xl bg-card border border-white/5 flex items-center justify-center gap-3 text-muted-foreground text-sm">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
        <span>Loading latest admin data...</span>
      </div>
    </div>
  )
}
