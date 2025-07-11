'use client'

import { useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { Button } from '@/components/ui/button'
import { 
  Bold, 
  Italic, 
  List, 
  ListOrdered, 
  Quote, 
  Link as LinkIcon,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
  className?: string
}

export function RichTextEditor({ content, onChange, placeholder, className }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline cursor-pointer',
        },
      }),
      Placeholder.configure({
        placeholder: placeholder || 'ここに入力してください...',
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[200px] p-4 dark:prose-invert prose-headings:font-bold prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-a:text-blue-500 prose-a:underline prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic dark:prose-blockquote:border-gray-600',
      },
    },
  })

  // コンテンツが変更されたときにエディタの内容を更新
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!editor) {
    return null
  }

  const toggleLink = () => {
    const url = window.prompt('リンクURLを入力してください:')
    if (url) {
      editor.chain().focus().setLink({ href: url }).run()
    }
  }

  return (
    <div className={cn('border rounded-md flex flex-col h-[500px]', className)}>
      {/* ツールバー */}
      <div className="flex-shrink-0 bg-background border-b p-2 flex flex-wrap gap-1 sm:gap-2 shadow-sm">
        {/* テキスト装飾 */}
        <Button
          type="button"
          variant={editor.isActive('bold') ? 'default' : 'ghost'}
          size="sm"
          className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
        
        <Button
          type="button"
          variant={editor.isActive('italic') ? 'default' : 'ghost'}
          size="sm"
          className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>

        <div className="w-px h-4 sm:h-6 bg-border mx-0.5 sm:mx-1" />

        {/* 見出し */}
        <Button
          type="button"
          variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
          size="sm"
          className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
        
        <Button
          type="button"
          variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
          size="sm"
          className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
        
        <Button
          type="button"
          variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
          size="sm"
          className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>

        <div className="w-px h-4 sm:h-6 bg-border mx-0.5 sm:mx-1" />

        {/* リスト */}
        <Button
          type="button"
          variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
          size="sm"
          className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
        
        <Button
          type="button"
          variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
          size="sm"
          className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>

        <div className="w-px h-4 sm:h-6 bg-border mx-0.5 sm:mx-1" />

        {/* 引用・リンク */}
        <Button
          type="button"
          variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
          size="sm"
          className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
        
        <Button
          type="button"
          variant={editor.isActive('link') ? 'default' : 'ghost'}
          size="sm"
          className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
          onClick={toggleLink}
        >
          <LinkIcon className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>

        <div className="w-px h-4 sm:h-6 bg-border mx-0.5 sm:mx-1" />

        {/* 元に戻す・やり直し */}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
        
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 sm:h-9 sm:w-auto sm:px-3"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </div>

      {/* エディタ領域 */}
      <div className="flex-1 overflow-y-auto min-h-[300px]">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
} 