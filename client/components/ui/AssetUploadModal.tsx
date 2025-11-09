// components/AssetUploadModal.tsx
"use client"

import type React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

interface AssetUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: any) => void
  onError: (error: string) => void
  assetType: string
}

type AssetType = "Image" | "Video" | "PDF" | "Link";

const AssetUploadModal: React.FC<AssetUploadModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  onError,
  assetType,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    tags: "",
    creatorWallet: "",
    file: null as File | null,
    url: "",
  })
  const [isUploading, setIsUploading] = useState(false)

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData((prev) => ({ ...prev, file }))
  }

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
    if (assetType !== "Link" && formData.file) {
      const allowedTypes: Record<AssetType, string[]> = {
        Image: ["image/jpeg", "image/png", "image/gif"],
        Video: ["video/mp4", "video/webm", "video/ogg"],
        PDF: ["application/pdf"],
        Link: [],
      }
      const fileType = formData.file.type
      if (!allowedTypes[assetType as AssetType]?.includes(fileType)) {
        onError(`Invalid file type. Please upload a valid ${assetType} file.`)
        return
      }
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
      form.append("tags", JSON.stringify(formData.tags.split(",").map((tag) => tag.trim())))
      form.append("creatorWallet", formData.creatorWallet)
      if (assetType !== "Link" && formData.file) {
        form.append("file", formData.file)
      } else if (assetType === "Link") {
        form.append("url", formData.url)
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/assets/upload`,
        {
          method: "POST",
          body: form,
        }
      )
      const result = await response.json()

      if (response.ok) {
        onSubmit(result.data)
        onClose() // Close modal on success
        setFormData({
          title: "",
          description: "",
          price: "",
          tags: "",
          creatorWallet: "",
          file: null,
          url: "",
        })
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

  if (!isOpen) return null

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
                <label className="block text-sm font-medium text-foreground mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Asset title"
                  className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-blue-500 outline-none text-foreground transition-colors"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your asset..."
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-blue-500 outline-none text-foreground transition-colors resize-none"
                />
              </div>

              {/* Price and Tags in Same Row */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Price (ETH) *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="0.05"
                    step="0.001"
                    min="0"
                    className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-blue-500 outline-none text-foreground transition-colors"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                    placeholder="e.g., AI, Art, Design"
                    className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-blue-500 outline-none text-foreground transition-colors"
                  />
                </div>
              </div>

              {/* Creator Wallet */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Creator Wallet Address
                </label>
                <input
                  type="text"
                  name="creatorWallet"
                  value={formData.creatorWallet}
                  onChange={handleInputChange}
                  placeholder="0x..."
                  className="w-full px-4 py-2 rounded-lg bg-background border border-border focus:border-blue-500 outline-none text-foreground transition-colors"
                />
              </div>

              {/* File or URL Input */}
              {assetType !== "Link" ? (
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Upload {assetType} *
                  </label>
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
                  <label className="block text-sm font-medium text-foreground mb-2">
                    URL *
                  </label>
                  <input
                    type="url"
                    name="url"
                    value={formData.url}
                    onChange={handleInputChange}
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

export default AssetUploadModal