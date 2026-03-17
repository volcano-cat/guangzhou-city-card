export interface User {
  id: number
  email: string
  nickname: string | null
  avatar: string | null
  role: 'USER' | 'ADMIN'
  status: 'ACTIVE' | 'DISABLED'
  createdAt: string
  updatedAt: string
}

export interface Category {
  id: number
  name: string
  type: 'ATTRACTION' | 'FOOD'
  description: string | null
  sort: number
  status: 'ACTIVE' | 'DISABLED'
}

export interface Attraction {
  id: number
  name: string
  description: string
  address: string
  images: string[] | null
  openTime: string | null
  ticketInfo: string | null
  latitude: number | null
  longitude: number | null
  categoryId: number
  rating: number | null
  viewCount: number
  status: 'PUBLISHED' | 'DRAFT'
  createdAt: string
  updatedAt: string
  category?: Category
  _count?: {
    favorites: number
    comments: number
  }
  isFavorited?: boolean
}

export interface Food {
  id: number
  name: string
  description: string
  images: string[] | null
  categoryId: number
  restaurants: Restaurant[] | null
  status: 'PUBLISHED' | 'DRAFT'
  createdAt: string
  updatedAt: string
  category?: Category
}

export interface Restaurant {
  name: string
  address: string
  phone?: string
}

export interface Comment {
  id: number
  userId: number
  attractionId: number
  content: string
  rating: number | null
  status: 'APPROVED' | 'PENDING' | 'REJECTED'
  createdAt: string
  user?: Pick<User, 'id' | 'nickname' | 'avatar'>
}

export interface Favorite {
  id: number
  userId: number
  attractionId: number
  createdAt: string
  attraction?: Attraction
}

export interface Culture {
  id: number
  title: string
  content: string
  coverImage: string | null
  type: string
  status: 'PUBLISHED' | 'DRAFT'
  createdAt: string
  updatedAt: string
}

export interface PaginationParams {
  page?: number
  pageSize?: number
}

export interface PaginationResult<T> {
  list: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
}
