import type { Artwork } from "@/types/artwork"

const UNSPLASH_API_BASE = "https://api.unsplash.com"
const API_KEY = process.env.NEXT_PUBLIC_UNSPLASH_API_KEY

if (!API_KEY) {
  console.warn(
    "NEXT_PUBLIC_UNSPLASH_API_KEY is not set. Please add it to your .env.local file to use the Unsplash API."
  )
}

interface UnsplashPhoto {
  id: string
  created_at: string
  updated_at: string
  width: number
  height: number
  color: string
  blur_hash: string
  likes: number
  liked_by_user: boolean
  description: string | null
  user: {
    id: string
    username: string
    name: string
    portfolio_url: string | null | undefined
    profile_image: {
      small: string
      medium: string
      large: string
    }
  }
  urls: {
    raw: string
    full: string
    regular: string
    small: string
    thumb: string
  }
  links: {
    self: string
    html: string
    download: string
    download_location: string
  }
  downloads?: number
}

function transformUnsplashPhoto(photo: UnsplashPhoto): Artwork {
  return {
    id: photo.id,
    title: photo.description || `Artwork by ${photo.user.name}`,
    artist: photo.user.name,
    year: new Date(photo.created_at).getFullYear(),
    image: photo.urls.regular,
    imageUrl: photo.urls.full,
    description: photo.description || `Photo by ${photo.user.name} on Unsplash`,
    likes: photo.likes,
    downloads: photo.downloads || 0,
    width: photo.width,
    height: photo.height,
    color: photo.color,
    created_at: photo.created_at,
    user: {
      name: photo.user.name,
      username: photo.user.username,
      portfolio_url: photo.user.portfolio_url ?? undefined,
      profile_image: photo.user.profile_image,
    },
    urls: photo.urls,
    links: photo.links,
  }
}

export async function getRandomPhotos(count: number = 12): Promise<Artwork[]> {
  if (!API_KEY) {
    console.error("NEXT_PUBLIC_UNSPLASH_API_KEY is not set")
    return []
  }

  try {
    const response = await fetch(
      `${UNSPLASH_API_BASE}/photos/random?count=${count}&query=art&orientation=portrait&client_id=${API_KEY}`
    )

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`)
    }

    const photos: UnsplashPhoto[] = await response.json()
    return photos.map(transformUnsplashPhoto)
  } catch (error) {
    console.error("Error fetching random photos from Unsplash:", error)
    return []
  }
}

export async function searchPhotos(query: string, page: number = 1, perPage: number = 12): Promise<Artwork[]> {
  if (!API_KEY) {
    console.error("NEXT_PUBLIC_UNSPLASH_API_KEY is not set")
    return []
  }

  try {
    const response = await fetch(
      `${UNSPLASH_API_BASE}/search/photos?query=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}&orientation=portrait&client_id=${API_KEY}`
    )

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`)
    }

    const data = await response.json()
    return data.results.map(transformUnsplashPhoto)
  } catch (error) {
    console.error("Error searching photos on Unsplash:", error)
    return []
  }
}

export async function getPhotoById(id: string): Promise<Artwork | null> {
  if (!API_KEY) {
    console.error("NEXT_PUBLIC_UNSPLASH_API_KEY is not set")
    return null
  }

  try {
    const response = await fetch(`${UNSPLASH_API_BASE}/photos/${id}?client_id=${API_KEY}`)

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`)
    }

    const photo: UnsplashPhoto = await response.json()
    return transformUnsplashPhoto(photo)
  } catch (error) {
    console.error("Error fetching photo by ID from Unsplash:", error)
    return null
  }
}

export async function trackPhotoDownload(downloadUrl: string): Promise<void> {
  try {
    await fetch(downloadUrl)
  } catch (error) {
    console.error("Error tracking download:", error)
  }
}
