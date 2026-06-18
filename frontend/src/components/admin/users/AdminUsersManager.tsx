'use client';

import { useState } from 'react';
import { Plus, UserX, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { extractApiError, formatDate, getInitials } from '@/lib/utils';
import api from '@/lib/axios';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { User } from '@/types';

const reporterSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
});

type ReporterFormData = z.infer<typeof reporterSchema>;

function useUsers(role?: string) {
  return useQuery({
    queryKey: ['users', role],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (role) params.set('role', role);
      const res = await api.get<{ data: { users: User[] } }>(`/users?${params}&limit=50`);
      return res.data.data?.users || [];
    },
  });
}

function useCreateReporter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: ReporterFormData) => {
      await api.post('/users/reporters', data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
}

function useDeactivateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/users/${id}/deactivate`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });
}

function CreateReporterForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const { mutate, isPending } = useCreateReporter();
  const { toast } = useToast();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<ReporterFormData>({
    resolver: zodResolver(reporterSchema),
  });

  const onSubmit = (data: ReporterFormData) => {
    mutate(data, {
      onSuccess: () => { toast({ title: 'Reporter account created' }); reset(); onSuccess(); },
      onError: (err) => toast({ variant: 'destructive', title: 'Failed', description: extractApiError(err) }),
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name *</Label>
          <Input id="name" placeholder="Reporter name" {...register('name')} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" type="email" placeholder="reporter@example.com" {...register('email')} />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Temporary Password *</Label>
        <Input id="password" type="password" placeholder="Min 8 characters" {...register('password')} />
        {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="animate-spin" />}
          Create Reporter
        </Button>
      </div>
    </form>
  );
}

export function AdminUsersManager() {
  const [showForm, setShowForm] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>('reporter');
  const { data: users, isLoading } = useUsers(roleFilter === 'all' ? undefined : roleFilter);
  const { mutate: deactivate, isPending: isDeactivating } = useDeactivateUser();
  const { toast } = useToast();

  const handleDeactivate = (user: User) => {
    if (!confirm(`Deactivate account for "${user.name}"?`)) return;
    deactivate(user._id, {
      onSuccess: () => toast({ title: 'User deactivated' }),
      onError: (err) => toast({ variant: 'destructive', title: 'Failed', description: extractApiError(err) }),
    });
  };

  const roleLabels: Record<string, string> = { all: 'All Users', reporter: 'Reporters', super_admin: 'Admins' };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Users Management</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4" />
          Add Reporter
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader><CardTitle className="text-base">Create Reporter Account</CardTitle></CardHeader>
          <CardContent>
            <CreateReporterForm onSuccess={() => setShowForm(false)} onCancel={() => setShowForm(false)} />
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2">
        {Object.entries(roleLabels).map(([key, label]) => (
          <button key={key} onClick={() => setRoleFilter(key)}
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${roleFilter === key ? 'bg-primary text-white' : 'bg-muted hover:bg-muted/80'}`}>
            {label}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16" />)}
            </div>
          ) : (users || []).length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">No users found</div>
          ) : (
            <div className="divide-y">
              {(users || []).map((user) => (
                <div key={user._id} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                    ) : getInitials(user.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{user.name}</p>
                      <Badge variant="outline" className="text-xs capitalize">{user.role.replace('_', ' ')}</Badge>
                      {!user.isActive && <Badge variant="destructive" className="text-xs">Inactive</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                    <p className="text-xs text-muted-foreground">Joined {formatDate(user.createdAt)}</p>
                  </div>
                  {user.isActive && user.role !== 'super_admin' && (
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive"
                      onClick={() => handleDeactivate(user)} disabled={isDeactivating} title="Deactivate user">
                      <UserX className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
