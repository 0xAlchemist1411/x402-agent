// components/AssetGridPage.tsx
"use client"

import { motion } from "framer-motion"
import { ImageIcon, Play, FileText, Globe, Plus } from "lucide-react"
import NoiseWrapper from "@/components/ui/noise-wrapper"
import { useState } from "react"
import AssetUploadModal from "@/components/ui/AssetUploadModal"

const MOCK_ASSETS = [
  {
    id: 1,
    title: "Images",
    type: "Image",
    thumbnail: "/image.png",
  },
  {
    id: 2,
    title: "PDF",
    type: "PDF",
    thumbnail: "/pdf.png",
  },
  {
    id: 3,
    title: "Videos",
    type: "Video",
    thumbnail: "/video.jpg",
  },
  {
    id: 4,
    title: "Links",
    type: "Link",
    thumbnail: "/link.png",
  },
]

const typeIcons = {
  Image: ImageIcon,
  Video: Play,
  PDF: FileText,
  Link: Globe,
}

export default function AssetGridPage() {
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedAssetType, setSelectedAssetType] = useState("")

  const openModal = (type: string) => {
    setSelectedAssetType(type)
    setModalOpen(true)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
        {MOCK_ASSETS.map((asset, index) => {
          const IconComponent = typeIcons[asset.type as keyof typeof typeIcons]
          return (
            <div className="rounded-xl overflow-hidden" key={asset.id}>
              <NoiseWrapper>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="relative rounded-xl overflow-hidden hover:shadow-lg transition-shadow duration-300 h-32"
                >
                  {/* Thumbnail */}
                  <div className="relative h-full">
                    <img
                      src={asset.thumbnail}
                      alt={asset.title}
                      className="w-full h-full object-cover opacity-50"
                    />
                    {/* Content Overlay */}
                    <div className="absolute top-4 left-4">
                      <div className="flex items-center space-x-3">
                        <IconComponent className="w-6 h-6 text-white" />
                        <h3 className="text-lg font-semibold text-white">
                          {asset.title}
                        </h3>
                      </div>
                    </div>
                  </div>
                  {/* Plus Icon */}
                  <div className="absolute bottom-2 right-2">
                    <button
                      onClick={() => openModal(asset.type)}
                      className="bg-gray-500 text-white p-2 rounded-full hover:bg-gray-600 transition-colors"
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              </NoiseWrapper>
            </div>
          )
        })}
      </div>
      <AssetUploadModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        assetType={selectedAssetType}
      />
    </div>
  )
}