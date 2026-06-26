'use client';

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { Loader2, Save, X, Upload, Image as ImageIcon, ChevronDown } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RichTextEditor } from '@/components/editor/RichTextEditor';
import { useCategories } from '@/hooks/useCategories';
import { useCreateArticle, useUpdateArticle, useUploadFeaturedImage } from '@/hooks/useArticles';
import { useToast } from '@/hooks/use-toast';
import { extractApiError } from '@/lib/utils';
import type { Article } from '@/types';

const schema = z.object({
  title: z.string().min(10, 'Title must be at least 10 characters').max(300),
  summary: z.string().min(20, 'Summary must be at least 20 characters').max(500),
  content: z.string().min(50, 'Content must be at least 50 characters'),
  category: z.string().min(1, 'Category is required'),
  tags: z.array(z.string()).max(20),
  videoUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  isBreaking: z.boolean(),
  isFeatured: z.boolean(),
  seoTitle: z.string().max(70).optional().or(z.literal('')),
  seoDescription: z.string().max(160).optional().or(z.literal('')),
});

type FormData = z.infer<typeof schema>;

interface ArticleFormProps {
  article?: Article;
  isAdmin?: boolean;
}

export function ArticleForm({ article, isAdmin = false }: ArticleFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { data: categories } = useCategories();
  const [tagInput, setTagInput] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(article?.featuredImage?.url || null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [seoOpen, setSeoOpen] = useState(false);

  const { mutate: createArticle, isPending: isCreating } = useCreateArticle();
  const { mutate: updateArticle, isPending: isUpdating } = useUpdateArticle(article?._id || '');
  const { mutate: uploadImage, isPending: isUploadingImage } = useUploadFeaturedImage();

  const isEditing = !!article;
  const isPending = isCreating || isUpdating;

  const { register, handleSubmit, control, watch, setValue, getValues, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: article?.title || '',
      summary: article?.summary || '',
      content: article?.content || '',
      category: article?.category?._id || '',
      tags: article?.tags || [],
      videoUrl: article?.videoUrl || '',
      isBreaking: article?.isBreaking || false,
      isFeatured: article?.isFeatured || false,
      seoTitle: article?.seoTitle || '',
      seoDescription: article?.seoDescription || '',
    },
  });

  const tags = watch('tags');

  const handleAddTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag) && tags.length < 20) {
      setValue('tags', [...tags, tag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setValue('tags', tags.filter((t) => t !== tag));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const saveAsDraft = () => {
    handleSubmit((data) => submitForm(data))();
  };

  const submitForm = (data: FormData) => {
    const payload = {
      ...data,
      videoUrl: data.videoUrl || undefined,
      seoTitle: data.seoTitle || undefined,
      seoDescription: data.seoDescription || undefined,
    };

    if (isEditing) {
      updateArticle(payload, {
        onSuccess: (updated) => {
          if (imageFile) {
            uploadImage({ articleId: updated._id, file: imageFile }, {
              onSuccess: () => {
                toast({ title: 'Article saved' });
                router.push(isAdmin ? '/admin/articles' : '/reporter/articles');
              },
              onError: (err) => toast({ variant: 'destructive', title: 'Image upload failed', description: extractApiError(err) }),
            });
          } else {
            toast({ title: 'Article saved' });
            router.push(isAdmin ? '/admin/articles' : '/reporter/articles');
          }
        },
        onError: (err) => toast({ variant: 'destructive', title: 'Save failed', description: extractApiError(err) }),
      });
    } else {
      createArticle(payload, {
        onSuccess: (created) => {
          if (imageFile) {
            uploadImage({ articleId: created._id, file: imageFile }, {
              onSuccess: () => {
                toast({ title: isAdmin ? 'Article created and approved' : 'Article created as draft' });
                router.push(isAdmin ? '/admin/articles' : '/reporter/articles');
              },
              onError: (err) => toast({ variant: 'destructive', title: 'Image upload failed', description: extractApiError(err) }),
            });
          } else {
            toast({ title: isAdmin ? 'Article created and approved' : 'Article created as draft' });
            router.push(isAdmin ? '/admin/articles' : '/reporter/articles');
          }
        },
        onError: (err) => toast({ variant: 'destructive', title: 'Create failed', description: extractApiError(err) }),
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">{isEditing ? 'Edit Article' : 'Write New Article'}</h1>
          {article && (
            <p className="text-sm text-muted-foreground mt-1">
              Status: <span className="font-medium capitalize">{article.status.replace('_', ' ')}</span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button variant="outline" onClick={saveAsDraft} disabled={isPending}>
            {isPending ? <Loader2 className="animate-spin" /> : <Save className="h-4 w-4" />}
            {isAdmin ? 'Save & Approve' : 'Save Draft'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input id="title" placeholder="Enter article title..." {...register('title')} aria-invalid={!!errors.title} />
                {errors.title && <p className="text-sm text-destructive" role="alert">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary">Summary *</Label>
                <textarea
                  id="summary"
                  rows={3}
                  placeholder="Brief summary of the article..."
                  {...register('summary')}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  aria-invalid={!!errors.summary}
                />
                {errors.summary && <p className="text-sm text-destructive" role="alert">{errors.summary.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Content *</Label>
                <Controller
                  name="content"
                  control={control}
                  render={({ field }) => (
                    <RichTextEditor
                      content={field.value}
                      onChange={field.onChange}
                      placeholder="Write your article content here..."
                    />
                  )}
                />
                {errors.content && <p className="text-sm text-destructive" role="alert">{errors.content.message}</p>}
              </div>
            </CardContent>
          </Card>

          {/* SEO */}
          <Card>
            <button
              type="button"
              onClick={() => setSeoOpen((v) => !v)}
              className="w-full flex items-center justify-between px-6 py-4 text-left"
            >
              <span className="text-base font-semibold">SEO Settings <span className="text-xs font-normal text-muted-foreground">(optional)</span></span>
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${seoOpen ? 'rotate-180' : ''}`} />
            </button>
            {seoOpen && (
              <CardContent className="space-y-4 pt-0">
                <div className="space-y-2">
                  <Label htmlFor="seoTitle">SEO Title <span className="text-muted-foreground text-xs">(max 70 chars)</span></Label>
                  <Input id="seoTitle" placeholder="Leave blank to use article title" {...register('seoTitle')} />
                  {errors.seoTitle && <p className="text-sm text-destructive">{errors.seoTitle.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="seoDescription">SEO Description <span className="text-muted-foreground text-xs">(max 160 chars)</span></Label>
                  <textarea
                    id="seoDescription"
                    rows={2}
                    placeholder="Leave blank to use article summary"
                    {...register('seoDescription')}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  />
                  {errors.seoDescription && <p className="text-sm text-destructive">{errors.seoDescription.message}</p>}
                </div>
              </CardContent>
            )}
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Featured Image */}
          <Card>
            <CardHeader><CardTitle className="text-base">Featured Image</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {imagePreview ? (
                <div className="relative aspect-video rounded-lg overflow-hidden bg-muted">
                  <Image src={imagePreview} alt="Featured" fill className="object-cover" sizes="300px" />
                  <button
                    type="button"
                    onClick={() => { setImagePreview(null); setImageFile(null); }}
                    className="absolute top-2 right-2 bg-black/60 text-white rounded-full p-1 hover:bg-black/80"
                    aria-label="Remove image"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="aspect-video rounded-lg border-2 border-dashed flex items-center justify-center bg-muted/30">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <label className="cursor-pointer">
                <Button type="button" variant="outline" size="sm" className="w-full" asChild>
                  <span>
                    <Upload className="h-4 w-4" />
                    {imagePreview ? 'Change Image' : 'Upload Image'}
                  </span>
                </Button>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
              </label>
              {isUploadingImage && <p className="text-xs text-muted-foreground flex items-center gap-1"><Loader2 className="h-3 w-3 animate-spin" />Uploading...</p>}
            </CardContent>
          </Card>

          {/* Category */}
          <Card>
            <CardHeader><CardTitle className="text-base">Category *</CardTitle></CardHeader>
            <CardContent>
              <select
                {...register('category')}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                aria-invalid={!!errors.category}
              >
                <option value="">Select category...</option>
                {(categories || []).map((cat) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
              {errors.category && <p className="text-sm text-destructive mt-1" role="alert">{errors.category.message}</p>}
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader><CardTitle className="text-base">Tags</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Add tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                />
                <Button type="button" variant="outline" size="sm" onClick={handleAddTag}>Add</Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="gap-1 text-xs">
                      {tag}
                      <button type="button" onClick={() => handleRemoveTag(tag)} aria-label={`Remove tag ${tag}`}>
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Options */}
          <Card>
            <CardHeader><CardTitle className="text-base">Options</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" {...register('isBreaking')} className="h-4 w-4 rounded border-input" />
                <div>
                  <p className="text-sm font-medium">Breaking News</p>
                  <p className="text-xs text-muted-foreground">Show in breaking news ticker</p>
                </div>
              </label>
              {isAdmin && (
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" {...register('isFeatured')} className="h-4 w-4 rounded border-input" />
                  <div>
                    <p className="text-sm font-medium">Featured Article</p>
                    <p className="text-xs text-muted-foreground">Show in hero section</p>
                  </div>
                </label>
              )}
              <div className="space-y-2">
                <Label htmlFor="videoUrl">Video URL</Label>
                <Input id="videoUrl" type="url" placeholder="https://youtube.com/watch?v=..." {...register('videoUrl')} />
                {errors.videoUrl && <p className="text-sm text-destructive">{errors.videoUrl.message}</p>}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
