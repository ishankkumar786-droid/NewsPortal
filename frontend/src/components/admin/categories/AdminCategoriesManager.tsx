'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, Loader2, GripVertical } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '@/hooks/useCategories';
import { useToast } from '@/hooks/use-toast';
import { extractApiError } from '@/lib/utils';
import type { Category } from '@/types';

const schema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color').default('#e63946'),
  icon: z.string().max(50).optional(),
  isActive: z.boolean().default(true),
});

type FormData = z.infer<typeof schema>;

interface CategoryFormProps {
  category?: Category;
  onSuccess: () => void;
  onCancel: () => void;
}

function CategoryForm({ category, onSuccess, onCancel }: CategoryFormProps) {
  const { mutate: create, isPending: isCreating } = useCreateCategory();
  const { mutate: update, isPending: isUpdating } = useUpdateCategory(category?._id || '');
  const isPending = isCreating || isUpdating;
  const { toast } = useToast();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: category?.name || '',
      description: category?.description || '',
      color: category?.color || '#e63946',
      icon: category?.icon || '',
      isActive: category?.isActive ?? true,
    },
  });

  const onSubmit = (data: FormData) => {
    const payload = { ...data, description: data.description || undefined, icon: data.icon || undefined };
    if (category) {
      update(payload, {
        onSuccess: () => { toast({ title: 'Category updated' }); onSuccess(); },
        onError: (err) => toast({ variant: 'destructive', title: 'Failed', description: extractApiError(err) }),
      });
    } else {
      create(payload, {
        onSuccess: () => { toast({ title: 'Category created' }); onSuccess(); },
        onError: (err) => toast({ variant: 'destructive', title: 'Failed', description: extractApiError(err) }),
      });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name *</Label>
          <Input id="name" placeholder="Category name" {...register('name')} aria-invalid={!!errors.name} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="color">Color</Label>
          <div className="flex gap-2">
            <input type="color" {...register('color')} className="h-10 w-12 rounded border cursor-pointer" />
            <Input {...register('color')} placeholder="#e63946" className="flex-1" />
          </div>
          {errors.color && <p className="text-xs text-destructive">{errors.color.message}</p>}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Input id="description" placeholder="Optional description" {...register('description')} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="icon">Icon name</Label>
        <Input id="icon" placeholder="e.g. newspaper" {...register('icon')} />
      </div>
      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" {...register('isActive')} className="h-4 w-4" />
        <span className="text-sm">Active (visible on public site)</span>
      </label>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="animate-spin" />}
          {category ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
}

export function AdminCategoriesManager() {
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const { data: categories, isLoading } = useCategories();
  const { mutate: deleteCategory, isPending: isDeleting } = useDeleteCategory();
  const { toast } = useToast();

  const handleDelete = (cat: Category) => {
    if (!confirm(`Delete category "${cat.name}"? This cannot be undone.`)) return;
    deleteCategory(cat._id, {
      onSuccess: () => toast({ title: 'Category deleted' }),
      onError: (err) => toast({ variant: 'destructive', title: 'Failed', description: extractApiError(err) }),
    });
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Button onClick={() => { setShowForm(true); setEditingCategory(null); }}>
          <Plus className="h-4 w-4" />
          New Category
        </Button>
      </div>

      {(showForm || editingCategory) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{editingCategory ? 'Edit Category' : 'New Category'}</CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryForm
              category={editingCategory || undefined}
              onSuccess={handleFormSuccess}
              onCancel={() => { setShowForm(false); setEditingCategory(null); }}
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-14" />)}
            </div>
          ) : (categories || []).length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <p>No categories yet. Create your first category.</p>
            </div>
          ) : (
            <div className="divide-y">
              {(categories || []).map((cat) => (
                <div key={cat._id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0"
                    style={{ backgroundColor: cat.color }}
                    aria-hidden
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{cat.name}</p>
                      {!cat.isActive && <Badge variant="outline" className="text-xs text-muted-foreground">Inactive</Badge>}
                    </div>
                    {cat.description && <p className="text-xs text-muted-foreground truncate">{cat.description}</p>}
                  </div>
                  <div className="text-xs text-muted-foreground flex-shrink-0">
                    {cat.articleCount} articles
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost"
                      onClick={() => { setEditingCategory(cat); setShowForm(false); }}
                      title="Edit category">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(cat)} disabled={isDeleting} title="Delete category">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
