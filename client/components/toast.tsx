"use client"

import { motion } from "framer-motion"
import { Check, AlertCircle } from "lucide-react"

interface ToastProps {
  message: string
  type: "success" | "error"
}

export default function Toast({ message, type }: ToastProps) {
  const isSuccess = type === "success"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className={`fixed bottom-6 right-6 flex items-center gap-3 px-6 py-4 rounded-lg shadow-lg ${
        isSuccess ? "bg-green-500/10 border border-green-500/30" : "bg-red-500/10 border border-red-500/30"
      }`}
    >
      {isSuccess ? (
        <Check size={20} className="text-green-500 flex-shrink-0" />
      ) : (
        <AlertCircle size={20} className="text-red-500 flex-shrink-0" />
      )}
      <span className={isSuccess ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
        {message}
      </span>
    </motion.div>
  )
}
