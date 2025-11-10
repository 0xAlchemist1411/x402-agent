"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import AssetGrid from "@/components/asset-grid"
import SearchBox from "@/components/search-box"
import ChatInterface from "@/components/chat-interface"
import Toast from "@/components/toast"

export default function Home() {
  const [isDark, setIsDark] = useState(true)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [isChatMode, setIsChatMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleAssetUpload = (data: any) => {
    showToast("Asset uploaded successfully!", "success")
    setShowUploadModal(false)
  }

  const handleSearchActivate = (query: string) => {
    setSearchQuery(query)
    setIsChatMode(true)
  }

  const handleBackToMain = () => {
    setIsChatMode(false)
    setSearchQuery("")
  }

  return (
    <div className={isDark ? "dark" : ""}>
      <div className="min-h-screen bg-background text-foreground transition-colors duration-200">
        <AnimatePresence mode="wait">
          {!isChatMode ? (
            <motion.div
              key="main"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pt-20"
            >
              {/* Main Page */}
              <div className="container mx-auto px-4 py-12">
                {/* Hero Section */}
                <section className="mb-16 text-center">
                  <motion.h1 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="text-5xl md:text-7xl font-bold mb-6"
                  >
                    <span className="bg-gradient-to-r from-blue-500 via-teal-500 to-purple-500 bg-clip-text text-transparent">
                      x404 ATXP MCP
                    </span>
                  </motion.h1>
                  <motion.p 
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-xl md:text-2xl text-foreground/70 mb-8 max-w-3xl mx-auto"
                  >
                    AI-Powered Digital Asset Marketplace with MCP agent
                  </motion.p>
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="flex justify-center mb-12"
                  >
                    <SearchBox onActivate={handleSearchActivate} onFocus={() => setIsChatMode(true)} />
                  </motion.div>
                </section>

                {/* Asset Grid Section */}
                <section className="mb-16">
                  <motion.h2 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-3xl font-bold mb-8 text-center"
                  >
                    Upload Assets
                  </motion.h2>
                  <AssetGrid />
                </section>
              </div>
            </motion.div>
          ) : (
            <ChatInterface key="chat" initialQuery={searchQuery} onBack={handleBackToMain} />
          )}
        </AnimatePresence>


        {/* Toast */}
        {toast && <Toast message={toast.message} type={toast.type} />}
      </div>
    </div>
  )
}
