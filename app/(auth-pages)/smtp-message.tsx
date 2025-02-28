import { ArrowUpRight, InfoIcon } from "lucide-react";
import Link from "next/link";

export function SmtpMessage() {
  return (
    <div className="text-xs text-muted-foreground mt-4 text-center">
      <p>
        確認メールが届かない場合は、迷惑メールフォルダをご確認ください。
      </p>
    </div>
  );
}
