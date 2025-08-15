"use client"

import Image from "next/image"

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg"
  text?: string
}

export function LoadingSpinner({ size = "md", text }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`relative ${sizeClasses[size]} animate-spin`}>
        <Image src="/logo.png" alt="Loading" fill className="object-contain" />
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 to-purple-500/30 rounded-full blur-sm"></div>
      </div>
      {text && (
        <div className="text-center">
          <p className="text-sm text-gray-300">{text}</p>
          <p className="text-xs text-purple-300/60">Powered by Or4cl3 AI</p>
        </div>
      )}
    </div>
  )
}
