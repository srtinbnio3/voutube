"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { uploadProfileImageAction } from "@/app/actions/profile";
import { FaCamera } from "react-icons/fa";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface AvatarUploadProps {
  initialAvatarUrl: string | null;
  username: string;
  onAvatarChange: (url: string) => void;
}

export function AvatarUpload({ initialAvatarUrl, username, onAvatarChange }: AvatarUploadProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [previewImage, setPreviewImage] = useState<HTMLImageElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  // ユーザー名の頭文字を取得（アバターのフォールバック用）
  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  // 画像選択ダイアログを開く
  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  // プレビュー画像の描画
  const drawPreview = () => {
    if (!previewImage) return;
    
    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // キャンバスサイズを設定
    const canvasSize = 300;
    canvas.width = canvasSize;
    canvas.height = canvasSize;

    // 背景を白で塗りつぶす
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // 画像のアスペクト比を計算
    const aspectRatio = previewImage.width / previewImage.height;

    // 画像のサイズを計算（短い辺をキャンバスサイズに合わせる）
    let sourceWidth = previewImage.width;
    let sourceHeight = previewImage.height;
    
    // ズームに基づいて表示サイズを計算
    let targetWidth = canvasSize * zoom;
    let targetHeight = canvasSize * zoom;

    if (aspectRatio > 1) {
      // 横長の画像
      targetHeight = targetWidth / aspectRatio;
    } else {
      // 縦長の画像
      targetWidth = targetHeight * aspectRatio;
    }

    // 中央に配置するための開始位置を計算
    const x = (canvasSize - targetWidth) / 2;
    const y = (canvasSize - targetHeight) / 2;

    // 画像を描画
    ctx.drawImage(
      previewImage,
      0,
      0,
      sourceWidth,
      sourceHeight,
      x,
      y,
      targetWidth,
      targetHeight
    );
  };

  // useEffectでpreviewUrlが変更されたときにpreviewImageを設定
  useEffect(() => {
    if (previewUrl) {
      const img = new Image();
      img.src = previewUrl;
      img.onload = () => {
        setPreviewImage(img);
      };
    } else {
      setPreviewImage(null);
    }
  }, [previewUrl]);

  // useEffectでpreviewImageまたはzoomが変更されたときに画像を描画
  useEffect(() => {
    if (previewImage && isPreviewOpen) {
      // 次のレンダリングサイクルで描画（DOMの更新後）
      const timer = setTimeout(() => {
        drawPreview();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [previewImage, zoom, isPreviewOpen]);

  // 画像が選択されたときの処理
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // ファイル形式チェック
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("JPG、PNG、GIF、WebP形式の画像のみアップロード可能です");
      return;
    }

    setIsUploading(true);

    // プレビュー表示
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
      setIsPreviewOpen(true);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  // プレビューを閉じる
  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setZoom(1);
    // previewUrlはアップロード後にアバターに使用するため、ここではクリアしない
  };

  // 画像をアップロード
  const handleUpload = async () => {
    if (!previewUrl || !previewImage) return;

    setIsUploading(true);
    try {
      // プレビューのキャンバスから画像データを取得
      const canvas = previewCanvasRef.current;
      if (!canvas) {
        toast.error("画像の取得に失敗しました");
        return;
      }

      // キャンバスからBlob形式で画像を取得
      const blob = await new Promise<Blob | null>((resolve) => {
        canvas.toBlob((blob) => resolve(blob), 'image/webp', 0.8);
      });

      if (!blob) {
        toast.error("画像の処理に失敗しました");
        return;
      }

      // Blobからファイルを作成
      const file = new File([blob], "profile-image.webp", { 
        type: "image/webp",
        lastModified: Date.now()
      });
      
      // 圧縮後のファイルサイズチェック
      if (file.size > 5 * 1024 * 1024) {
        toast.error("画像の圧縮に失敗しました。別の画像をお試しください");
        return;
      }

      // アップロード処理
      const formData = new FormData();
      formData.append("image", file);
      
      const result = await uploadProfileImageAction(formData);
      
      if (result.error) {
        toast.error(result.error);
        return;
      }

      // キャンバスのデータURLを取得
      const dataUrl = canvas.toDataURL('image/webp', 0.8);

      // プレビューを閉じる
      handleClosePreview();
      
      // アバターURLを更新（プレビューで表示されたものと同じ画像を使用）
      setAvatarUrl(dataUrl);
      onAvatarChange(dataUrl);
    } catch (error) {
      console.error("画像アップロードエラー:", error);
      toast.error("画像のアップロードに失敗しました");
    } finally {
      setIsUploading(false);
    }
  };

  // ズーム変更時の処理
  const handleZoomChange = (value: number[]) => {
    setZoom(value[0]);
  };

  // プレビューダイアログが開かれたときの処理
  const handlePreviewOpenChange = (open: boolean) => {
    if (!open) {
      handleClosePreview();
    } else {
      setIsPreviewOpen(open);
    }
  };

  // 画像圧縮関数
  const compressImage = async (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context could not be created'));
            return;
          }

          // 最大サイズを設定（より小さく）
          const maxSize = 300; // 400から300に変更
          let width = img.width;
          let height = img.height;

          // アスペクト比を維持しながらリサイズ
          const aspectRatio = width / height;
          let targetWidth = maxSize;
          let targetHeight = maxSize;

          if (aspectRatio > 1) {
            // 横長の画像
            targetWidth = maxSize;
            targetHeight = Math.round(maxSize / aspectRatio);
          } else {
            // 縦長の画像
            targetHeight = maxSize;
            targetWidth = Math.round(maxSize * aspectRatio);
          }

          // キャンバスサイズを設定
          canvas.width = maxSize;
          canvas.height = maxSize;

          // 背景を白で塗りつぶす
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, maxSize, maxSize);

          // 中央に配置するための計算
          const x = (maxSize - targetWidth) / 2;
          const y = (maxSize - targetHeight) / 2;

          // 画像を描画（中央配置）
          ctx.drawImage(
            img,
            0,
            0,
            width,
            height,
            x,
            y,
            targetWidth,
            targetHeight
          );

          // 段階的な圧縮を試みる
          const compressWithQuality = (quality: number): Promise<File> => {
            return new Promise((resolveQuality, rejectQuality) => {
              canvas.toBlob(
                (blob) => {
                  if (!blob) {
                    rejectQuality(new Error('Failed to compress image'));
                    return;
                  }
                  const compressedFile = new File([blob], file.name, {
                    type: 'image/webp',
                    lastModified: Date.now(),
                  });
                  resolveQuality(compressedFile);
                },
                'image/webp',
                quality
              );
            });
          };

          // 品質を段階的に下げながら圧縮を試みる
          const qualities = [0.8, 0.6, 0.4, 0.2];
          let currentQualityIndex = 0;

          const tryCompress = async () => {
            try {
              const compressedFile = await compressWithQuality(qualities[currentQualityIndex]);
              if (compressedFile.size <= 5 * 1024 * 1024) {
                resolve(compressedFile);
              } else if (currentQualityIndex < qualities.length - 1) {
                currentQualityIndex++;
                await tryCompress();
              } else {
                reject(new Error('Failed to compress image to required size'));
              }
            } catch (error) {
              reject(error);
            }
          };

          tryCompress();
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Avatar className="w-24 h-24">
          <AvatarImage 
            src={avatarUrl || undefined} 
            alt={username} 
          />
          <AvatarFallback className="text-2xl">{getInitials(username)}</AvatarFallback>
        </Avatar>
        <Button
          type="button"
          size="icon"
          variant="secondary"
          className="absolute bottom-0 right-0 rounded-full w-8 h-8"
          onClick={handleButtonClick}
          disabled={isUploading}
          title="プロフィール画像を変更"
        >
          <FaCamera className="h-4 w-4" />
        </Button>
      </div>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/jpeg,image/png,image/gif,image/webp"
        onChange={handleFileSelect}
        disabled={isUploading}
      />

      {/* プレビューダイアログ */}
      <Dialog open={isPreviewOpen} onOpenChange={handlePreviewOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>プロフィール画像のプレビュー</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <canvas
              ref={previewCanvasRef}
              className="w-[300px] h-[300px] border rounded-lg"
            />
            <div className="w-full space-y-2">
              <Label htmlFor="zoom">ズーム</Label>
              <Slider
                id="zoom"
                min={0.5}
                max={2}
                step={0.1}
                value={[zoom]}
                onValueChange={handleZoomChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleClosePreview}>
              キャンセル
            </Button>
            <Button onClick={handleUpload} disabled={isUploading}>
              {isUploading ? "アップロード中..." : "アップロード"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 