// app/loading.tsx
import { Skeleton } from "./ui/skeleton"

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-7xl animate-pulse space-y-8">
      {/* Page Title */}
      <div className="h-8 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sidebar Section */}
        <div className="space-y-4">
          <Skeleton className="h-40 w-full rounded-lg" />
          <Skeleton className="h-60 w-full rounded-lg" />
        </div>

        {/* Main Content Section */}
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-72 w-full rounded-lg" />
          <Skeleton className="h-20 w-3/4 rounded-lg" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-32 w-full rounded-lg" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}
