"use client"

import { motion } from "framer-motion"
import { Sun, Moon, Wallet } from "lucide-react"

interface HeaderProps {
  isDark: boolean
  onToggleDark: () => void
}

export default function Header({ isDark, onToggleDark }: HeaderProps) {
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border"
    >
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-teal-500 bg-clip-text text-transparent">
          AssetHub
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex gap-8 absolute left-1/2 transform -translate-x-1/2">
          <a href="#" className="text-foreground/70 hover:text-foreground transition-colors">
            Home
          </a>
          <a href="#" className="text-foreground/70 hover:text-foreground transition-colors">
            About
          </a>
          <a href="#" className="text-foreground/70 hover:text-foreground transition-colors">
            Docs
          </a>
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-4">
          {/* Wallet Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-500 transition-colors border border-blue-500/30"
          >
            <Wallet size={18} />
            <span className="hidden sm:inline text-sm font-medium">Connect Wallet</span>
          </motion.button>

          {/* Dark Mode Toggle */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onToggleDark}
            className="p-2 rounded-lg hover:bg-muted transition-colors"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </motion.button>

          {/* Avatar Placeholder */}
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center text-white font-bold cursor-pointer hover:shadow-lg transition-shadow">
            U
          </div>
        </div>
      </div>
    </motion.header>
  )
}
