"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Search } from "lucide-react"

interface SearchBoxProps {
  onActivate: (query: string) => void
  onFocus: () => void
}

export default function SearchBox({ onActivate, onFocus }: SearchBoxProps) {
  const [value, setValue] = useState("")

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && value.trim()) {
      onActivate(value)
    } else if (value.length > 0) {
      onFocus()
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
    if (e.target.value.length > 0) {
      onFocus()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="w-full md:w-4/5 lg:w-3/5"
    >
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-teal-500 rounded-2xl blur opacity-0 group-hover:opacity-30 group-focus-within:opacity-50 transition-opacity duration-300" />
        <div className="relative flex items-center gap-3 px-6 py-4 bg-card border border-border rounded-2xl hover:border-blue-500/50 focus-within:border-blue-500 transition-colors">
          <Search size={20} className="text-foreground/50 flex-shrink-0" />
          <input
            type="text"
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={onFocus}
            placeholder="Search for assets, creators, or tags... (e.g., 'AI-generated art')"
            className="flex-1 bg-transparent outline-none text-foreground placeholder:text-foreground/40"
          />
        </div>
      </div>
    </motion.div>
  )
}
