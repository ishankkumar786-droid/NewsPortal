'use client';

import { useState } from 'react';
import { Loader2, Upload, Trash2, Image as ImageIcon, Video, FileWarning, Eye } from 'lucide-react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useMedia, useUploadMedia, useDeleteMedia } from '@/hooks/useMedia';
import { useToast } from '@/hooks/use-toast';
import { extractApiError, formatDate } from '@/lib/utils';
import type { Media } from '@/types';

export function AdminMediaLibrary() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [filterType, setFilterType] = useState<'image' | 'video' | ''>('');
  
  const { data, isLoading } = useMedia({
    page,
    limit: 24,
    type: filterType || undefined,
  });

  const { mutate: uploadMedia, isPending: isUploading } = useUploadMedia();
  const { mutate: deleteMedia } = useDeleteMedia();

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    uploadMedia(
      { file },
      {
        onSuccess: () => toast({ title: 'Media uploaded successfully' }),
        onError: (err) => toast({ variant: 'destructive', title: 'Upload failed', description: extractApiError(err) }),
      }
    );
    e.target.value = ''; // Reset input
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this media file permanently?')) return;
    deleteMedia(id, {
      onSuccess: () => toast({ title: 'Media deleted' }),
      onError: (err) => toast({ variant: 'destructive', title: 'Delete failed', description: extractApiError(err) }),
    });
  };

  const media = data?.media || [];
  const pagination = data?.pagination;

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Media Library</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage all uploaded images and videos</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value as any); setPage(1); }}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">All Media</option>
            <option value="image">Images</option>
            <option value="video">Videos</option>
          </select>
          <label className="cursor-pointer">
            <Button asChild disabled={isUploading}>
              <span>
                {isUploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                Upload File
              </span>
            </Button>
            <input type="file" className="hidden" accept="image/*,video/*" onChange={handleUpload} disabled={isUploading} />
          </label>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : media.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
            <ImageIcon className="h-12 w-12 mb-3 opacity-20" />
            <p>No media files found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {media.map((item) => (
            <Card key={item._id} className="overflow-hidden group">
              <div className="aspect-square relative bg-muted flex items-center justify-center">
                {item.type === 'image' ? (
                  <Image src={item.url} alt={item.originalName} fill className="object-cover" sizes="(max-width: 768px) 50vw, 20vw" />
                ) : (
                  <div className="text-center">
                    <Video className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                    <span className="text-xs font-medium bg-background/80 px-2 py-1 rounded">Video</span>
                  </div>
                )}
                
                {/* Overlay actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <a href={item.url} target="_blank" rel="noopener noreferrer" className="p-2 bg-white/20 hover:bg-white/40 rounded-full text-white transition-colors">
                    <Eye className="h-4 w-4" />
                  </a>
                  <button onClick={() => handleDelete(item._id)} className="p-2 bg-red-500/80 hover:bg-red-500 rounded-full text-white transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                
                <div className="absolute top-2 left-2 flex gap-1">
                  <Badge variant="secondary" className="text-[10px] bg-background/80 backdrop-blur-sm px-1.5 py-0">
                    {item.format.toUpperCase()}
                  </Badge>
                </div>
              </div>
              <div className="p-2.5">
                <p className="text-xs font-medium truncate" title={item.originalName}>{item.originalName}</p>
                <div className="flex items-center justify-between mt-1 text-[10px] text-muted-foreground">
                  <span>{formatBytes(item.size)}</span>
                  <span>{formatDate(item.createdAt)}</span>
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5 truncate">
                  By {item.uploadedBy?.name || 'Unknown'}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <Button variant="outline" disabled={!pagination.hasPrevPage} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="flex items-center px-4 text-sm font-medium">Page {pagination.page} of {pagination.totalPages}</span>
          <Button variant="outline" disabled={!pagination.hasNextPage} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
