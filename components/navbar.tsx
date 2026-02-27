"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Search, X } from "lucide-react"

interface NavbarProps {
  currentIndex?: number
  totalSlides?: number
  onSearch?: (query: string) => void
}

export function Navbar({ currentIndex = 0, totalSlides = 0, onSearch }: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchActive, setIsSearchActive] = useState(false)

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (searchQuery.trim() && onSearch) {
      onSearch(searchQuery)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleClearSearch = () => {
    setSearchQuery("")
    if (onSearch) {
      onSearch("")
    }
  }

  return (
    <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between p-8">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Link href="/" className="font-serif text-2xl font-bold tracking-tight text-white/90 hover:text-white transition-colors">
          Pictora
        </Link>
      </motion.div>

      <div className="flex items-center gap-4">
        {/* Search bar */}
        <motion.form
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="hidden md:flex"
        >
          <div className="relative flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md transition-all hover:border-white/20 hover:bg-white/10">
            <Search className="h-4 w-4 text-white/60" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              placeholder="Search art..."
              className="bg-transparent text-sm text-white placeholder-white/50 outline-none w-32 focus:w-48 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="p-1 hover:text-white text-white/60 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </motion.form>

        {/* Slide counter */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md"
        >
          <span className="text-sm text-white/60">{String(currentIndex + 1).padStart(2, "0")}</span>
          <span className="text-white/30">/</span>
          <span className="text-sm text-white/40">{String(totalSlides).padStart(2, "0")}</span>
        </motion.div>

        {/* Mobile search button */}
        <motion.button
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => setIsSearchActive(!isSearchActive)}
          className="md:hidden flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 backdrop-blur-md hover:border-white/20 hover:bg-white/10 transition-all"
        >
          <Search className="h-4 w-4 text-white/60" />
        </motion.button>
      </div>

      {/* Mobile search panel */}
      {isSearchActive && (
        <motion.form
          onSubmit={handleSearch}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-20 right-8 md:hidden"
        >
          <div className="relative flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 backdrop-blur-md">
            <Search className="h-4 w-4 text-white/60" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              placeholder="Search art..."
              className="bg-transparent text-sm text-white placeholder-white/50 outline-none w-48"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="p-1 hover:text-white text-white/60 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </motion.form>
      )}
    </header>
  )
}
