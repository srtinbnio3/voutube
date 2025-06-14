import { Share2, Link as LinkIcon } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ShareButtonProps {
  onShare: (type: 'x' | 'copy') => void
  className?: string
}

export function ShareButton({ onShare, className }: ShareButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn(
            "backdrop-blur-sm bg-white/70 dark:bg-slate-800/70 hover:bg-white/90 dark:hover:bg-slate-800/90 border-0 shadow-lg transition-all duration-200 h-9 w-9",
            className
          )}
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="backdrop-blur-sm bg-white/90 dark:bg-slate-800/90 border-white/20 dark:border-slate-700/50 shadow-xl"
      >
        <DropdownMenuItem onClick={() => onShare('x')} className="hover:bg-white/50 dark:hover:bg-slate-700/50">
          <svg
            viewBox="0 0 24 24"
            aria-hidden="true"
            className="mr-2 h-4 w-4 fill-current"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          Xでシェア
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onShare('copy')} className="hover:bg-white/50 dark:hover:bg-slate-700/50">
          <LinkIcon className="mr-2 h-4 w-4" />
          リンクをコピー
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 