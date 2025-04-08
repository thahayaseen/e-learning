"use client"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

interface CourseFiltersProps {
  filters: {
    status: string
    priceRange: string
    sortBy: string
  }
  setFilters: (filters: any) => void
  setIsFilterOpen: (isOpen: boolean) => void
}

export default function CourseFilters({ filters, setFilters, setIsFilterOpen }: CourseFiltersProps) {
  return (
    <div
      className="absolute right-0 top-full mt-2 w-72 bg-blue-900 border border-blue-700 rounded-md shadow-lg z-10 p-4"
      data-filter-dropdown
    >
      <div className="space-y-4">
        <div>
          <Label className="text-white mb-2 block">Status</Label>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant={filters.status === "all" ? "default" : "outline"}
              size="sm"
              className={filters.status === "all" ? "bg-blue-600" : "bg-blue-800 border-blue-700 text-blue-200"}
              onClick={() => setFilters({ ...filters, status: "all" })}
            >
              All
            </Button>
            <Button
              variant={filters.status === "approved" ? "default" : "outline"}
              size="sm"
              className={filters.status === "approved" ? "bg-blue-600" : "bg-blue-800 border-blue-700 text-blue-200"}
              onClick={() => setFilters({ ...filters, status: "approved" })}
            >
              Approved
            </Button>
            <Button
              variant={filters.status === "pending" ? "default" : "outline"}
              size="sm"
              className={filters.status === "pending" ? "bg-blue-600" : "bg-blue-800 border-blue-700 text-blue-200"}
              onClick={() => setFilters({ ...filters, status: "pending" })}
            >
              Pending
            </Button>
            <Button
              variant={filters.status === "rejected" ? "default" : "outline"}
              size="sm"
              className={filters.status === "rejected" ? "bg-blue-600" : "bg-blue-800 border-blue-700 text-blue-200"}
              onClick={() => setFilters({ ...filters, status: "rejected" })}
            >
              Rejected
            </Button>
          </div>
        </div>

       

        <div>
          <Label className="text-white mb-2 block">Sort By</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={filters.sortBy === "newest" ? "default" : "outline"}
              size="sm"
              className={filters.sortBy === "newest" ? "bg-blue-600" : "bg-blue-800 border-blue-700 text-blue-200"}
              onClick={() => setFilters({ ...filters, sortBy: "newest" })}
            >
              Newest
            </Button>
            <Button
              variant={filters.sortBy === "oldest" ? "default" : "outline"}
              size="sm"
              className={filters.sortBy === "oldest" ? "bg-blue-600" : "bg-blue-800 border-blue-700 text-blue-200"}
              onClick={() => setFilters({ ...filters, sortBy: "oldest" })}
            >
              Oldest
            </Button>
            <Button
              variant={filters.sortBy === "price-high" ? "default" : "outline"}
              size="sm"
              className={filters.sortBy === "price-high" ? "bg-blue-600" : "bg-blue-800 border-blue-700 text-blue-200"}
              onClick={() => setFilters({ ...filters, sortBy: "price-high" })}
            >
              Price (High)
            </Button>
            <Button
              variant={filters.sortBy === "price-low" ? "default" : "outline"}
              size="sm"
              className={filters.sortBy === "price-low" ? "bg-blue-600" : "bg-blue-800 border-blue-700 text-blue-200"}
              onClick={() => setFilters({ ...filters, sortBy: "price-low" })}
            >
              Price (Low)
            </Button>
            {/* <Button
              variant={filters.sortBy === "students" ? "default" : "outline"}
              size="sm"
              className={filters.sortBy === "students" ? "bg-blue-600" : "bg-blue-800 border-blue-700 text-blue-200"}
              onClick={() => setFilters({ ...filters, sortBy: "students" })}
            >
              Most Students
            </Button> */}
          </div>
        </div>

        <div className="flex justify-between pt-2">
          <Button
            variant="outline"
            size="sm"
            className="bg-blue-800 border-blue-700 text-blue-200 hover:bg-blue-700"
            onClick={() => {
              setFilters({
                status: "all",
                priceRange: "all",
                sortBy: "newest",
              })
            }}
          >
            Reset
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-500" onClick={() => setIsFilterOpen(false)}>
            Apply Filters
          </Button>
        </div>
      </div>
    </div>
  )
}
