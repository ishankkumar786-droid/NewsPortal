import mongoose, { Document, Schema } from 'mongoose';
import slugify from 'slugify';
import { transliterate } from 'transliteration';

export type ArticleStatus =
  | 'draft'
  | 'submitted'
  | 'pending_review'
  | 'approved'
  | 'published'
  | 'rejected'
  | 'scheduled';

export interface IGalleryImage {
  url: string;
  publicId: string;
  caption?: string;
  alt?: string;
}

export interface IArticle extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  summary: string;
  content: string; // Rich HTML from Tiptap
  category: mongoose.Types.ObjectId;
  tags: string[];
  author: mongoose.Types.ObjectId;
  featuredImage?: {
    url: string;
    publicId: string;
    alt?: string;
    caption?: string;
  };
  galleryImages: IGalleryImage[];
  videoUrl?: string;
  status: ArticleStatus;
  isBreaking: boolean;
  isFeatured: boolean;
  publishDate?: Date;
  scheduledDate?: Date;

  // Workflow tracking
  submittedAt?: Date;
  reviewedAt?: Date;
  reviewedBy?: mongoose.Types.ObjectId;
  rejectionReason?: string;
  approvedAt?: Date;
  approvedBy?: mongoose.Types.ObjectId;
  publishedAt?: Date;
  publishedBy?: mongoose.Types.ObjectId;

  // SEO
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;

  // Analytics
  viewCount: number;
  shareCount: number;

  createdAt: Date;
  updatedAt: Date;
}

const ArticleSchema = new Schema<IArticle>(
  {
    title: {
      type: String,
      required: [true, 'Article title is required'],
      trim: true,
      minlength: [10, 'Title must be at least 10 characters'],
      maxlength: [300, 'Title cannot exceed 300 characters'],
    },
    slug: {
      type: String,
      unique: true,
      index: true,
      lowercase: true,
    },
    summary: {
      type: String,
      required: [true, 'Summary is required'],
      trim: true,
      minlength: [20, 'Summary must be at least 20 characters'],
      maxlength: [500, 'Summary cannot exceed 500 characters'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
      minlength: [50, 'Content must be at least 50 characters'],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Category is required'],
      index: true,
    },
    tags: {
      type: [String],
      validate: {
        validator: (tags: string[]) => tags.length <= 20,
        message: 'Cannot have more than 20 tags',
      },
      default: [],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    featuredImage: {
      url: { type: String },
      publicId: { type: String },
      alt: { type: String, maxlength: 200 },
      caption: { type: String, maxlength: 500 },
    },
    galleryImages: [
      {
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        caption: { type: String, maxlength: 500 },
        alt: { type: String, maxlength: 200 },
      },
    ],
    videoUrl: {
      type: String,
      match: [/^https?:\/\/.+/, 'Please provide a valid URL'],
    },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'pending_review', 'approved', 'published', 'rejected', 'scheduled'],
      default: 'draft',
      index: true,
    },
    isBreaking: {
      type: Boolean,
      default: false,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    publishDate: {
      type: Date,
    },
    scheduledDate: {
      type: Date,
      index: true,
    },

    // Workflow tracking
    submittedAt: { type: Date },
    reviewedAt: { type: Date },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    rejectionReason: { type: String, maxlength: 1000 },
    approvedAt: { type: Date },
    approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    publishedAt: { type: Date },
    publishedBy: { type: Schema.Types.ObjectId, ref: 'User' },

    // SEO
    seoTitle: {
      type: String,
      maxlength: [70, 'SEO title cannot exceed 70 characters'],
    },
    seoDescription: {
      type: String,
      maxlength: [160, 'SEO description cannot exceed 160 characters'],
    },
    canonicalUrl: {
      type: String,
    },

    // Analytics
    viewCount: {
      type: Number,
      default: 0,
    },
    shareCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

// Auto-generate slug from title
ArticleSchema.pre('save', async function (next) {
  if (this.isModified('title')) {
    // Transliterate non-Latin characters (Hindi, etc.) to Latin equivalents
    // e.g. "प्रधानमंत्री ने किया" → "pradhanamantri ne kiya"
    const transliterated = transliterate(this.title);
    let baseSlug = slugify(transliterated, {
      lower: true,
      strict: true,
      trim: true,
    });

    // Fallback: if slug is still empty (e.g. only special chars), use ObjectId
    if (!baseSlug) {
      baseSlug = this._id.toHexString().slice(-8);
    }

    // Ensure unique slug
    let slug = baseSlug;
    let counter = 1;

    while (await mongoose.model('Article').exists({ slug, _id: { $ne: this._id } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = slug;
  }
  next();
});

// Full-text search index
ArticleSchema.index({
  title: 'text',
  summary: 'text',
  content: 'text',
  tags: 'text',
});

ArticleSchema.index({ status: 1, publishDate: -1 });
ArticleSchema.index({ isFeatured: 1, status: 1 });
ArticleSchema.index({ isBreaking: 1, status: 1 });
ArticleSchema.index({ category: 1, status: 1, publishDate: -1 });
ArticleSchema.index({ author: 1, status: 1 });
ArticleSchema.index({ viewCount: -1 });
ArticleSchema.index({ createdAt: -1 });
ArticleSchema.index({ scheduledDate: 1, status: 1 });

export const Article = mongoose.model<IArticle>('Article', ArticleSchema);
