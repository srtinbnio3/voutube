import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "dots" | "pulse" | "wave" | "circle";
  className?: string;
}

export function LoadingSpinner({ 
  size = "md", 
  variant = "default", 
  className 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };

  if (variant === "dots") {
    return (
      <div className={cn("flex space-x-1", className)}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "bg-primary rounded-full animate-pulse",
              size === "sm" ? "h-2 w-2" : size === "md" ? "h-3 w-3" : size === "lg" ? "h-4 w-4" : "h-6 w-6"
            )}
            style={{
              animationDelay: `${i * 0.15}s`,
              animationDuration: "0.8s",
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div
        className={cn(
          "rounded-full bg-primary/20 animate-ping",
          sizeClasses[size],
          className
        )}
      >
        <div
          className={cn(
            "rounded-full bg-primary h-full w-full opacity-75 animate-pulse"
          )}
        />
      </div>
    );
  }

  if (variant === "wave") {
    return (
      <div className={cn("flex items-end space-x-1", className)}>
        {[0, 1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={cn(
              "bg-primary rounded-sm animate-bounce",
              size === "sm" ? "w-1" : size === "md" ? "w-1.5" : size === "lg" ? "w-2" : "w-3"
            )}
            style={{
              height: size === "sm" ? "12px" : size === "md" ? "16px" : size === "lg" ? "20px" : "24px",
              animationDelay: `${i * 0.1}s`,
              animationDuration: "0.6s",
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === "circle") {
    return (
      <div className={cn("relative", sizeClasses[size], className)}>
        <div className="absolute inset-0 rounded-full border-4 border-primary/10" />
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary animate-spin" />
        <div className="absolute inset-2 rounded-full border-2 border-transparent border-r-primary/60 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1.5s" }} />
      </div>
    );
  }

  // Default variant
  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2 border-transparent border-t-primary border-r-primary/30",
        sizeClasses[size],
        className
      )}
    />
  );
}

interface ProgressBarProps {
  progress?: number;
  animated?: boolean;
  className?: string;
}

export function ProgressBar({ progress = 0, animated = true, className }: ProgressBarProps) {
  return (
    <div className={cn("w-full bg-muted rounded-full h-2 overflow-hidden", className)}>
      <div
        className={cn(
          "h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-300 ease-out",
          animated && "animate-gradient-x"
        )}
        style={{ width: `${Math.min(Math.max(progress, 0), 100)}%` }}
      />
    </div>
  );
}

// ブランド一貫性のある背景コンポーネント
interface BrandBackgroundProps {
  className?: string;
  intensity?: "subtle" | "normal" | "vibrant";
}

export function BrandBackground({ className, intensity = "normal" }: BrandBackgroundProps) {
  const intensityConfig = {
    subtle: {
      blur: "blur-2xl",
      opacity: "opacity-30",
      size: "w-64 h-64",
      conic: "w-[400px] h-[400px]"
    },
    normal: {
      blur: "blur-3xl",
      opacity: "opacity-40",
      size: "w-80 h-80",
      conic: "w-[600px] h-[600px]"
    },
    vibrant: {
      blur: "blur-3xl",
      opacity: "opacity-50",
      size: "w-96 h-96",
      conic: "w-[800px] h-[800px]"
    }
  };

  const config = intensityConfig[intensity];

  return (
    <div className={cn("fixed inset-0 -z-10", className)}>
      {/* ベースグラデーション背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-950 dark:via-purple-950/20 dark:to-blue-950/20" />
      
      {/* アニメーション装飾要素 */}
      <div className={cn("absolute top-0 left-1/4 bg-purple-300/30 rounded-full animate-pulse", config.size, config.blur, config.opacity)} />
      <div className={cn("absolute bottom-0 right-1/4 bg-blue-300/30 rounded-full animate-pulse delay-1000", config.size, config.blur, config.opacity)} />
      <div 
        className={cn(
          "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-conic from-purple-400/20 via-blue-400/20 to-purple-400/20 rounded-full animate-spin-slow",
          config.conic,
          config.blur,
          config.opacity
        )}
      />
    </div>
  );
}

interface LoadingContainerProps {
  children?: React.ReactNode;
  message?: string;
  submessage?: string;
  progress?: number;
  showProgress?: boolean;
  variant?: "default" | "minimal" | "detailed";
  className?: string;
  showBackground?: boolean;
  backgroundIntensity?: "subtle" | "normal" | "vibrant";
}

export function LoadingContainer({ 
  children, 
  message, 
  submessage,
  progress,
  showProgress = false,
  variant = "default",
  className,
  showBackground = true,
  backgroundIntensity = "normal"
}: LoadingContainerProps) {
  if (variant === "minimal") {
    return (
      <div className={cn("relative", className)}>
        {showBackground && <BrandBackground intensity={backgroundIntensity} />}
        <div className="relative flex items-center justify-center p-4">
          {children || <LoadingSpinner size="md" variant="dots" />}
          {message && <span className="ml-3 text-sm text-muted-foreground">{message}</span>}
        </div>
      </div>
    );
  }

  if (variant === "detailed") {
    return (
      <div className={cn("relative", className)}>
        {showBackground && <BrandBackground intensity={backgroundIntensity} />}
        <div className="relative flex flex-col items-center justify-center p-8 space-y-6">
          <div className="relative">
            {children || <LoadingSpinner size="xl" variant="circle" />}
            <div className="absolute inset-0 rounded-full bg-primary/5 animate-ping" style={{ animationDuration: "2s" }} />
          </div>
          
          {message && (
            <div className="text-center space-y-2">
              <h3 className="text-lg font-medium text-foreground">{message}</h3>
              {submessage && <p className="text-sm text-muted-foreground">{submessage}</p>}
            </div>
          )}
          
          {showProgress && (
            <div className="w-full max-w-xs space-y-2">
              <ProgressBar progress={progress} animated />
              {typeof progress === "number" && (
                <p className="text-xs text-muted-foreground text-center">{Math.round(progress)}%</p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className={cn("relative", className)}>
      {showBackground && <BrandBackground intensity={backgroundIntensity} />}
      <div className="relative flex flex-col items-center justify-center p-8 space-y-4">
        <div className="relative">
          {children || <LoadingSpinner size="lg" variant="default" />}
        </div>
        
        {message && (
          <div className="text-center space-y-1">
            <p className="text-sm text-muted-foreground">{message}</p>
            {submessage && <p className="text-xs text-muted-foreground/70">{submessage}</p>}
          </div>
        )}
        
        {showProgress && (
          <div className="w-full max-w-xs">
            <ProgressBar progress={progress} animated />
          </div>
        )}
      </div>
    </div>
  );
}

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
}

export function Skeleton({
  className,
  variant = "rectangular",
  width,
  height,
  ...props
}: SkeletonProps) {
  const variantClasses = {
    text: "rounded",
    circular: "rounded-full",
    rectangular: "rounded-md",
  };

  return (
    <div
      className={cn(
        "bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-gradient-x",
        variantClasses[variant],
        className
      )}
      style={{
        width: typeof width === "number" ? `${width}px` : width,
        height: typeof height === "number" ? `${height}px` : height,
      }}
      {...props}
    />
  );
}

// フルページローディング（背景統合版）
export function FullPageLoading({ message = "読み込み中..." }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <BrandBackground intensity="vibrant" />
      <div className="relative bg-card/80 backdrop-blur-md border border-border rounded-lg shadow-2xl">
        <LoadingContainer 
          variant="detailed"
          message={message}
          submessage="少々お待ちください"
          showBackground={false}
          className="min-w-[300px]"
        />
      </div>
    </div>
  );
} 