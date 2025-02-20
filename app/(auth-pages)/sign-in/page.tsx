import { signInAction } from "@/app/actions";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

// ログインページのコンポーネント
export default async function Login({
  searchParams,  // URLパラメータ（エラーメッセージやリダイレクト先を含む）
}: {
  searchParams: { message: string; redirect_to?: string }
}) {
  return (
    <form className="flex-1 flex flex-col min-w-64">
      {/* ページタイトル */}
      <h1 className="text-2xl font-medium">Sign in</h1>

      {/* 新規登録ページへのリンク */}
      <p className="text-sm text-foreground">
        Don't have an account?{" "}
        <Link className="text-foreground font-medium underline" href="/sign-up">
          Sign up
        </Link>
      </p>

      <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
        {/* メールアドレス入力フィールド */}
        <Label htmlFor="email">Email</Label>
        <Input name="email" placeholder="you@example.com" required />

        {/* パスワード入力フィールド */}
        <div className="flex justify-between items-center">
          <Label htmlFor="password">Password</Label>
          <Link
            className="text-xs text-foreground underline"
            href="/forgot-password"
          >
            Forgot Password?
          </Link>
        </div>
        <Input
          type="password"
          name="password"
          placeholder="Your password"
          required
        />

        {/* リダイレクト先の設定（非表示フィールド） */}
        <input
          type="hidden"
          name="redirect_to"
          value={searchParams.redirect_to || "/"}
        />

        {/* ログインボタン */}
        <SubmitButton pendingText="Signing In..." formAction={signInAction}>
          Sign in
        </SubmitButton>

        {/* エラーメッセージの表示 */}
        <FormMessage message={searchParams} />
      </div>
    </form>
  );
}
