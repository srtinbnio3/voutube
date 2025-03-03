import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({ size = "md", className }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-5 w-5 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-t-transparent border-primary",
        sizeClasses[size],
        className
      )}
    />
  );
}

interface LoadingContainerProps {
  children?: React.ReactNode;
  message?: string;
  className?: string;
}

export function LoadingContainer({ children, message, className }: LoadingContainerProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center p-8", className)}>
      {children || <LoadingSpinner size="lg" />}
      {message && <p className="mt-4 text-muted-foreground text-sm">{message}</p>}
    </div>
  );
} 