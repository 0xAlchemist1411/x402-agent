// components/AssetUploadModal.tsx
"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";

interface AssetUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetType: string;
}

type AssetType = "Image" | "Video" | "PDF" | "Link";

const AssetUploadModal: React.FC<AssetUploadModalProps> = ({
  isOpen,
  onClose,
  assetType,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "0.01",
    tags: "",
    creatorId: "",
    creatorWallet: "",
    file: null as File | null,
    url: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, file }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (assetType !== "Link" && formData.file) {
      const allowedTypes: Record<AssetType, string[]> = {
        Image: ["image/jpeg", "image/png", "image/gif"],
        Video: ["video/mp4", "video/webm", "video/ogg"],
        PDF: ["application/pdf"],
        Link: [],
      };

      const fileType = formData.file.type;
      if (!allowedTypes[assetType as AssetType]?.includes(fileType)) {
        alert(`Invalid file type. Please upload a valid ${assetType} file.`);
        return;
      }
    }

    if (assetType === "Link" && !formData.url) {
      alert("Please provide a valid URL.");
      return;
    }

    const form = new FormData();
    form.append("title", formData.title);
    form.append("description", formData.description);
    form.append("price", formData.price);
    form.append(
      "tags",
      JSON.stringify(formData.tags.split(",").map((tag) => tag.trim()))
    );
    form.append("creatorId", formData.creatorId);
    form.append("creatorWallet", formData.creatorWallet);
    form.append("assetType", assetType.toUpperCase());

    if (assetType !== "Link" && formData.file) {
      form.append("file", formData.file);
    } else if (assetType === "Link") {
      form.append("url", formData.url);
    }

    try {
      const response = await fetch("http://localhost:3001/api/assets/upload", {
        method: "POST",
        body: form,
      });
      const result = await response.json();
      if (response.ok) {
        alert("Asset uploaded successfully!");
        onClose();
        setFormData({
          title: "",
          description: "",
          price: "0.01",
          tags: "",
          creatorId: "",
          creatorWallet: "",
          file: null,
          url: "",
        });
      } else {
        alert(`Error: ${result.message || "Failed to upload asset"}`);
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("An error occurred while uploading the asset.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <X className="w-5 h-5" />
        </button>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
          Upload {assetType}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Title
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="mt-1 w-full px-3 py-2 bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
              placeholder="Enter asset title"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="mt-1 w-full px-3 py-2 bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
              placeholder="Enter asset description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Price (USDC)
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              step="0.000001"
              className="mt-1 w-full px-3 py-2 bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
              placeholder="Enter price"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleInputChange}
              className="mt-1 w-full px-3 py-2 bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
              placeholder="e.g., AI, Art, Tutorial"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Creator ID
            </label>
            <input
              type="text"
              name="creatorId"
              value={formData.creatorId}
              onChange={handleInputChange}
              className="mt-1 w-full px-3 py-2 bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
              placeholder="Enter creator ID"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Creator Wallet Address
            </label>
            <input
              type="text"
              name="creatorWallet"
              value={formData.creatorWallet}
              onChange={handleInputChange}
              className="mt-1 w-full px-3 py-2 bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
              placeholder="Enter wallet address"
            />
          </div>
          {assetType !== "Link" ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Upload {assetType}
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
                className="mt-1 w-full px-3 py-2 bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                required
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                URL
              </label>
              <input
                type="url"
                name="url"
                value={formData.url}
                onChange={handleInputChange}
                className="mt-1 w-full px-3 py-2 bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                placeholder="Enter URL"
                required
              />
            </div>
          )}
          <button
            type="submit"
            className="w-full px-4 py-2 bg-gradient-to-r from-blue-500 to-teal-500 text-white rounded-lg hover:shadow-lg transition-all"
          >
            Upload Asset
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AssetUploadModal;
