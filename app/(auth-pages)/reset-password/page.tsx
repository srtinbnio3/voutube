import { resetPasswordAction } from "@/app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

// パスワードリセットページのコンポーネント
// searchParams: URLパラメータからメッセージを受け取る（エラーメッセージなど）
export default async function ResetPassword(props: {
  searchParams: Promise<Message>
}) {
  // 認証状態をチェック
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // すでにログインしている場合は、トップページにリダイレクト
  if (user) {
    redirect('/');
  }

  // URLパラメータから非同期でメッセージを取得
  const searchParams = await props.searchParams

  return (
    // パスワードリセット用のフォーム
    // max-w-md: 最大幅を設定
    // [&>input]:mb-4: フォーム内の入力欄の下に余白を設定
    <form className="flex flex-col w-full max-w-md p-4 gap-2 [&>input]:mb-4 mt-12">
      {/* ページのタイトル */}
      <h1 className="text-2xl font-medium">パスワードの再設定</h1>
      {/* 説明文 */}
      <p className="text-sm text-foreground/60">
        新しいパスワードを入力してください。
      </p>
      {/* 新しいパスワードの入力欄 */}
      <Label htmlFor="password">新しいパスワード</Label>
      <Input
        type="password"
        name="password"
        placeholder="新しいパスワードを入力"
        required  // 必須入力
      />
      {/* パスワード確認用の入力欄 */}
      <Label htmlFor="confirmPassword">パスワードの確認</Label>
      <Input
        type="password"
        name="confirmPassword"
        placeholder="新しいパスワードを再入力"
        required  // 必須入力
      />
      {/* 送信ボタン */}
      {/* resetPasswordAction: パスワードリセットの処理を実行する関数 */}
      <SubmitButton formAction={resetPasswordAction}>
        パスワードを変更
      </SubmitButton>
      {/* エラーメッセージなどを表示するコンポーネント */}
      <FormMessage message={searchParams} />
    </form>
  );
}
