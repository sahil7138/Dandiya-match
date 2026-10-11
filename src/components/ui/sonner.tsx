"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      position="top-center"
      richColors
      closeButton
      expand={true}
      duration={4000}
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4 shrink-0 text-emerald-400" />,
        info: <InfoIcon className="size-4 shrink-0 text-cyan-400" />,
        warning: <TriangleAlertIcon className="size-4 shrink-0 text-amber-400" />,
        error: <OctagonXIcon className="size-4 shrink-0 text-rose-400" />,
        loading: <Loader2Icon className="size-4 animate-spin shrink-0 text-primary" />,
      }}
      toastOptions={{
        style: {
          background: "#151221",
          color: "#ffffff",
          border: "1px solid rgba(255, 255, 255, 0.15)",
          boxShadow: "0 20px 40px -15px rgba(0,0,0,0.8), 0 0 25px rgba(255, 42, 122, 0.2)",
          fontSize: "13px",
          fontWeight: "500",
          borderRadius: "14px",
          padding: "14px 18px",
          zIndex: 99999,
        },
        classNames: {
          toast: "cn-toast",
          closeButton: "!bg-black/80 !border-white/20 !text-white hover:!bg-black",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
