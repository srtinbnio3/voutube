"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AuthDialog({ open, onOpenChange }: AuthDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-bold">
            ログインしてね😉
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col items-center space-y-4 py-4">
          <p className="text-center text-sm text-muted-foreground">
            その操作にはログインが必要です😎
          </p>
          
          <div className="relative h-60 w-full">
            <Image
              src="/images/SignUpGif.gif"
              alt="ログイン"
              fill
              className="object-contain"
              priority
            />
          </div>
          
          <div className="flex w-full flex-col gap-2 sm:flex-row">
            <Button asChild className="flex-1" variant="default">
              <Link href="/sign-in">ログイン</Link>
            </Button>
            <Button asChild className="flex-1" variant="outline">
              <Link href="/sign-up">新規登録</Link>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 