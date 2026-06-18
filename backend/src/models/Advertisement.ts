import mongoose, { Document, Schema } from 'mongoose';

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

export interface IAdvertisement extends Document {
  _id: mongoose.Types.ObjectId;
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
  startDate: Date;
  endDate: Date;
  views: number;
  clicks: number;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;

  // Computed
  ctr: number;
}

const AdvertisementSchema = new Schema<IAdvertisement>(
  {
    title: {
      type: String,
      required: [true, 'Advertisement title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    image: {
      url: { type: String, required: [true, 'Image URL is required'] },
      publicId: { type: String, required: true },
      alt: { type: String, maxlength: 200, default: '' },
    },
    targetUrl: {
      type: String,
      required: [true, 'Target URL is required'],
      match: [/^https?:\/\/.+/, 'Please provide a valid URL'],
    },
    slot: {
      type: String,
      enum: [
        'HOME_TOP',
        'HOME_MIDDLE',
        'HOME_BOTTOM',
        'ARTICLE_TOP',
        'ARTICLE_MIDDLE',
        'ARTICLE_BOTTOM',
        'SIDEBAR_TOP',
        'SIDEBAR_BOTTOM',
      ],
      required: [true, 'Slot is required'],
      index: true,
    },
    priority: {
      type: Number,
      default: 1,
      min: [1, 'Priority must be at least 1'],
      max: [10, 'Priority cannot exceed 10'],
    },
    status: {
      type: String,
      enum: ['active', 'inactive', 'scheduled', 'expired'],
      default: 'active',
      index: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    views: {
      type: Number,
      default: 0,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

// Virtual for CTR calculation
AdvertisementSchema.virtual('ctr').get(function () {
  if (this.views === 0) return 0;
  return parseFloat(((this.clicks / this.views) * 100).toFixed(2));
});

// Validate end date is after start date
AdvertisementSchema.pre('save', function (next) {
  if (this.endDate <= this.startDate) {
    next(new Error('End date must be after start date'));
    return;
  }
  next();
});

AdvertisementSchema.index({ slot: 1, status: 1, priority: -1 });
AdvertisementSchema.index({ startDate: 1, endDate: 1 });

export const Advertisement = mongoose.model<IAdvertisement>('Advertisement', AdvertisementSchema);
