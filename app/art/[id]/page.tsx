"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Download, Heart, Eye } from "lucide-react"
import { getPhotoById, trackPhotoDownload } from "@/lib/unsplash-api"
import { AnimatePresence } from "framer-motion"
import { useColorExtraction, useCurrentColors } from "@/hooks/use-color-extraction"
import type { Artwork } from "@/types/artwork"

export default function ArtDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [artwork, setArtwork] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [resolvedId, setResolvedId] = useState<string>("")

  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        setIsLoading(true)
        // Await the params promise
        const { id } = await params
        setResolvedId(id)
        console.log("[v0] Fetching artwork with id:", id)
        
        const data = await getPhotoById(id)
        console.log("[v0] Artwork data received:", data)
        
        if (data) {
          setArtwork(data)
        } else {
          setError("Artwork not found")
        }
      } catch (err) {
        console.error("[v0] Error fetching artwork:", err)
        setError("Failed to load artwork")
      } finally {
        setIsLoading(false)
      }
    }

    fetchArtwork()
  }, [params])

  const colors = useColorExtraction(artwork ? [artwork] : [])
const currentColors = useCurrentColors(
  colors,
  artwork?.id
)

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full"
        />
      </div>
    )
  }

  if (error || !artwork) {
    return (
      <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center gap-4">
        <p className="text-white/60 text-lg">{error || "Artwork not found"}</p>
        <Link
          href="/"
          className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Gallery
        </Link>
      </div>
    )
  }

  const handleDownload = async () => {
    if (artwork.links?.download_location) {
      await trackPhotoDownload(artwork.links.download_location)
      window.open(artwork.urls?.full || artwork.image, "_blank")
    }
  }

  return (
    <main className="relative min-h-screen w-full text-white overflow-y-auto">
        <AnimatePresence mode="wait">
  <motion.div
    key={artwork?.id}
    initial={{ opacity: 0, scale: 1.1 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.95 }}
    transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
    className="inset-0 pointer-events-none absolute"
    style={{
      background: `
        radial-gradient(ellipse at 30% 20%, ${currentColors[0]}66 0%, transparent 50%),
        radial-gradient(ellipse at 70% 80%, ${currentColors[1]}66 0%, transparent 50%),
        radial-gradient(ellipse at 50% 50%, ${currentColors[2]}44 0%, transparent 70%),
        linear-gradient(180deg, #0a0a0a 0%, #111111 100%)
      `,
    }}
  />
</AnimatePresence>

{/* Blur overlay */}
<div className="absolute inset-0 backdrop-blur-3xl pointer-events-none" />
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-white/10 bg-black/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Gallery
          </Link>
          <h1 className="font-serif text-xl font-bold text-center flex-1 mx-4 truncate">{artwork.title}</h1>
          <div className="w-20" /> {/* Spacer for alignment */}
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 ">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main image - larger on desktop */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="lg:col-span-2"
          >
            <div className="relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10">
              <img
                src={artwork.urls?.full || artwork.imageUrl || artwork.image}
                alt={artwork.title}
                className="w-full h-auto max-h-[70vh] object-contain"
                style={{
                  aspectRatio: artwork.width && artwork.height ? `${artwork.width}/${artwork.height}` : "4/5",
                }}
              />
            </div>

            {/* Image info below image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mt-8 grid grid-cols-3 gap-4"
            >
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                <Eye className="w-5 h-5 text-white/60" />
                <div>
                  <p className="text-xs text-white/50 uppercase tracking-wider">Views</p>
                  <p className="text-lg font-semibold text-white">{artwork.downloads?.toLocaleString() || "N/A"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                <Heart className="w-5 h-5 text-white/60" />
                <div>
                  <p className="text-xs text-white/50 uppercase tracking-wider">Likes</p>
                  <p className="text-lg font-semibold text-white">{artwork.likes?.toLocaleString() || "0"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                <div>
                  <p className="text-xs text-white/50 uppercase tracking-wider">Year</p>
                  <p className="text-lg font-semibold text-white">{artwork.year}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Sidebar - details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="space-y-6"
          >
            {/* Title and Artist */}
            <div className="space-y-4 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
              <div>
                <p className="text-xs text-white/50 uppercase tracking-wider mb-2">Title</p>
                <h2 className="font-serif text-2xl font-bold text-white">{artwork.title}</h2>
              </div>
              <div>
                <p className="text-xs text-white/50 uppercase tracking-wider mb-2">Artist</p>
                <p className="text-lg text-white/80">{artwork.artist}</p>
              </div>
            </div>

            {/* Description */}
            {artwork.description && (
              <div className="space-y-4 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                <p className="text-xs text-white/50 uppercase tracking-wider">Description</p>
                <p className="text-white/70 leading-relaxed">{artwork.description}</p>
              </div>
            )}

            {/* User info */}
            {artwork.user && (
              <div className="space-y-4 p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
                <p className="text-xs text-white/50 uppercase tracking-wider mb-4">Photographer</p>
                <div className="flex items-center gap-4">
                  {artwork.user.profile_image?.medium && (
                    <img
                      src={artwork.user.profile_image.medium}
                      alt={artwork.user.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  )}
                  <div>
                    <p className="font-semibold text-white">{artwork.user.name}</p>
                    <p className="text-sm text-white/60">@{artwork.user.username}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Download button */}
            <button
              onClick={handleDownload}
              className="w-full flex items-center justify-center gap-2 p-4 rounded-xl bg-white text-black font-semibold hover:bg-white/90 transition-colors"
            >
              <Download className="w-5 h-5" />
              Download Full Size
            </button>

            {/* Specs */}
            {artwork.width && artwork.height && (
              <div className="space-y-2 p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 text-sm">
                <p className="text-white/50 uppercase tracking-wider text-xs">Specifications</p>
                <p className="text-white/70">{artwork.width} × {artwork.height} px</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </main>
  )
}
