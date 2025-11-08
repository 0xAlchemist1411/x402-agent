"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  onError: (error: string) => void
}

export default function UploadModal({ isOpen, onClose, onSubmit, onError }: UploadModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    assetType: "Image",
    price: "",
    tags: "",
    creatorId: "user-12345",
    creatorWallet: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!formData.title.trim()) {
      onError("Title is required")
      return
    }
    if (!formData.price || Number.parseFloat(formData.price) <= 0) {
      onError("Valid price is required")
      return
    }

    onSubmit(formData)
    setFormData({
      title: "",
      description: "",
      assetType: "Image",
      price: "",
      tags: "",
      creatorId: "user-12345",
      creatorWallet: "",
    })
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">Upload Asset</h2>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="p-2 hover:bg-muted rounded-lg transition-colors"
              >
                <X size={20} className="text-foreground" />
              </motion.button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Asset title"
                  className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-blue-500 outline-none text-foreground transition-colors"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your asset..."
                  rows={4}
                  className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-blue-500 outline-none text-foreground transition-colors resize-none"
                />
              </div>

              {/* Asset Type */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Asset Type</label>
                <select
                  name="assetType"
                  value={formData.assetType}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-blue-500 outline-none text-foreground transition-colors"
                >
                  <option>Image</option>
                  <option>Video</option>
                  <option>Paper</option>
                  <option>Link</option>
                </select>
              </div>

              {/* Price */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Price (ETH) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.05"
                  step="0.001"
                  min="0"
                  className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-blue-500 outline-none text-foreground transition-colors"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Tags</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="Enter comma-separated tags (e.g., AI, Art, Design)"
                  className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-blue-500 outline-none text-foreground transition-colors"
                />
              </div>

              {/* Creator ID */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Creator ID</label>
                <input
                  type="text"
                  name="creatorId"
                  value={formData.creatorId}
                  onChange={handleChange}
                  disabled
                  className="w-full px-4 py-2 rounded-lg bg-muted border border-border text-foreground/60 cursor-not-allowed"
                />
              </div>

              {/* Creator Wallet */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Creator Wallet Address</label>
                <input
                  type="text"
                  name="creatorWallet"
                  value={formData.creatorWallet}
                  onChange={handleChange}
                  placeholder="0x..."
                  className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-blue-500 outline-none text-foreground transition-colors"
                />
              </div>

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors font-medium"
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-teal-500 text-white font-medium hover:shadow-lg transition-all"
                >
                  Upload Asset
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
