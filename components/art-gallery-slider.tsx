"use client"

import { useRef, useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArtworkCard } from "./artwork-card"
import { NavigationDots } from "./navigation-dots"
import { Navbar } from "./navbar"
import { useSliderNavigation } from "@/hooks/use-slider-navigation"
import { useSliderDrag } from "@/hooks/use-slider-drag"
import { useSliderWheel } from "@/hooks/use-slider-wheel"
import { useColorExtraction, useCurrentColors } from "@/hooks/use-color-extraction"
import { getRandomPhotos, searchPhotos } from "@/lib/unsplash-api"
import type { Artwork } from "@/types/artwork"

export function ArtGallerySlider() {
  const sliderRef = useRef<HTMLDivElement>(null)
  const [artworks, setArtworks] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [windowWidth, setWindowWidth] = useState<number>(0)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [searchPage, setSearchPage] = useState(1)

  // Load initial random photos and set window width
  useEffect(() => {
    // Set initial window width
    setWindowWidth(window.innerWidth)
    
    // Handle window resize
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener("resize", handleResize)
    
    loadRandomPhotos()
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const loadRandomPhotos = async () => {
    setIsLoading(true)
    try {
      const photos = await getRandomPhotos(12)
      setArtworks(photos)
      setSearchQuery("")
    } catch (error) {
      console.error("[v0] Error loading random photos:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      loadRandomPhotos()
      return
    }

    setIsLoading(true)
    setSearchQuery(query)
    setSearchPage(1)
    try {
      const results = await searchPhotos(query, 1, 12)
      setArtworks(results)
    } catch (error) {
      console.error("[v0] Error searching photos:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadMorePhotos = async () => {
    if (isLoadingMore) return

    setIsLoadingMore(true)
    try {
      if (searchQuery) {
        // Load more search results
        const nextPage = searchPage + 1
        const results = await searchPhotos(searchQuery, nextPage, 12)
        if (results.length > 0) {
          setArtworks((prev) => [...prev, ...results])
          setSearchPage(nextPage)
        }
      } else {
        // Load more random photos
        const morePhotos = await getRandomPhotos(12)
        if (morePhotos.length > 0) {
          setArtworks((prev) => [...prev, ...morePhotos])
        }
      }
    } catch (error) {
      console.error("[v0] Error loading more photos:", error)
    } finally {
      setIsLoadingMore(false)
    }
  }

  const { currentIndex, goToNext, goToPrev, goToSlide } = useSliderNavigation({
    totalSlides: artworks.length,
    enableKeyboard: true,
  })

  const { isDragging, dragX, handleDragStart, handleDragMove, handleDragEnd } = useSliderDrag({
    onSwipeLeft: goToNext,
    onSwipeRight: goToPrev,
  })

  useSliderWheel({
    sliderRef,
    onScrollLeft: goToNext,
    onScrollRight: goToPrev,
  })

  const colors = useColorExtraction(artworks)
  const currentColors = useCurrentColors(colors, artworks[currentIndex]?.id)

  if (isLoading) {
    return (
      <div className="relative h-full w-full overflow-hidden bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="w-12 h-12 border-2 border-white/20 border-t-white rounded-full"
          />
          <p className="text-white/60 text-sm">Loading gallery...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full overflow-hidden">
      {/* Animated ambient background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
          className="absolute inset-0"
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
      <div className="absolute inset-0 backdrop-blur-3xl" />

      {/* Navbar */}
      <Navbar currentIndex={currentIndex} totalSlides={artworks.length} onSearch={handleSearch} />

      {/* Slider */}
      <div
        ref={sliderRef}
        className="relative flex h-full w-full cursor-grab items-center active:cursor-grabbing"
        onMouseDown={handleDragStart}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        onTouchStart={handleDragStart}
        onTouchMove={handleDragMove}
        onTouchEnd={handleDragEnd}
      >
        <motion.div
          className="flex items-center gap-8 px-[calc(50vw-200px)] md:gap-16 md:px-[calc(50vw-250px)]"
          animate={{
            x: -currentIndex * (windowWidth > 768 ? 564 : 432) + dragX,
          }}
          transition={isDragging ? { duration: 0 } : { duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
        >
          {artworks.map((artwork, index) => (
            <ArtworkCard
              key={artwork.id}
              artwork={artwork}
              isActive={index === currentIndex}
              dragOffset={dragX}
              index={index}
              currentIndex={currentIndex}
            />
          ))}
          
          {/* Load more card at the end */}
          {currentIndex === artworks.length - 1 && (
            <motion.div
              className="relative flex-shrink-0"
              animate={{
                scale: 1,
                opacity: 1,
                rotateY: 0,
              }}
              transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            >
              <motion.div
                className="group relative overflow-hidden rounded-2xl w-56 h-72 md:w-64 md:h-80 flex items-center justify-center bg-gradient-to-br from-white/10 to-white/5 border border-white/20 hover:border-white/40 cursor-pointer transition-all"
                whileHover={{
                  y: -10,
                  boxShadow: "0 40px 80px -20px rgba(0,0,0,0.8)",
                }}
                onClick={loadMorePhotos}
              >
                <div className="flex flex-col items-center gap-4 text-center px-6">
                  <motion.div
                    animate={isLoadingMore ? { rotate: 360 } : { rotate: 0 }}
                    transition={{ duration: 1, repeat: isLoadingMore ? Infinity : 0, ease: "linear" }}
                    className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full"
                  />
                  <div>
                    <p className="text-white font-semibold text-sm">{isLoadingMore ? "Loading..." : "Load More"}</p>
                    <p className="text-white/50 text-xs mt-1">See more artwork</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* Navigation dots */}
      <NavigationDots total={artworks.length} current={currentIndex} onSelect={goToSlide} colors={currentColors} />

      {/* Keyboard hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="absolute bottom-8 left-8 hidden items-center gap-3 text-white/30 md:flex"
      >
        <kbd className="rounded border border-white/10 bg-white/5 px-2 py-1 font-mono text-xs">←</kbd>
        <kbd className="rounded border border-white/10 bg-white/5 px-2 py-1 font-mono text-xs">→</kbd>
        <span className="text-xs">navigate</span>
      </motion.div>
    </div>
  )
}
