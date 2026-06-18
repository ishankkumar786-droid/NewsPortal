import mongoose, { Document, Schema } from 'mongoose';

export type AuditAction =
  | 'USER_LOGIN'
  | 'USER_LOGOUT'
  | 'USER_REGISTER'
  | 'USER_PASSWORD_CHANGE'
  | 'USER_PASSWORD_RESET'
  | 'USER_CREATED'
  | 'USER_UPDATED'
  | 'USER_DELETED'
  | 'USER_DEACTIVATED'
  | 'ARTICLE_CREATED'
  | 'ARTICLE_UPDATED'
  | 'ARTICLE_SUBMITTED'
  | 'ARTICLE_APPROVED'
  | 'ARTICLE_REJECTED'
  | 'ARTICLE_PUBLISHED'
  | 'ARTICLE_DELETED'
  | 'ARTICLE_SCHEDULED'
  | 'CATEGORY_CREATED'
  | 'CATEGORY_UPDATED'
  | 'CATEGORY_DELETED'
  | 'AD_CREATED'
  | 'AD_UPDATED'
  | 'AD_DELETED'
  | 'MEDIA_UPLOADED'
  | 'MEDIA_DELETED';

export interface IAuditLog extends Document {
  _id: mongoose.Types.ObjectId;
  action: AuditAction;
  performedBy: mongoose.Types.ObjectId;
  targetResource?: string;
  targetId?: mongoose.Types.ObjectId;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    action: {
      type: String,
      required: true,
      enum: [
        'USER_LOGIN', 'USER_LOGOUT', 'USER_REGISTER', 'USER_PASSWORD_CHANGE',
        'USER_PASSWORD_RESET', 'USER_CREATED', 'USER_UPDATED', 'USER_DELETED',
        'USER_DEACTIVATED', 'ARTICLE_CREATED', 'ARTICLE_UPDATED', 'ARTICLE_SUBMITTED',
        'ARTICLE_APPROVED', 'ARTICLE_REJECTED', 'ARTICLE_PUBLISHED', 'ARTICLE_DELETED',
        'ARTICLE_SCHEDULED', 'CATEGORY_CREATED', 'CATEGORY_UPDATED', 'CATEGORY_DELETED',
        'AD_CREATED', 'AD_UPDATED', 'AD_DELETED', 'MEDIA_UPLOADED', 'MEDIA_DELETED',
      ],
      index: true,
    },
    performedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    targetResource: {
      type: String,
    },
    targetId: {
      type: Schema.Types.ObjectId,
    },
    details: {
      type: Schema.Types.Mixed,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      transform: (_doc, ret) => {
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

// Auto-expire audit logs after 1 year
AuditLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });
AuditLogSchema.index({ action: 1, createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
