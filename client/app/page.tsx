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
                {/* Upload Assets Section */}
                <section className="mb-16">
                  <div className="flex items-start gap-8">

                    {/* Asset Grid */}
                    <div className="flex-1">
                      <AssetGrid />
                    </div>
                  </div>
                </section>

                {/* Search Box Section */}
                <section className="mb-16">
                  <div className="flex justify-center">
                    <SearchBox onActivate={handleSearchActivate} onFocus={() => setIsChatMode(true)} />
                  </div>
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
