"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  onError: (error: string) => void
  assetType: string
}

// Predefined popular tags
const POPULAR_TAGS = [
  "AI",
  "Art",
  "Design",
  "Tech",
  "Tutorial",
  "Photography",
  "Music",
  "Code",
  "Blockchain",
  "Web3",
]

export default function UploadModal({ isOpen, onClose, onSubmit, onError, assetType }: UploadModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    tags: [] as string[],
    creatorWallet: "",
    file: null as File | null,
    url: "",
  })
  const [isUploading, setIsUploading] = useState(false)
  const [tagInput, setTagInput] = useState("")

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData((prev) => ({ ...prev, file }))
  }

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value)
    console.log("Tag input:", e.target.value) // Debug: Log input value
  }

  const handleTagSelect = (tag: string) => {
    if (!formData.tags.includes(tag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tag],
      }))
      console.log("Selected tag:", tag) // Debug: Log selected tag
    }
    setTagInput("") // Clear input after selection
  }

  const handleTagRemove = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }))
    console.log("Removed tag:", tag) // Debug: Log removed tag
  }

  // Filter popular tags based on input
  const filteredTags = useMemo(() => {
    const input = tagInput.trim().toLowerCase()
    const result = input
      ? POPULAR_TAGS.filter((tag) => tag.toLowerCase().includes(input)).slice(0, 5)
      : []
    console.log("Filtered tags:", result) // Debug: Log filtered tags
    return result
  }, [tagInput])

  const handleSubmit = async (e: React.FormEvent) => {
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
    if (assetType !== "Link" && !formData.file) {
      onError("File is required for non-Link assets")
      return
    }
    if (assetType === "Link" && !formData.url) {
      onError("URL is required for Link assets")
      return
    }

    setIsUploading(true)

    try {
      const form = new FormData()
      form.append("title", formData.title)
      form.append("description", formData.description)
      form.append("assetType", assetType === "Paper" ? "DOCUMENT" : assetType.toUpperCase())
      form.append("price", formData.price)
      form.append("tags", JSON.stringify(formData.tags))
      form.append("creatorWallet", formData.creatorWallet)
      if (assetType !== "Link" && formData.file) {
        form.append("file", formData.file)
      } else if (assetType === "Link") {
        form.append("url", formData.url)
      }

      const response = await fetch("/api/assets/upload", {
        method: "POST",
        body: form,
      })
      const result = await response.json()

      if (response.ok) {
        onSubmit(result.data)
        onClose()
      } else {
        onError(result.message || "Failed to upload asset")
      }
    } catch (err) {
      console.error("Upload error:", err)
      onError("An error occurred while uploading the asset")
    } finally {
      setIsUploading(false)
    }
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
            className="w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-xl font-bold text-foreground">Upload {assetType}</h2>
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
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-blue-500 outline-none text-foreground transition-colors resize-none"
                />
              </div>

              {/* Price and Tags in Same Row */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
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
                <div className="flex-1 relative">
                  <label className="block text-sm font-medium text-foreground mb-2">Tags</label>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={handleTagInputChange}
                    placeholder="Type to search tags..."
                    className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-blue-500 outline-none text-foreground transition-colors"
                  />
                  {/* Tag Suggestions */}
                  {filteredTags.length > 0 && (
                    <div className="absolute z-20 w-full mt-1 bg-card border border-border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                      {filteredTags.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleTagSelect(tag)}
                          className="w-full px-4 py-2 text-left text-foreground hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors"
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  )}
                  {/* Selected Tags */}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 bg-blue-500 text-white rounded-full text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleTagRemove(tag)}
                          className="ml-2 focus:outline-none"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
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

              {/* File or URL Input */}
              {assetType !== "Link" ? (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Upload {assetType} *</label>
                  <input
                    type="file"
                    accept={
                      assetType === "Image"
                        ? "image/*"
                        : assetType === "Video"
                        ? "video/*"
                        : "application/pdf"
                    }
                    onChange={handleFileChange}
                    className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-blue-500 outline-none text-foreground transition-colors"
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">URL *</label>
                  <input
                    type="url"
                    name="url"
                    value={formData.url}
                    onChange={handleChange}
                    placeholder="Enter URL"
                    className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-blue-500 outline-none text-foreground transition-colors"
                    required
                  />
                </div>
              )}

              {/* Buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 px-4 py-2 rounded-lg border border-border text-foreground hover:bg-muted transition-colors font-medium"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: isUploading ? 1 : 1.05 }}
                  whileTap={{ scale: isUploading ? 1 : 0.95 }}
                  type="submit"
                  disabled={isUploading}
                  className={`flex-1 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-teal-500 text-white font-medium transition-all ${
                    isUploading ? "opacity-50 cursor-not-allowed" : "hover:shadow-lg"
                  }`}
                >
                  {isUploading ? "Uploading..." : "Upload Asset"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}