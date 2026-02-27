export interface Artwork {
  id: string
  title: string
  artist: string
  year: number
  image: string
  imageUrl?: string
  description?: string
  likes?: number
  downloads?: number
  width?: number
  height?: number
  color?: string
  created_at?: string
  user?: {
    name: string
    username: string
    portfolio_url?: string
    profile_image?: {
      small: string
      medium: string
      large: string
    }
  }
  urls?: {
    raw: string
    full: string
    regular: string
    small: string
    thumb: string
  }
  links?: {
    self: string
    html: string
    download: string
    download_location: string
  }
}
