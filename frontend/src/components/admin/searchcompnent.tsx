"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useDebounce } from "./custom-debounce-hook"
import { Input } from "@/components/ui/input"
import { Search, Loader2 } from "lucide-react"

interface SearchComponentProps {
  onSearch: (query: string) => void
}

const SearchComponent: React.FC<SearchComponentProps> = ({ onSearch }) => {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearching, setIsSearching] = useState(false)

  // Debounce the search query with a 300ms delay
  const debouncedSearchQuery = useDebounce(searchQuery, 300)

  // Effect to trigger search when the debounced value changes
  useEffect(() => {
    if (debouncedSearchQuery) {
      setIsSearching(true)
      onSearch(debouncedSearchQuery)
     
      setTimeout(() => setIsSearching(false), 500) // Simulating API call completion
    }
  }, [debouncedSearchQuery, onSearch])

  return (
    <div className="relative w-full max-w-sm">
      <Input
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pr-10"
      />
      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
        {isSearching ? (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        ) : (
          <Search className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
    </div>
  )
}

export default SearchComponent
