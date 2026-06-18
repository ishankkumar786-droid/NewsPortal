'use client';

import { type Editor } from '@tiptap/react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link,
  Image,
  Table,
  Undo,
  Redo,
  Highlighter,
  Youtube,
  Minus,
  Code2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ToolbarButtonProps {
  onClick: () => void;
  isActive?: boolean;
  disabled?: boolean;
  label: string;
  children: React.ReactNode;
}

function ToolbarButton({ onClick, isActive, disabled, label, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      aria-pressed={isActive}
      className={cn(
        'p-1.5 rounded hover:bg-accent transition-colors disabled:opacity-40',
        isActive && 'bg-accent text-accent-foreground'
      )}
    >
      {children}
    </button>
  );
}

const ICON_SIZE = 'h-4 w-4';

interface EditorToolbarProps {
  editor: Editor;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addYoutube = () => {
    const url = window.prompt('Enter YouTube URL:');
    if (url) {
      editor.chain().focus().setYoutubeVideo({ src: url }).run();
    }
  };

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  return (
    <div
      className="flex flex-wrap items-center gap-0.5 p-2 border-b bg-muted/30"
      role="toolbar"
      aria-label="Text formatting toolbar"
    >
      {/* History */}
      <div className="flex items-center">
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          label="Undo"
        >
          <Undo className={ICON_SIZE} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          label="Redo"
        >
          <Redo className={ICON_SIZE} />
        </ToolbarButton>
      </div>

      <div className="w-px h-5 bg-border mx-1" aria-hidden />

      {/* Headings */}
      <div className="flex items-center">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          label="Heading 1"
        >
          <Heading1 className={ICON_SIZE} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          label="Heading 2"
        >
          <Heading2 className={ICON_SIZE} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          label="Heading 3"
        >
          <Heading3 className={ICON_SIZE} />
        </ToolbarButton>
      </div>

      <div className="w-px h-5 bg-border mx-1" aria-hidden />

      {/* Text formatting */}
      <div className="flex items-center">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          label="Bold"
        >
          <Bold className={ICON_SIZE} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          label="Italic"
        >
          <Italic className={ICON_SIZE} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          label="Underline"
        >
          <Underline className={ICON_SIZE} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          label="Strikethrough"
        >
          <Strikethrough className={ICON_SIZE} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          isActive={editor.isActive('highlight')}
          label="Highlight"
        >
          <Highlighter className={ICON_SIZE} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          isActive={editor.isActive('code')}
          label="Inline code"
        >
          <Code className={ICON_SIZE} />
        </ToolbarButton>
      </div>

      <div className="w-px h-5 bg-border mx-1" aria-hidden />

      {/* Alignment */}
      <div className="flex items-center">
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          label="Align left"
        >
          <AlignLeft className={ICON_SIZE} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          label="Align center"
        >
          <AlignCenter className={ICON_SIZE} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          label="Align right"
        >
          <AlignRight className={ICON_SIZE} />
        </ToolbarButton>
      </div>

      <div className="w-px h-5 bg-border mx-1" aria-hidden />

      {/* Lists */}
      <div className="flex items-center">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          label="Bullet list"
        >
          <List className={ICON_SIZE} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          label="Ordered list"
        >
          <ListOrdered className={ICON_SIZE} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          label="Blockquote"
        >
          <Quote className={ICON_SIZE} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          isActive={editor.isActive('codeBlock')}
          label="Code block"
        >
          <Code2 className={ICON_SIZE} />
        </ToolbarButton>
        <ToolbarButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          label="Horizontal rule"
        >
          <Minus className={ICON_SIZE} />
        </ToolbarButton>
      </div>

      <div className="w-px h-5 bg-border mx-1" aria-hidden />

      {/* Insert */}
      <div className="flex items-center">
        <ToolbarButton onClick={addLink} isActive={editor.isActive('link')} label="Add link">
          <Link className={ICON_SIZE} />
        </ToolbarButton>
        <ToolbarButton onClick={addImage} label="Add image">
          <Image className={ICON_SIZE} />
        </ToolbarButton>
        <ToolbarButton onClick={addYoutube} label="Embed YouTube">
          <Youtube className={ICON_SIZE} />
        </ToolbarButton>
        <ToolbarButton onClick={addTable} label="Insert table">
          <Table className={ICON_SIZE} />
        </ToolbarButton>
      </div>
    </div>
  );
}
