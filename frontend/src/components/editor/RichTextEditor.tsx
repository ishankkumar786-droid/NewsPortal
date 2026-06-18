'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Highlight from '@tiptap/extension-highlight';
import CharacterCount from '@tiptap/extension-character-count';
import Youtube from '@tiptap/extension-youtube';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import { EditorToolbar } from './EditorToolbar';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: number;
  maxLength?: number;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = 'Start writing your article...',
  className,
  minHeight = 400,
  maxLength = 100000,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: { keepMarks: true, keepAttributes: false },
        orderedList: { keepMarks: true, keepAttributes: false },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          target: '_blank',
        },
        validate: (href) => /^https?:\/\//.test(href),
      }),
      Image.configure({
        HTMLAttributes: { class: 'rounded-lg max-w-full' },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Highlight.configure({ multicolor: true }),
      CharacterCount.configure({ limit: maxLength }),
      Youtube.configure({
        controls: true,
        HTMLAttributes: { class: 'w-full aspect-video rounded-lg' },
      }),
      Table.configure({ resizable: true }),
      TableRow,
      TableCell,
      TableHeader,
    ],
    content,
    editorProps: {
      attributes: {
        class: 'ProseMirror',
        'data-placeholder': placeholder,
        'aria-label': 'Article content editor',
        role: 'textbox',
        'aria-multiline': 'true',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  const charCount = editor.storage.characterCount?.characters() || 0;

  return (
    <div
      className={cn(
        'border rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-ring',
        className
      )}
    >
      <EditorToolbar editor={editor} />

      <div
        className="overflow-y-auto"
        style={{ minHeight: `${minHeight}px`, maxHeight: '70vh' }}
      >
        <EditorContent editor={editor} />
      </div>

      {/* Character count */}
      <div className="border-t px-4 py-2 flex justify-between items-center bg-muted/30">
        <span className="text-xs text-muted-foreground">
          {charCount.toLocaleString()} / {maxLength.toLocaleString()} characters
        </span>
        {charCount > maxLength * 0.9 && (
          <span className="text-xs text-destructive font-medium">
            {maxLength - charCount} characters remaining
          </span>
        )}
      </div>
    </div>
  );
}
