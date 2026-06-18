'use client';

import { useState } from 'react';
import {
  Loader2, Plus, Trash2, Pencil, ExternalLink, Eye, MousePointerClick,
  BarChart3, Calendar, Image as ImageIcon,
} from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  useAdvertisements,
  useCreateAdvertisement,
  useUpdateAdvertisement,
  useDeleteAdvertisement,
} from '@/hooks/useAdvertisements';
import { useToast } from '@/hooks/use-toast';
import { extractApiError, formatDate } from '@/lib/utils';
import type { Advertisement, AdSlot, AdStatus } from '@/types';

const AD_SLOTS: AdSlot[] = [
  'HOME_TOP', 'HOME_MIDDLE', 'HOME_BOTTOM',
  'ARTICLE_TOP', 'ARTICLE_MIDDLE', 'ARTICLE_BOTTOM',
  'SIDEBAR_TOP', 'SIDEBAR_BOTTOM',
];

const STATUS_COLORS: Record<AdStatus, string> = {
  active: 'bg-emerald-500/10 text-emerald-600',
  inactive: 'bg-zinc-500/10 text-zinc-500',
  scheduled: 'bg-blue-500/10 text-blue-600',
  expired: 'bg-red-500/10 text-red-500',
};

export function AdminAdvertisementsManager() {
  const { toast } = useToast();
  const [filterSlot, setFilterSlot] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingAd, setEditingAd] = useState<Advertisement | null>(null);

  const { data, isLoading } = useAdvertisements({
    slot: filterSlot || undefined,
    status: filterStatus || undefined,
    limit: 50,
  });

  const { mutate: createAd, isPending: isCreating } = useCreateAdvertisement();
  const { mutate: updateAd, isPending: isUpdating } = useUpdateAdvertisement();
  const { mutate: deleteAd } = useDeleteAdvertisement();

  const [formData, setFormData] = useState({
    title: '',
    targetUrl: '',
    slot: 'HOME_TOP' as AdSlot,
    priority: '5',
    status: 'active' as AdStatus,
    startDate: '',
    endDate: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const resetForm = () => {
    setFormData({
      title: '', targetUrl: '', slot: 'HOME_TOP', priority: '5',
      status: 'active', startDate: '', endDate: '',
    });
    setImageFile(null);
    setImagePreview(null);
    setEditingAd(null);
    setShowForm(false);
  };

  const openEdit = (ad: Advertisement) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      targetUrl: ad.targetUrl,
      slot: ad.slot,
      priority: String(ad.priority),
      status: ad.status,
      startDate: ad.startDate?.split('T')[0] || '',
      endDate: ad.endDate?.split('T')[0] || '',
    });
    setImagePreview(ad.image?.url || null);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    fd.append('title', formData.title);
    fd.append('targetUrl', formData.targetUrl);
    fd.append('slot', formData.slot);
    fd.append('priority', formData.priority);
    fd.append('status', formData.status);
    fd.append('startDate', formData.startDate);
    fd.append('endDate', formData.endDate);
    if (imageFile) fd.append('image', imageFile);

    if (editingAd) {
      updateAd(
        { id: editingAd._id, data: fd },
        {
          onSuccess: () => { toast({ title: 'Advertisement updated' }); resetForm(); },
          onError: (err) => toast({ variant: 'destructive', title: 'Failed', description: extractApiError(err) }),
        }
      );
    } else {
      if (!imageFile) {
        toast({ variant: 'destructive', title: 'Image is required' });
        return;
      }
      createAd(fd, {
        onSuccess: () => { toast({ title: 'Advertisement created' }); resetForm(); },
        onError: (err) => toast({ variant: 'destructive', title: 'Failed', description: extractApiError(err) }),
      });
    }
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this advertisement?')) return;
    deleteAd(id, {
      onSuccess: () => toast({ title: 'Advertisement deleted' }),
      onError: (err) => toast({ variant: 'destructive', title: 'Failed', description: extractApiError(err) }),
    });
  };

  const ads = data?.advertisements || [];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">Advertisements</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage business advertisement campaigns</p>
        </div>
        <Button onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-1" /> New Advertisement
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <select
          value={filterSlot}
          onChange={(e) => setFilterSlot(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">All Slots</option>
          {AD_SLOTS.map((s) => (
            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="scheduled">Scheduled</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* Form Modal */}
      {showForm && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle>{editingAd ? 'Edit Advertisement' : 'Create Advertisement'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title *</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Target URL *</Label>
                  <Input
                    type="url"
                    value={formData.targetUrl}
                    onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slot *</Label>
                  <select
                    value={formData.slot}
                    onChange={(e) => setFormData({ ...formData, slot: e.target.value as AdSlot })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {AD_SLOTS.map((s) => (
                      <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Priority (1-10)</Label>
                  <Input
                    type="number" min="1" max="10"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date *</Label>
                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as AdStatus })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Image {editingAd ? '' : '*'}</Label>
                  <div className="flex items-center gap-3">
                    {imagePreview && (
                      <div className="relative w-20 h-14 rounded overflow-hidden bg-muted">
                        <Image src={imagePreview} alt="Preview" fill className="object-cover" sizes="80px" />
                      </div>
                    )}
                    <label className="cursor-pointer">
                      <Button type="button" variant="outline" size="sm" asChild>
                        <span><ImageIcon className="h-4 w-4 mr-1" /> Choose Image</span>
                      </Button>
                      <input
                        type="file" accept="image/*" className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (f) { setImageFile(f); setImagePreview(URL.createObjectURL(f)); }
                        }}
                      />
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                <Button type="submit" disabled={isCreating || isUpdating}>
                  {(isCreating || isUpdating) && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
                  {editingAd ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : ads.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No advertisements found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {ads.map((ad) => (
            <Card key={ad._id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-center gap-4 flex-wrap">
                  {ad.image?.url && (
                    <div className="relative w-24 h-16 rounded overflow-hidden bg-muted shrink-0">
                      <Image src={ad.image.url} alt={ad.title} fill className="object-cover" sizes="96px" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold truncate">{ad.title}</h3>
                      <Badge className={STATUS_COLORS[ad.status]}>{ad.status}</Badge>
                      <Badge variant="outline" className="text-xs">{ad.slot.replace(/_/g, ' ')}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(ad.startDate)} — {formatDate(ad.endDate)}</span>
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{ad.views?.toLocaleString()} views</span>
                      <span className="flex items-center gap-1"><MousePointerClick className="h-3 w-3" />{ad.clicks?.toLocaleString()} clicks</span>
                      <span className="font-medium">CTR: {ad.ctr || 0}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <a href={ad.targetUrl} target="_blank" rel="noopener noreferrer">
                      <Button variant="ghost" size="sm"><ExternalLink className="h-4 w-4" /></Button>
                    </a>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(ad)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(ad._id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
