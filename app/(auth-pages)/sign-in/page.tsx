import { signInAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";

// ログインページのコンポーネント
export default async function Login(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;

  return (
    <form className="flex-1 flex flex-col min-w-64">
      {/* ページタイトル */}
      <h1 className="text-2xl font-medium">ログイン</h1>

      {/* 新規登録ページへのリンク */}
      <p className="text-sm text-foreground">
        アカウントをお持ちでないですか？{" "}
        <Link className="text-foreground font-medium underline" href="/sign-up">
          新規登録
        </Link>
      </p>

      <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
        {/* メールアドレス入力フィールド */}
        <Label htmlFor="email">メールアドレス</Label>
        <Input name="email" placeholder="you@example.com" required />

        {/* パスワード入力フィールド */}
        <div className="flex justify-between items-center">
          <Label htmlFor="password">パスワード</Label>
          <Link
            className="text-xs text-foreground underline"
            href="/forgot-password"
          >
            パスワードをお忘れですか？
          </Link>
        </div>
        <Input
          type="password"
          name="password"
          placeholder="パスワードを入力"
          required
        />

        {/* リダイレクト先の設定（非表示フィールド） */}
        <input
          type="hidden"
          name="redirect_to"
          value={(searchParams as any).redirect_to || "/channels"}
        />

        {/* ログインボタン */}
        <SubmitButton pendingText="ログイン中..." formAction={signInAction}>
          ログイン
        </SubmitButton>

        {/* エラーメッセージの表示 */}
        <FormMessage message={searchParams} />
      </div>
    </form>
  );
}
