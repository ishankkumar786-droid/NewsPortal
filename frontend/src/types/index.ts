// ===========================
// USER TYPES
// ===========================

export type UserRole = 'super_admin' | 'reporter' | 'visitor';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  bio?: string;
}

// ===========================
// CATEGORY TYPES
// ===========================

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  color: string;
  icon?: string;
  parentCategory?: Category | null;
  order: number;
  isActive: boolean;
  articleCount: number;
  createdAt: string;
  updatedAt: string;
}

// ===========================
// ARTICLE TYPES
// ===========================

export type ArticleStatus =
  | 'draft'
  | 'submitted'
  | 'pending_review'
  | 'approved'
  | 'published'
  | 'rejected'
  | 'scheduled';

export interface FeaturedImage {
  url: string;
  publicId: string;
  alt?: string;
  caption?: string;
}

export interface GalleryImage {
  url: string;
  publicId: string;
  caption?: string;
  alt?: string;
}

export interface Article {
  _id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  category: Category;
  tags: string[];
  author: User;
  featuredImage?: FeaturedImage;
  galleryImages: GalleryImage[];
  videoUrl?: string;
  status: ArticleStatus;
  isBreaking: boolean;
  isFeatured: boolean;
  publishDate?: string;
  scheduledDate?: string;
  submittedAt?: string;
  reviewedAt?: string;
  reviewedBy?: User;
  rejectionReason?: string;
  approvedAt?: string;
  approvedBy?: User;
  publishedAt?: string;
  publishedBy?: User;
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  viewCount: number;
  shareCount: number;
  createdAt: string;
  updatedAt: string;
}

// ===========================
// ADVERTISEMENT TYPES
// ===========================

export type AdSlot =
  | 'HOME_TOP'
  | 'HOME_MIDDLE'
  | 'HOME_BOTTOM'
  | 'ARTICLE_TOP'
  | 'ARTICLE_MIDDLE'
  | 'ARTICLE_BOTTOM'
  | 'SIDEBAR_TOP'
  | 'SIDEBAR_BOTTOM';

export type AdStatus = 'active' | 'inactive' | 'scheduled' | 'expired';

export interface Advertisement {
  _id: string;
  title: string;
  image: {
    url: string;
    publicId: string;
    alt?: string;
  };
  targetUrl: string;
  slot: AdSlot;
  priority: number;
  status: AdStatus;
  startDate: string;
  endDate: string;
  views: number;
  clicks: number;
  ctr: number;
  createdAt: string;
  updatedAt: string;
}

// ===========================
// API TYPES
// ===========================

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

// ===========================
// ANALYTICS TYPES
// ===========================

export interface DashboardStats {
  totalArticles: number;
  publishedArticles: number;
  pendingArticles: number;
  totalReporters: number;
  totalCategories: number;
  totalViews: number;
  totalAds: number;
}

export interface ReporterStats {
  total: number;
  published: number;
  pending: number;
  rejected: number;
}

export interface ViewsOverTimeData {
  _id: string;
  views: number;
  articles: number;
}

export interface CategoryPerformanceData {
  categoryId: string;
  name: string;
  slug: string;
  color: string;
  totalArticles: number;
  totalViews: number;
}

// ===========================
// MEDIA TYPES
// ===========================

export interface Media {
  _id: string;
  url: string;
  publicId: string;
  type: 'image' | 'video';
  filename: string;
  originalName: string;
  size: number;
  width?: number;
  height?: number;
  duration?: number;
  format: string;
  uploadedBy: User;
  folder: string;
  alt?: string;
  caption?: string;
  createdAt: string;
}

// ===========================
// AUDIT LOG TYPES
// ===========================

export interface AuditLog {
  _id: string;
  action: string;
  performedBy: User;
  targetResource?: string;
  targetId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

// ===========================
// FORM TYPES
// ===========================

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role?: 'reporter' | 'visitor';
}

export interface ArticleFormData {
  title: string;
  summary: string;
  content: string;
  category: string;
  tags: string[];
  videoUrl?: string;
  isBreaking: boolean;
  isFeatured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  scheduledDate?: string;
}
