'use client';

import { useEffect, useState, useCallback } from 'react';
import { api } from '@/lib/axios';
import {
  Mail,
  User,
  Clock,
  Trash2,
  CheckCircle,
  Circle,
  Loader2,
  Inbox,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ContactSubmission {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [selectedContact, setSelectedContact] = useState<ContactSubmission | null>(null);

  const fetchContacts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/contact?page=${page}&limit=15`);
      setContacts(data.data.contacts);
      setPagination(data.pagination);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load contacts');
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const toggleRead = async (id: string) => {
    try {
      await api.patch(`/contact/${id}/read`);
      setContacts((prev) =>
        prev.map((c) => (c._id === id ? { ...c, isRead: !c.isRead } : c))
      );
      if (selectedContact?._id === id) {
        setSelectedContact((prev) => prev ? { ...prev, isRead: !prev.isRead } : prev);
      }
    } catch {
      // silent
    }
  };

  const deleteContact = async (id: string) => {
    if (!confirm('Are you sure you want to delete this contact submission?')) return;
    try {
      await api.delete(`/contact/${id}`);
      setContacts((prev) => prev.filter((c) => c._id !== id));
      if (selectedContact?._id === id) setSelectedContact(null);
    } catch {
      // silent
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const unreadCount = contacts.filter((c) => !c.isRead).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-serif">Contact Submissions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {pagination?.total ?? 0} total submissions{unreadCount > 0 && ` · ${unreadCount} unread`}
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/10 text-red-700 dark:text-red-400 rounded-xl border border-red-500/20">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : contacts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <Inbox className="h-12 w-12 mb-4" />
          <p className="text-lg font-medium">No contact submissions yet</p>
          <p className="text-sm mt-1">Submissions from the contact form will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* List */}
          <div className="lg:col-span-1 space-y-2 max-h-[70vh] overflow-y-auto pr-1">
            {contacts.map((contact) => (
              <button
                key={contact._id}
                onClick={() => setSelectedContact(contact)}
                className={cn(
                  'w-full text-left p-4 rounded-xl border transition-colors',
                  selectedContact?._id === contact._id
                    ? 'bg-news-red/10 border-news-red/30'
                    : 'bg-card hover:bg-muted border-border',
                  !contact.isRead && 'border-l-4 border-l-news-red'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className={cn('text-sm truncate', !contact.isRead && 'font-bold')}>
                      {contact.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{contact.subject}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(contact.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              </button>
            ))}

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={!pagination.hasPrevPage}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!pagination.hasNextPage}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Detail view */}
          <div className="lg:col-span-2">
            {selectedContact ? (
              <div className="bg-card border border-border rounded-2xl p-6 md:p-8 space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold font-serif">{selectedContact.subject}</h2>
                    <div className="flex items-center gap-3 mt-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <User className="h-3.5 w-3.5" />
                        {selectedContact.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" />
                        <a href={`mailto:${selectedContact.email}`} className="hover:text-news-red transition-colors">
                          {selectedContact.email}
                        </a>
                      </span>
                    </div>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(selectedContact.createdAt)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => toggleRead(selectedContact._id)}
                      title={selectedContact.isRead ? 'Mark as unread' : 'Mark as read'}
                    >
                      {selectedContact.isRead ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <Circle className="h-4 w-4 text-muted-foreground" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteContact(selectedContact._id)}
                      title="Delete"
                      className="hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <hr className="border-border" />

                <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
                  {selectedContact.message}
                </div>

                <div className="pt-4">
                  <a
                    href={`mailto:${selectedContact.email}?subject=Re: ${encodeURIComponent(selectedContact.subject)}`}
                    className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-news-red text-white font-semibold hover:bg-news-red/90 transition-colors text-sm"
                  >
                    <Mail className="h-4 w-4" />
                    Reply via Email
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground bg-card border border-border rounded-2xl">
                <Mail className="h-10 w-10 mb-3" />
                <p className="text-sm font-medium">Select a message to read</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
