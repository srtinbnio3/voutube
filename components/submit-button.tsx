"use client";

import { Button } from "@/components/ui/button";
import { type ComponentProps } from "react";
import { useFormStatus } from "react-dom";
import { LoadingSpinner } from "./ui/loading-spinner";

type Props = ComponentProps<typeof Button> & {
  pendingText?: string;
  showSpinner?: boolean;
};

export function SubmitButton({
  children,
  pendingText = "Submitting...",
  showSpinner = true,
  ...props
}: Props) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" aria-disabled={pending} disabled={pending} {...props}>
      {pending ? (
        <div className="flex items-center gap-2">
          {showSpinner && <LoadingSpinner size="sm" className="mr-2" />}
          {pendingText}
        </div>
      ) : (
        children
      )}
    </Button>
  );
}
