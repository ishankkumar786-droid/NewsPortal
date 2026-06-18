import mongoose, { Document, Schema } from 'mongoose';

export type MediaType = 'image' | 'video';

export interface IMedia extends Document {
  _id: mongoose.Types.ObjectId;
  url: string;
  publicId: string;
  type: MediaType;
  filename: string;
  originalName: string;
  size: number;
  width?: number;
  height?: number;
  duration?: number; // For videos
  format: string;
  uploadedBy: mongoose.Types.ObjectId;
  folder: string;
  alt?: string;
  caption?: string;
  createdAt: Date;
  updatedAt: Date;
}

const MediaSchema = new Schema<IMedia>(
  {
    url: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ['image', 'video'],
      required: true,
    },
    filename: {
      type: String,
      required: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    width: Number,
    height: Number,
    duration: Number,
    format: {
      type: String,
      required: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    folder: {
      type: String,
      default: 'general',
    },
    alt: {
      type: String,
      maxlength: 200,
    },
    caption: {
      type: String,
      maxlength: 500,
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

MediaSchema.index({ type: 1, createdAt: -1 });
MediaSchema.index({ folder: 1 });

export const Media = mongoose.model<IMedia>('Media', MediaSchema);
